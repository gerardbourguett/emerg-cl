import { Emergency } from "../../types/emergency.ts";

export async function scrapeConaFireData(): Promise<Emergency[]> {
  try {
    // CONAF publica datos en formato JSON en su dashboard
    const response = await fetch(
      "https://www.conaf.cl/api/rest/auxiliar/obtener_data_incendios",
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    return data.incendios.map((fire: any) => ({
      id: `conaf-${fire.id}`,
      tipo: "incendio_forestal" as const,
      titulo: `Incendio en ${fire.region}`,
      descripcion: `Superficie: ${fire.hectareas} ha`,
      lat: Number.parseFloat(fire.lat),
      lng: Number.parseFloat(fire.lng),
      severidad: calculateSeverity(fire.hectareas),
      estado: fire.estado || "activo",
      fecha_inicio: new Date(fire.fecha_inicio),
      fecha_actualizacion: new Date(),
      fuente: "CONAF",
      metadata: {
        region: fire.region,
        hectareas: fire.hectareas,
        porcentaje_control: fire.porcentaje_control,
      },
    }));
  } catch (error) {
    console.error("CONAF scraper error:", error);
    return [];
  }
}

function calculateSeverity(
  hectareas: number,
): "baja" | "media" | "alta" | "critica" {
  if (hectareas > 10000) return "critica";
  if (hectareas > 5000) return "alta";
  if (hectareas > 1000) return "media";
  return "baja";
}
