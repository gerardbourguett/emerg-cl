import { Emergency } from "../../types/emergency.ts";

// Coordenadas de comunas chilenas (principales)
const comunasCoords: Record<string, { lat: number; lng: number; region: string }> = {
  // Región de Arica y Parinacota
  arica: { lat: -18.479, lng: -70.311, region: "Arica y Parinacota" },
  putre: { lat: -18.197, lng: -69.558, region: "Arica y Parinacota" },

  // Región de Tarapacá
  iquique: { lat: -20.214, lng: -70.152, region: "Tarapacá" },
  "alto hospicio": { lat: -20.268, lng: -70.102, region: "Tarapacá" },
  pica: { lat: -20.489, lng: -69.329, region: "Tarapacá" },

  // Región de Antofagasta
  antofagasta: { lat: -23.65, lng: -70.4, region: "Antofagasta" },
  calama: { lat: -22.456, lng: -68.929, region: "Antofagasta" },
  tocopilla: { lat: -22.092, lng: -70.193, region: "Antofagasta" },

  // Región de Atacama
  copiapo: { lat: -27.367, lng: -70.332, region: "Atacama" },
  vallenar: { lat: -28.576, lng: -70.759, region: "Atacama" },

  // Región de Coquimbo
  "la serena": { lat: -29.907, lng: -71.252, region: "Coquimbo" },
  coquimbo: { lat: -29.953, lng: -71.344, region: "Coquimbo" },
  ovalle: { lat: -30.601, lng: -71.199, region: "Coquimbo" },
  illapel: { lat: -31.634, lng: -71.168, region: "Coquimbo" },

  // Región de Valparaíso
  valparaiso: { lat: -33.047, lng: -71.613, region: "Valparaíso" },
  "viña del mar": { lat: -33.024, lng: -71.552, region: "Valparaíso" },
  quilpue: { lat: -33.047, lng: -71.442, region: "Valparaíso" },
  "villa alemana": { lat: -33.042, lng: -71.374, region: "Valparaíso" },
  "san antonio": { lat: -33.593, lng: -71.607, region: "Valparaíso" },
  quillota: { lat: -32.883, lng: -71.249, region: "Valparaíso" },
  "los andes": { lat: -32.833, lng: -70.599, region: "Valparaíso" },
  "san felipe": { lat: -32.75, lng: -70.726, region: "Valparaíso" },
  limache: { lat: -33.016, lng: -71.268, region: "Valparaíso" },
  casablanca: { lat: -33.321, lng: -71.407, region: "Valparaíso" },

  // Región Metropolitana
  santiago: { lat: -33.45, lng: -70.666, region: "Metropolitana" },
  providencia: { lat: -33.427, lng: -70.611, region: "Metropolitana" },
  "las condes": { lat: -33.417, lng: -70.567, region: "Metropolitana" },
  maipu: { lat: -33.511, lng: -70.758, region: "Metropolitana" },
  "puente alto": { lat: -33.612, lng: -70.576, region: "Metropolitana" },
  "san bernardo": { lat: -33.592, lng: -70.7, region: "Metropolitana" },
  colina: { lat: -33.203, lng: -70.674, region: "Metropolitana" },
  buin: { lat: -33.732, lng: -70.743, region: "Metropolitana" },
  paine: { lat: -33.807, lng: -70.738, region: "Metropolitana" },
  melipilla: { lat: -33.687, lng: -71.213, region: "Metropolitana" },
  talagante: { lat: -33.665, lng: -70.93, region: "Metropolitana" },

  // Región de O'Higgins
  rancagua: { lat: -34.17, lng: -70.745, region: "O'Higgins" },
  "san fernando": { lat: -34.584, lng: -70.989, region: "O'Higgins" },
  pichilemu: { lat: -34.387, lng: -72.003, region: "O'Higgins" },
  rengo: { lat: -34.402, lng: -70.862, region: "O'Higgins" },
  machali: { lat: -34.179, lng: -70.659, region: "O'Higgins" },
  "santa cruz": { lat: -34.639, lng: -71.366, region: "O'Higgins" },

  // Región del Maule
  talca: { lat: -35.426, lng: -71.655, region: "Maule" },
  curico: { lat: -34.983, lng: -71.233, region: "Maule" },
  linares: { lat: -35.846, lng: -71.593, region: "Maule" },
  cauquenes: { lat: -35.967, lng: -72.322, region: "Maule" },
  constitucion: { lat: -35.333, lng: -72.416, region: "Maule" },
  molina: { lat: -35.114, lng: -71.278, region: "Maule" },

  // Región de Ñuble
  chillan: { lat: -36.607, lng: -72.103, region: "Ñuble" },
  "chillan viejo": { lat: -36.622, lng: -72.128, region: "Ñuble" },
  "san carlos": { lat: -36.424, lng: -71.959, region: "Ñuble" },
  bulnes: { lat: -36.742, lng: -72.298, region: "Ñuble" },
  yungay: { lat: -37.121, lng: -72.014, region: "Ñuble" },
  cobquecura: { lat: -36.133, lng: -72.783, region: "Ñuble" },

  // Región del Biobío
  concepcion: { lat: -36.827, lng: -73.05, region: "Biobío" },
  talcahuano: { lat: -36.725, lng: -73.117, region: "Biobío" },
  "los angeles": { lat: -37.469, lng: -72.353, region: "Biobío" },
  coronel: { lat: -37.029, lng: -73.152, region: "Biobío" },
  lota: { lat: -37.089, lng: -73.156, region: "Biobío" },
  tome: { lat: -36.618, lng: -72.956, region: "Biobío" },
  hualpen: { lat: -36.796, lng: -73.115, region: "Biobío" },
  "san pedro de la paz": { lat: -36.856, lng: -73.106, region: "Biobío" },
  chiguayante: { lat: -36.924, lng: -73.028, region: "Biobío" },
  mulchen: { lat: -37.719, lng: -72.238, region: "Biobío" },
  nacimiento: { lat: -37.502, lng: -72.674, region: "Biobío" },
  lebu: { lat: -37.608, lng: -73.654, region: "Biobío" },
  arauco: { lat: -37.246, lng: -73.317, region: "Biobío" },
  canete: { lat: -37.801, lng: -73.397, region: "Biobío" },
  cabrero: { lat: -37.034, lng: -72.404, region: "Biobío" },
  yumbel: { lat: -37.098, lng: -72.568, region: "Biobío" },
  laja: { lat: -37.278, lng: -72.716, region: "Biobío" },
  "santa barbara": { lat: -37.667, lng: -72.017, region: "Biobío" },
  quilaco: { lat: -37.683, lng: -71.998, region: "Biobío" },
  "alto biobio": { lat: -37.883, lng: -71.417, region: "Biobío" },
  antuco: { lat: -37.333, lng: -71.683, region: "Biobío" },
  quilleco: { lat: -37.467, lng: -72.017, region: "Biobío" },
  tucapel: { lat: -37.283, lng: -71.95, region: "Biobío" },

  // Región de La Araucanía
  temuco: { lat: -38.739, lng: -72.598, region: "La Araucanía" },
  "padre las casas": { lat: -38.767, lng: -72.6, region: "La Araucanía" },
  villarrica: { lat: -39.286, lng: -72.227, region: "La Araucanía" },
  pucon: { lat: -39.282, lng: -71.954, region: "La Araucanía" },
  angol: { lat: -37.795, lng: -72.708, region: "La Araucanía" },
  victoria: { lat: -38.233, lng: -72.333, region: "La Araucanía" },
  lautaro: { lat: -38.528, lng: -72.433, region: "La Araucanía" },
  puren: { lat: -38.028, lng: -73.083, region: "La Araucanía" },
  traiguen: { lat: -38.25, lng: -72.667, region: "La Araucanía" },
  collipulli: { lat: -37.953, lng: -72.433, region: "La Araucanía" },
  ercilla: { lat: -38.05, lng: -72.383, region: "La Araucanía" },
  lonquimay: { lat: -38.433, lng: -71.25, region: "La Araucanía" },
  curacautin: { lat: -38.433, lng: -71.883, region: "La Araucanía" },
  "nueva imperial": { lat: -38.75, lng: -72.967, region: "La Araucanía" },
  carahue: { lat: -38.717, lng: -73.167, region: "La Araucanía" },
  pitrufquen: { lat: -38.983, lng: -72.65, region: "La Araucanía" },
  freire: { lat: -38.95, lng: -72.617, region: "La Araucanía" },
  cunco: { lat: -38.933, lng: -72.033, region: "La Araucanía" },
  melipeuco: { lat: -38.85, lng: -71.7, region: "La Araucanía" },
  "los sauces": { lat: -37.967, lng: -72.833, region: "La Araucanía" },
  lumaco: { lat: -38.15, lng: -72.9, region: "La Araucanía" },
  galvarino: { lat: -38.417, lng: -72.783, region: "La Araucanía" },
  perquenco: { lat: -38.417, lng: -72.367, region: "La Araucanía" },

  // Región de Los Ríos
  valdivia: { lat: -39.814, lng: -73.246, region: "Los Ríos" },
  "la union": { lat: -40.295, lng: -73.083, region: "Los Ríos" },
  panguipulli: { lat: -39.643, lng: -72.334, region: "Los Ríos" },
  "rio bueno": { lat: -40.333, lng: -72.95, region: "Los Ríos" },
  lanco: { lat: -39.45, lng: -72.783, region: "Los Ríos" },
  paillaco: { lat: -40.067, lng: -72.867, region: "Los Ríos" },
  mariquina: { lat: -39.517, lng: -72.967, region: "Los Ríos" },
  mafil: { lat: -39.65, lng: -72.95, region: "Los Ríos" },
  corral: { lat: -39.883, lng: -73.433, region: "Los Ríos" },
  futrono: { lat: -40.133, lng: -72.4, region: "Los Ríos" },
  "lago ranco": { lat: -40.317, lng: -72.5, region: "Los Ríos" },
  "los lagos": { lat: -39.85, lng: -72.833, region: "Los Ríos" },

  // Región de Los Lagos
  "puerto montt": { lat: -41.469, lng: -72.937, region: "Los Lagos" },
  osorno: { lat: -40.574, lng: -73.133, region: "Los Lagos" },
  "puerto varas": { lat: -41.321, lng: -72.986, region: "Los Lagos" },
  castro: { lat: -42.48, lng: -73.765, region: "Los Lagos" },
  ancud: { lat: -41.867, lng: -73.833, region: "Los Lagos" },
  quellon: { lat: -43.117, lng: -73.617, region: "Los Lagos" },
  calbuco: { lat: -41.767, lng: -73.133, region: "Los Lagos" },
  "puerto octay": { lat: -40.967, lng: -72.883, region: "Los Lagos" },
  frutillar: { lat: -41.117, lng: -73.05, region: "Los Lagos" },
  llanquihue: { lat: -41.25, lng: -73.017, region: "Los Lagos" },
  fresia: { lat: -41.15, lng: -73.417, region: "Los Lagos" },
  maullin: { lat: -41.617, lng: -73.6, region: "Los Lagos" },
  "rio negro": { lat: -40.783, lng: -73.217, region: "Los Lagos" },
  purranque: { lat: -40.917, lng: -73.167, region: "Los Lagos" },
  "san juan de la costa": { lat: -40.517, lng: -73.4, region: "Los Lagos" },
  chaiten: { lat: -42.917, lng: -72.717, region: "Los Lagos" },
  futaleufu: { lat: -43.183, lng: -71.867, region: "Los Lagos" },
  palena: { lat: -43.617, lng: -71.8, region: "Los Lagos" },
  hualaihue: { lat: -42.033, lng: -72.467, region: "Los Lagos" },

  // Región de Aysén
  coyhaique: { lat: -45.571, lng: -72.066, region: "Aysén" },
  "puerto aysen": { lat: -45.4, lng: -72.7, region: "Aysén" },
  "chile chico": { lat: -46.55, lng: -71.733, region: "Aysén" },
  cochrane: { lat: -47.25, lng: -72.567, region: "Aysén" },

  // Región de Magallanes
  "punta arenas": { lat: -53.154, lng: -70.911, region: "Magallanes" },
  "puerto natales": { lat: -51.733, lng: -72.517, region: "Magallanes" },
  "porvenir": { lat: -53.3, lng: -70.367, region: "Magallanes" },
};

// Normalizar texto para búsqueda
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remover acentos
    .replace(/[^a-z0-9\s]/g, " ")
    .trim();
}

// Buscar comuna en el texto
function findComunaInText(text: string): { comuna: string; coords: { lat: number; lng: number; region: string } } | null {
  const normalizedText = normalizeText(text);

  // Buscar coincidencias exactas primero (comunas con nombre más largo)
  const sortedComunas = Object.entries(comunasCoords).sort((a, b) => b[0].length - a[0].length);

  for (const [comuna, coords] of sortedComunas) {
    const normalizedComuna = normalizeText(comuna);
    if (normalizedText.includes(normalizedComuna)) {
      return { comuna, coords };
    }
  }

  return null;
}

// Determinar tipo de emergencia del mensaje
function detectEmergencyType(text: string): Emergency["tipo"] {
  const lowerText = text.toLowerCase();

  if (lowerText.includes("incendio") || lowerText.includes("fuego")) {
    return "incendio_forestal";
  }
  if (lowerText.includes("tsunami") || lowerText.includes("maremoto")) {
    return "tsunami";
  }
  if (lowerText.includes("sismo") || lowerText.includes("terremoto")) {
    return "seismo";
  }
  return "alerta_meteorologica";
}

// Determinar severidad basada en palabras clave
function detectSeverity(text: string): Emergency["severidad"] {
  const lowerText = text.toLowerCase();

  if (lowerText.includes("evacuar") || lowerText.includes("evacuación") || lowerText.includes("alerta roja")) {
    return "critica";
  }
  if (lowerText.includes("alerta") || lowerText.includes("advertencia") || lowerText.includes("precaución")) {
    return "alta";
  }
  if (lowerText.includes("aviso") || lowerText.includes("monitoreo")) {
    return "media";
  }
  return "baja";
}

// Extraer sector del mensaje
function extractSector(text: string): string | null {
  // Buscar patrón "sector X" o "sectores X, Y, Z"
  const sectorMatch = text.match(/sector(?:es?)?\s+([^,\.]+(?:,\s*[^,\.]+)*)/i);
  if (sectorMatch) {
    return sectorMatch[1].trim();
  }
  return null;
}

export async function scrapeSenapredTelegram(): Promise<Emergency[]> {
  try {
    // Usar la versión web pública del canal
    const response = await fetch("https://t.me/s/SenapredChile");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const emergencies: Emergency[] = [];

    // Extraer mensajes del HTML
    // Buscar divs con clase tgme_widget_message_text
    const messageRegex = /<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/g;
    const timeRegex = /<time[^>]*datetime="([^"]+)"[^>]*>/g;

    let messageMatch;
    const messages: { text: string; time: string }[] = [];

    // Extraer todos los mensajes con sus timestamps
    const messageTexts: string[] = [];
    while ((messageMatch = messageRegex.exec(html)) !== null) {
      // Limpiar HTML del mensaje
      const text = messageMatch[1]
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();

      if (text.length > 20) {
        messageTexts.push(text);
      }
    }

    // Extraer timestamps
    const times: string[] = [];
    let timeMatch;
    while ((timeMatch = timeRegex.exec(html)) !== null) {
      times.push(timeMatch[1]);
    }

    // Procesar solo mensajes que parezcan alertas (últimos 20)
    const recentMessages = messageTexts.slice(-20);
    const recentTimes = times.slice(-20);

    for (let i = 0; i < recentMessages.length; i++) {
      const text = recentMessages[i];
      const timestamp = recentTimes[i] || new Date().toISOString();

      // Solo procesar si parece una alerta
      if (!text.toLowerCase().includes("senapred") && !text.toLowerCase().includes("alerta") && !text.toLowerCase().includes("evacuar")) {
        continue;
      }

      const comunaData = findComunaInText(text);
      if (!comunaData) continue; // Ignorar si no encontramos ubicación

      const tipo = detectEmergencyType(text);
      const severidad = detectSeverity(text);
      const sector = extractSector(text);

      const titulo = sector
        ? `Alerta SENAPRED: ${sector}, ${comunaData.comuna}`
        : `Alerta SENAPRED en ${comunaData.comuna}`;

      emergencies.push({
        id: `senapred-tg-${Date.parse(timestamp)}-${comunaData.comuna.replace(/\s+/g, "-")}`,
        tipo,
        titulo,
        descripcion: text.substring(0, 500),
        lat: comunaData.coords.lat,
        lng: comunaData.coords.lng,
        severidad,
        estado: "activo",
        fecha_inicio: new Date(timestamp),
        fecha_actualizacion: new Date(),
        fuente: "SENAPRED Telegram",
        metadata: {
          comuna: comunaData.comuna,
          region: comunaData.coords.region,
          sector: sector,
          mensaje_original: text,
        },
      });
    }

    // Eliminar duplicados por ubicación similar
    const uniqueEmergencies = emergencies.reduce((acc, curr) => {
      const existing = acc.find(
        (e) => e.lat === curr.lat && e.lng === curr.lng && e.tipo === curr.tipo
      );
      if (!existing) {
        acc.push(curr);
      } else if (new Date(curr.fecha_inicio) > new Date(existing.fecha_inicio)) {
        // Mantener el más reciente
        const index = acc.indexOf(existing);
        acc[index] = curr;
      }
      return acc;
    }, [] as Emergency[]);

    return uniqueEmergencies;
  } catch (error) {
    console.error("SENAPRED Telegram scraper error:", error);
    return [];
  }
}
