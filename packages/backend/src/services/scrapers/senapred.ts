import { Emergency } from "../../types/emergency";

export async function scrapeSenapredAlerts(): Promise<Emergency[]> {
  try {
    // SENAPRED publica en su sitio, intentamos parsing RSS
    const response = await fetch(
      "https://www.senapred.gob.cl/rss/feed/alertas",
    );
    const text = await response.text();

    // Parseo básico de RSS (considera xml2js para producción)
    const emergencies: Emergency[] = [];

    // Regex simple para demostración - usa xml2js en prod
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(text)) !== null) {
      const item = match[1];
      const title = item.match(/<title>(.*?)<\/title>/)?.[1] || "";
      const description =
        item
          .match(/<description>(.*?)<\/description>/)?.[1]
          ?.replace(/<[^>]*>/g, "") || "";

      if (
        description.toLowerCase().includes("alerta") ||
        description.toLowerCase().includes("advertencia")
      ) {
        emergencies.push({
          id: `senapred-${Date.now()}`,
          tipo: "alerta_meteorologica",
          titulo: title,
          descripcion: description,
          lat: -30.2639, // Placeholder - extraer de metadata si existe
          lng: -71.5401,
          severidad: "media",
          estado: "activo",
          fecha_inicio: new Date(),
          fecha_actualizacion: new Date(),
          fuente: "SENAPRED",
          metadata: { raw: item },
        });
      }
    }

    return emergencies;
  } catch (error) {
    console.error("SENAPRED scraper error:", error);
    return [];
  }
}
