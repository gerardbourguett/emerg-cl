export interface Emergency {
    id: string;
    tipo: "seismo" | "incendio_forestal" | "alerta_meteorologica" | "tsunami";
    titulo: string;
    descripcion: string;
    lat: number;
    lng: number;
    severidad: "baja" | "media" | "alta" | "critica";
    fuente: string;
    fecha_inicio: string;
    fecha_actualizacion: string;
    url_fuente?: string;
    url?: string;
    region?: string;
    metadata?: Record<string, any>;
    // Campos específicos para sismos
    magnitud?: number;
    profundidad?: number;
    // Campos específicos para incendios
    superficie_afectada?: number;
}

export const EMERGENCY_ICONS = {
    seismo: "📍",
    incendio_forestal: "🔥",
    alerta_meteorologica: "⚠️",
    tsunami: "🌊",
} as const;

export const SEVERITY_COLORS = {
    critica: { bg: "#ff4757", border: "#ff4757" },
    alta: { bg: "#ff6b6b", border: "#ff6b6b" },
    media: { bg: "#ffa502", border: "#e67e22" },
    baja: { bg: "#2ed573", border: "#2cca62" },
} as const;
