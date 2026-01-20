import { db, hospitals, type HospitalInsert } from "../db";
import { eq, and, sql } from "drizzle-orm";

// Overpass API endpoint
const OVERPASS_API = "https://overpass-api.de/api/interpreter";

// Chile bounding box (approximate)
const CHILE_BBOX = {
  south: -56.0,
  west: -110.0,
  north: -17.0,
  east: -66.0,
};

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    "name:es"?: string;
    amenity?: string;
    healthcare?: string;
    "addr:full"?: string;
    "addr:street"?: string;
    "addr:city"?: string;
    phone?: string;
    emergency?: string;
    beds?: string;
  };
}

export class OverpassService {
  /**
   * Fetch all hospitals in Chile from OpenStreetMap
   * This is a one-time sync operation
   */
  static async syncHospitalsFromOSM(): Promise<number> {
    console.log("🏥 Syncing hospitals from OpenStreetMap...");
    
    try {
      // Overpass QL query for hospitals, clinics, and emergency facilities in Chile
      const query = `
        [out:json][timeout:90];
        (
          node["amenity"="hospital"](${CHILE_BBOX.south},${CHILE_BBOX.west},${CHILE_BBOX.north},${CHILE_BBOX.east});
          way["amenity"="hospital"](${CHILE_BBOX.south},${CHILE_BBOX.west},${CHILE_BBOX.north},${CHILE_BBOX.east});
          relation["amenity"="hospital"](${CHILE_BBOX.south},${CHILE_BBOX.west},${CHILE_BBOX.north},${CHILE_BBOX.east});
          
          node["amenity"="clinic"](${CHILE_BBOX.south},${CHILE_BBOX.west},${CHILE_BBOX.north},${CHILE_BBOX.east});
          way["amenity"="clinic"](${CHILE_BBOX.south},${CHILE_BBOX.west},${CHILE_BBOX.north},${CHILE_BBOX.east});
          
          node["healthcare"="hospital"](${CHILE_BBOX.south},${CHILE_BBOX.west},${CHILE_BBOX.north},${CHILE_BBOX.east});
          way["healthcare"="hospital"](${CHILE_BBOX.south},${CHILE_BBOX.west},${CHILE_BBOX.north},${CHILE_BBOX.east});
        );
        out center;
      `;

      const response = await fetch(OVERPASS_API, {
        method: "POST",
        body: query,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (!response.ok) {
        throw new Error(`Overpass API error: ${response.status}`);
      }

      const data = await response.json();
      const elements: OverpassElement[] = data.elements;

      console.log(`   Found ${elements.length} healthcare facilities`);

      let savedCount = 0;
      for (const element of elements) {
        const saved = await this.saveHospitalFromOSM(element);
        if (saved) savedCount++;
      }

      console.log(`✅ Saved ${savedCount} hospitals to database`);
      return savedCount;
    } catch (error) {
      console.error("❌ Error syncing hospitals from OSM:", error);
      return 0;
    }
  }

  /**
   * Get hospitals near a location
   */
  static async getHospitalsNearby(lat: number, lng: number, radiusKm: number = 50) {
    const distanceFormula = sql<number>`(
      6371 * ACOS(
        COS(RADIANS(${lat})) * COS(RADIANS(${hospitals.lat})) * 
        COS(RADIANS(${hospitals.lng}) - RADIANS(${lng})) + 
        SIN(RADIANS(${lat})) * SIN(RADIANS(${hospitals.lat}))
      )
    )`;

    const result = await db
      .select({
        id: hospitals.id,
        osm_id: hospitals.osm_id,
        nombre: hospitals.nombre,
        tipo: hospitals.tipo,
        lat: hospitals.lat,
        lng: hospitals.lng,
        direccion: hospitals.direccion,
        telefono: hospitals.telefono,
        region: hospitals.region,
        comuna: hospitals.comuna,
        capacidad_camas: hospitals.capacidad_camas,
        servicios: hospitals.servicios,
        distance_km: distanceFormula,
      })
      .from(hospitals)
      .where(sql`${distanceFormula} < ${radiusKm}`)
      .orderBy(distanceFormula);

    return result.map((row) => ({
      ...row,
      lat: parseFloat(row.lat),
      lng: parseFloat(row.lng),
    }));
  }

  /**
   * Get all hospitals in a region
   */
  static async getHospitalsByRegion(region: string) {
    const result = await db
      .select()
      .from(hospitals)
      .where(eq(hospitals.region, region));

    return result.map((row) => ({
      ...row,
      lat: parseFloat(row.lat),
      lng: parseFloat(row.lng),
    }));
  }

  /**
   * Save a hospital from OSM data
   */
  private static async saveHospitalFromOSM(element: OverpassElement): Promise<boolean> {
    if (!element.tags?.name && !element.tags?.["name:es"]) {
      return false; // Skip unnamed facilities
    }

    const lat = element.lat || element.center?.lat;
    const lng = element.lon || element.center?.lon;

    if (!lat || !lng) {
      return false; // Skip if no coordinates
    }

    const nombre = element.tags?.["name:es"] || element.tags?.name || "Hospital sin nombre";
    const tipo = element.tags?.amenity || element.tags?.healthcare || "hospital";
    
    // Build address
    let direccion = element.tags?.["addr:full"];
    if (!direccion && element.tags?.["addr:street"]) {
      direccion = element.tags["addr:street"];
      if (element.tags["addr:city"]) {
        direccion += `, ${element.tags["addr:city"]}`;
      }
    }

    // Parse services
    const servicios: any = {};
    if (element.tags?.emergency) {
      servicios.emergency = element.tags.emergency === "yes";
    }

    const hospitalData: HospitalInsert = {
      osm_id: `${element.type}/${element.id}`,
      nombre,
      tipo,
      lat: lat.toString(),
      lng: lng.toString(),
      direccion: direccion || null,
      telefono: element.tags?.phone || null,
      region: null, // Will be populated via reverse geocoding if needed
      comuna: element.tags?.["addr:city"] || null,
      capacidad_camas: element.tags?.beds ? parseInt(element.tags.beds) : null,
      servicios: Object.keys(servicios).length > 0 ? servicios : null,
    };

    try {
      await db
        .insert(hospitals)
        .values(hospitalData)
        .onConflictDoUpdate({
          target: hospitals.osm_id,
          set: hospitalData,
        });
      
      return true;
    } catch (error) {
      console.error(`Error saving hospital ${nombre}:`, error);
      return false;
    }
  }

  /**
   * Get count of hospitals in database
   */
  static async getHospitalCount(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(hospitals);
    
    return result[0].count;
  }
}
