import { Emergency } from "../../types/emergency.ts";

interface SismoAPI {
  Fecha: string;
  Profundidad: string;
  Magnitud: string;
  RefGeografica: string;
  FechaUpdate: string;
}

// Coordenadas aproximadas de ciudades/localidades chilenas para geocodificación
const locationCoords: Record<string, { lat: number; lng: number }> = {
  tocopilla: { lat: -22.092, lng: -70.193 },
  calama: { lat: -22.456, lng: -68.929 },
  antofagasta: { lat: -23.65, lng: -70.4 },
  mejillones: { lat: -23.1, lng: -70.45 },
  iquique: { lat: -20.214, lng: -70.152 },
  arica: { lat: -18.479, lng: -70.311 },
  copiapo: { lat: -27.367, lng: -70.332 },
  valparaiso: { lat: -33.047, lng: -71.613 },
  santiago: { lat: -33.45, lng: -70.666 },
  concepcion: { lat: -36.827, lng: -73.05 },
  temuco: { lat: -38.739, lng: -72.598 },
  valdivia: { lat: -39.814, lng: -73.246 },
  osorno: { lat: -40.574, lng: -73.133 },
  puertomontt: { lat: -41.469, lng: -72.937 },
  coyhaique: { lat: -45.571, lng: -72.066 },
  puntaarenas: { lat: -53.154, lng: -70.911 },
  tongoy: { lat: -30.253, lng: -71.497 },
  curico: { lat: -34.983, lng: -71.233 },
  socaire: { lat: -23.583, lng: -67.883 },
  pica: { lat: -20.5, lng: -69.333 },
  pisagua: { lat: -19.597, lng: -70.212 },
  // Default para Chile central
  chile: { lat: -33.45, lng: -70.666 },
};

function extractCoordinates(refGeografica: string): { lat: number; lng: number } {
  const ref = refGeografica.toLowerCase();

  // Buscar coincidencia en las localidades conocidas
  for (const [location, coords] of Object.entries(locationCoords)) {
    if (ref.includes(location)) {
      return coords;
    }
  }

  // Si no encuentra, usar coordenadas de Chile central
  return locationCoords.chile;
}

function calculateSeverity(magnitud: number): "baja" | "media" | "alta" | "critica" {
  if (magnitud >= 7.0) return "critica";
  if (magnitud >= 5.5) return "alta";
  if (magnitud >= 4.0) return "media";
  return "baja";
}

export async function scrapeSismosChile(): Promise<Emergency[]> {
  try {
    const response = await fetch("https://api.gael.cloud/general/public/sismos");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: SismoAPI[] = await response.json();

    return data.map((sismo, index) => {
      const magnitud = parseFloat(sismo.Magnitud);
      const coords = extractCoordinates(sismo.RefGeografica);

      return {
        id: `sismo-${sismo.Fecha.replace(/[:\s-]/g, "")}`,
        tipo: "seismo" as const,
        titulo: `Sismo ${sismo.Magnitud}° - ${sismo.RefGeografica}`,
        descripcion: `Magnitud: ${sismo.Magnitud}° | Profundidad: ${sismo.Profundidad} km | ${sismo.RefGeografica}`,
        lat: coords.lat,
        lng: coords.lng,
        severidad: calculateSeverity(magnitud),
        estado: "activo" as const,
        fecha_inicio: new Date(sismo.Fecha),
        fecha_actualizacion: new Date(sismo.FechaUpdate),
        fuente: "CSN",
        metadata: {
          magnitud: magnitud,
          profundidad: parseFloat(sismo.Profundidad),
          referencia: sismo.RefGeografica,
        },
      };
    });
  } catch (error) {
    console.error("Sismos scraper error:", error);
    return [];
  }
}
