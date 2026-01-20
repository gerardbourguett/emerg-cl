export interface Emergency {
  id: string;
  tipo: "incendio_forestal" | "seismo" | "tsunami" | "alerta_meteorologica";
  titulo: string;
  descripcion: string;
  lat: number;
  lng: number;
  severidad: "baja" | "media" | "alta" | "critica";
  estado: "activo" | "monitoreo" | "controlado" | "extinguido";
  fecha_inicio: Date;
  fecha_actualizacion: Date;
  fuente: string;
  metadata: Record<string, unknown>;
}

export interface ScraperResult {
  emergencies: Emergency[];
  lastUpdated: Date;
}
export interface EmergencyInput {
  tipo: "incendio_forestal" | "seismo" | "tsunami" | "alerta_meteorologica";
  titulo: string;
  descripcion: string;
  lat: number;
  lng: number;
  severidad: "baja" | "media" | "alta" | "critica";
  estado: "activo" | "monitoreo" | "controlado" | "extinguido";
  fecha_inicio: Date;
  fecha_actualizacion: Date;
  fuente: string;
  metadata: Record<string, unknown>;
}
