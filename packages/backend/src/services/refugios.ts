import { db, refugios, emergencies, type RefugioInsert } from "../db";
import { eq, sql, and, ne, gte } from "drizzle-orm";

export class RefugiosService {
  /**
   * Get all active refugios
   */
  static async getAllRefugios() {
    const result = await db
      .select()
      .from(refugios)
      .where(eq(refugios.activo, 1));

    return result.map((row) => ({
      ...row,
      lat: parseFloat(row.lat),
      lng: parseFloat(row.lng),
    }));
  }

  /**
   * Get refugios near a location
   */
  static async getRefugiosNearby(lat: number, lng: number, radiusKm: number = 50) {
    const distanceFormula = sql<number>`(
      6371 * ACOS(
        COS(RADIANS(${lat})) * COS(RADIANS(${refugios.lat})) * 
        COS(RADIANS(${refugios.lng}) - RADIANS(${lng})) + 
        SIN(RADIANS(${lat})) * SIN(RADIANS(${refugios.lat}))
      )
    )`;

    const result = await db
      .select({
        id: refugios.id,
        nombre: refugios.nombre,
        tipo: refugios.tipo,
        lat: refugios.lat,
        lng: refugios.lng,
        direccion: refugios.direccion,
        capacidad: refugios.capacidad,
        region: refugios.region,
        comuna: refugios.comuna,
        servicios: refugios.servicios,
        activo: refugios.activo,
        distancia_emergencia_mas_cercana: refugios.distancia_emergencia_mas_cercana,
        fuente: refugios.fuente,
        distance_km: distanceFormula,
      })
      .from(refugios)
      .where(
        and(
          eq(refugios.activo, 1),
          sql`${distanceFormula} < ${radiusKm}`
        )
      )
      .orderBy(distanceFormula);

    return result.map((row) => ({
      ...row,
      lat: parseFloat(row.lat),
      lng: parseFloat(row.lng),
    }));
  }

  /**
   * Calculate safe zones based on active emergencies
   * Creates "calculated" refugios in areas far from active emergencies
   */
  static async calculateSafeZones(minDistanceKm: number = 10): Promise<number> {
    console.log("🛡️  Calculating safe zones...");
    
    // First, deactivate all previously calculated safe zones
    await db
      .update(refugios)
      .set({ activo: 0 })
      .where(eq(refugios.tipo, "calculado"));

    // Get all active critical and high severity emergencies
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const activeEmergencies = await db
      .select()
      .from(emergencies)
      .where(
        and(
          ne(emergencies.estado, "extinguido"),
          sql`${emergencies.severidad} IN ('critica', 'alta')`,
          gte(emergencies.fecha_actualizacion, twentyFourHoursAgo)
        )
      );

    if (activeEmergencies.length === 0) {
      console.log("   No critical emergencies found, no safe zones needed");
      return 0;
    }

    console.log(`   Found ${activeEmergencies.length} critical emergencies`);
    
    // For now, we'll create a simple grid of safe zones
    // In a production system, this would use more sophisticated algorithms
    // considering population density, infrastructure, terrain, etc.
    
    // This is a simplified placeholder implementation
    // TODO: Implement sophisticated safe zone calculation
    
    console.log("   Safe zone calculation is a placeholder - needs real implementation");
    return 0;
  }

  /**
   * Sync refugios from SENAPRED
   * This would scrape or fetch from SENAPRED official sources
   */
  static async syncRefugiosFromSenapred(): Promise<number> {
    console.log("🏛️  Syncing refugios from SENAPRED...");
    
    // TODO: Implement SENAPRED refugios scraping
    // For now, this is a placeholder
    
    console.log("   SENAPRED refugios sync not yet implemented");
    return 0;
  }

  /**
   * Add a manual refugio
   */
  static async addRefugio(refugioData: {
    nombre: string;
    lat: number;
    lng: number;
    direccion?: string;
    capacidad?: number;
    region?: string;
    comuna?: string;
    servicios?: any;
    tipo?: "oficial" | "calculado";
  }) {
    const data: RefugioInsert = {
      nombre: refugioData.nombre,
      tipo: refugioData.tipo || "oficial",
      lat: refugioData.lat.toString(),
      lng: refugioData.lng.toString(),
      direccion: refugioData.direccion || null,
      capacidad: refugioData.capacidad || null,
      region: refugioData.region || null,
      comuna: refugioData.comuna || null,
      servicios: refugioData.servicios || null,
      activo: 1,
      fuente: "manual",
    };

    const result = await db.insert(refugios).values(data).returning();
    
    return {
      ...result[0],
      lat: parseFloat(result[0].lat),
      lng: parseFloat(result[0].lng),
    };
  }

  /**
   * Update refugio distances to nearest emergency
   * Should be run periodically
   */
  static async updateRefugioDistances() {
    console.log("📏 Updating refugio distances to emergencies...");
    
    const allRefugios = await this.getAllRefugios();
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const activeEmergencies = await db
      .select()
      .from(emergencies)
      .where(
        and(
          ne(emergencies.estado, "extinguido"),
          gte(emergencies.fecha_actualizacion, twentyFourHoursAgo)
        )
      );

    if (activeEmergencies.length === 0) {
      console.log("   No active emergencies, clearing all distances");
      await db
        .update(refugios)
        .set({ distancia_emergencia_mas_cercana: null });
      return;
    }

    let updatedCount = 0;
    for (const refugio of allRefugios) {
      let minDistance = Infinity;
      
      for (const emergency of activeEmergencies) {
        const emergencyLat = parseFloat(emergency.lat);
        const emergencyLng = parseFloat(emergency.lng);
        const distance = this.calculateDistance(
          refugio.lat,
          refugio.lng,
          emergencyLat,
          emergencyLng
        );
        
        if (distance < minDistance) {
          minDistance = distance;
        }
      }

      if (minDistance !== Infinity) {
        await db
          .update(refugios)
          .set({ distancia_emergencia_mas_cercana: minDistance })
          .where(eq(refugios.id, refugio.id));
        
        updatedCount++;
      }
    }

    console.log(`✅ Updated distances for ${updatedCount} refugios`);
    return updatedCount;
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  private static calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
