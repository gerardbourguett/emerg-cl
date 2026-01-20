import { Emergency } from "../../types/emergency";

interface FIRMSHotspot {
  latitude: number;
  longitude: number;
  bright_ti4: number;
  scan: number;
  track: number;
  acq_date: string;
  acq_time: string;
  satellite: string;
  instrument: string;
  confidence: string;
  version: string;
  bright_ti5: number;
  frp: number; // Fire Radiative Power - indica intensidad
  daynight: string;
}

// Límites aproximados de Chile (latitud -> longitud máxima hacia el este)
// Todo lo que esté al este de esto (mayor longitud) se considera Argentina/Bolivia
function isLocationInChile(lat: number, lng: number): boolean {
  // Rapa Nui
  if (lat > -28 && lat < -26 && lng < -108) return true;

  // Territorio Antártico (referencial)
  if (lat < -60) return true;

  // Norte Grande (Arica, Tarapacá, Antofagasta)
  if (lat > -26) return lng < -66.8;

  // Norte Chico (Atacama, Coquimbo)
  if (lat > -32.3) return lng < -69.0;

  // Zona Central (Valpo, Metro, O'Higgins, Maule)
  if (lat > -36) return lng < -69.5;

  // Zona Sur (Ñuble, Biobío, Araucanía)
  if (lat > -40) return lng < -70.5;

  // Zona Austral (Los Ríos, Los Lagos)
  if (lat > -44) return lng < -71.0;

  // Patagonia Norte (Aysén)
  if (lat > -49) return lng < -71.5;

  // Magallanes (tiene una "colita" hacia el este)
  return lng < -68.0;
}

function getRegionByCoordinates(lat: number, lng: number): string | null {
  if (!isLocationInChile(lat, lng)) return null;

  if (lng < -100) return "Rapa Nui";
  if (lat < -60) return "Antártica Chilena";

  if (lat > -20) return "Arica y Parinacota";
  if (lat > -22) return "Tarapacá";
  if (lat > -26.1) return "Antofagasta";
  if (lat > -29.2) return "Atacama";
  if (lat > -32.2) return "Coquimbo";

  // Valparaíso vs RM vs O'Higgins
  // RM está "encerrada" aprox entre -33.0 y -34.3, al este de ~ -71.5
  if (lat > -33.9) {
    if (lat > -33) return "Valparaíso";

    // Entre -33 y -33.9: RM está al oriente, Valpo al poniente
    if (lng > -71.2) return "Metropolitana";
    return "Valparaíso";
  }

  // Entre -33.9 y -34.8 -> O'Higgins (o RM sur)
  if (lat > -34.5) {
    if (lng > -71.2) return "O'Higgins"; // Ajuste simple
    return "O'Higgins";
  }

  if (lat > -35.0) return "O'Higgins";

  // Maule: aprox -34.8 a -36.2
  if (lat > -36.2) return "Maule";

  // Ñuble: -36.2 a -37.0 aprox (Chillán es -36.6)
  if (lat > -37.0) return "Ñuble";

  // Biobío
  if (lat > -38.3) return "Biobío";

  // Araucanía
  if (lat > -39.6) return "La Araucanía";

  // Los Ríos
  if (lat > -40.6) return "Los Ríos";

  if (lat > -44) return "Los Lagos";
  if (lat > -49) return "Aysén";
  return "Magallanes";
}

function calculateSeverity(frp: number, confidence: string): "baja" | "media" | "alta" | "critica" {
  // FRP (Fire Radiative Power) en MW indica intensidad del fuego
  // confidence: 'l' (low), 'n' (nominal), 'h' (high)

  if (frp > 50 || confidence === "h") return "critica";
  if (frp > 20) return "alta";
  if (frp > 5) return "media";
  return "baja";
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export async function scrapeNASAFIRMS(): Promise<Emergency[]> {
  const apiKey = process.env.FIRMS_API_KEY;

  if (!apiKey) {
    console.warn("⚠️ FIRMS_API_KEY no configurado en .env");
    return [];
  }

  try {
    // Coordenadas:
    // Continental + Antártica: oeste=-81, sur=-56.5, este=-66, norte=-17.5
    // Rapa Nui: oeste=-110, sur=-28, este=-108, norte=-26
    const urlContinental = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${apiKey}/VIIRS_SNPP_NRT/-81,-56.5,-66,-17.5/2`;
    const urlRapaNui = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${apiKey}/VIIRS_SNPP_NRT/-110,-28,-108,-26/3`;

    const [responseCont, responseRapa] = await Promise.all([
      fetch(urlContinental),
      fetch(urlRapaNui)
    ]);

    let csvText = "";

    if (responseCont.ok) {
      csvText += await responseCont.text();
    }

    // Si la respuesta de Rapa Nui es ok y tiene datos (más de 1 línea de headers), la agregamos
    // Saltamos el header de la segunda respuesta
    if (responseRapa.ok) {
      const textRapa = await responseRapa.text();
      const linesRapa = textRapa.trim().split("\n");
      if (linesRapa.length > 1) {
        // Si csvText ya tiene contenido, agregamos solo las líneas de datos (saltando headers)
        // Si está vacío, agregamos todo
        if (csvText.length > 0) {
          csvText += "\n" + linesRapa.slice(1).join("\n");
        } else {
          csvText += textRapa;
        }
      }
    }

    const lines = csvText.trim().split("\n");

    if (lines.length < 2) {
      console.log("   No hay focos de calor activos");
      return [];
    }

    // Parsear CSV
    const headers = parseCSVLine(lines[0]);
    const emergencies: Emergency[] = [];

    // Agrupar hotspots cercanos (dentro de 0.05 grados ~ 5km) para mejor precisión
    const clusters: Map<string, FIRMSHotspot[]> = new Map();

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length < 13) continue; // Saltar líneas incompletas

      const hotspot: FIRMSHotspot = {
        latitude: parseFloat(values[0]),
        longitude: parseFloat(values[1]),
        bright_ti4: parseFloat(values[2]),
        scan: parseFloat(values[3]),
        track: parseFloat(values[4]),
        acq_date: values[5],
        acq_time: values[6],
        satellite: values[7],
        instrument: values[8],
        confidence: values[9],
        version: values[10],
        bright_ti5: parseFloat(values[11]),
        frp: parseFloat(values[12]),
        daynight: values[13] || "D",
      };

      // Validar coordenadas
      if (Number.isNaN(hotspot.latitude) || Number.isNaN(hotspot.longitude)) continue;

      // Filtrar por ubicación (Chile)
      if (!isLocationInChile(hotspot.latitude, hotspot.longitude)) continue;

      // Crear cluster key redondeando coordenadas (0.05 grados ~ 5km)
      const clusterKey = `${Math.round(hotspot.latitude * 20) / 20},${Math.round(hotspot.longitude * 20) / 20}`;

      if (!clusters.has(clusterKey)) {
        clusters.set(clusterKey, []);
      }
      clusters.get(clusterKey)!.push(hotspot);
    }

    // Crear una emergencia por cluster
    for (const [clusterKey, hotspots] of clusters) {
      // Usar el hotspot con mayor FRP como representativo
      const mainHotspot = hotspots.reduce((max: FIRMSHotspot, h: FIRMSHotspot) => (h.frp > max.frp ? h : max), hotspots[0]);
      const totalFRP = hotspots.reduce((sum: number, h: FIRMSHotspot) => sum + h.frp, 0);
      const avgLat = hotspots.reduce((sum: number, h: FIRMSHotspot) => sum + h.latitude, 0) / hotspots.length;
      const avgLng = hotspots.reduce((sum: number, h: FIRMSHotspot) => sum + h.longitude, 0) / hotspots.length;

      const region = getRegionByCoordinates(avgLat, avgLng);
      if (!region) continue;

      const severity = calculateSeverity(totalFRP, mainHotspot.confidence);

      emergencies.push({
        id: `firms-${clusterKey.replace(",", "-")}-${mainHotspot.acq_date}`,
        tipo: "incendio_forestal",
        titulo: `Foco de calor en ${region}`,
        descripcion: `${hotspots.length} detecciones satelitales | FRP total: ${totalFRP.toFixed(1)} MW | Región: ${region}`,
        lat: avgLat,
        lng: avgLng,
        severidad: severity,
        estado: "activo",
        fecha_inicio: new Date(`${mainHotspot.acq_date}T00:00:00`),
        fecha_actualizacion: new Date(),
        fuente: "NASA FIRMS",
        metadata: {
          hotspots_count: hotspots.length,
          total_frp: totalFRP,
          max_frp: mainHotspot.frp,
          confidence: mainHotspot.confidence,
          satellite: mainHotspot.satellite,
          region: region,
        },
      });
    }

    return emergencies;
  } catch (error) {
    console.error("NASA FIRMS scraper error:", error);
    return [];
  }
}
