import { db, emergencies, type EmergencyInsert } from "../db";
import { eq, and, gte, sql, desc, ne } from "drizzle-orm";
import type { Emergency } from "../types/emergency";

/**
 * Save or update an emergency in the database
 * Uses UPSERT pattern to avoid duplicates
 */
export async function saveEmergency(emergency: Emergency) {
  const emergencyData: EmergencyInsert = {
    id: emergency.id,
    tipo: emergency.tipo,
    titulo: emergency.titulo,
    descripcion: emergency.descripcion,
    lat: emergency.lat.toString(),
    lng: emergency.lng.toString(),
    severidad: emergency.severidad,
    estado: emergency.estado,
    fecha_inicio: emergency.fecha_inicio,
    fecha_actualizacion: emergency.fecha_actualizacion,
    fuente: emergency.fuente,
    metadata: emergency.metadata as any,
  };

  const result = await db
    .insert(emergencies)
    .values(emergencyData)
    .onConflictDoUpdate({
      target: emergencies.id,
      set: {
        metadata: sql`EXCLUDED.metadata`,
        fecha_actualizacion: sql`EXCLUDED.fecha_actualizacion`,
        estado: sql`EXCLUDED.estado`,
        severidad: sql`EXCLUDED.severidad`,
      },
    })
    .returning();

  return convertEmergencyFromDb(result[0]);
}

/**
 * Get emergencies within a radius from a point (in kilometers)
 * Uses Haversine formula for distance calculation
 */
export async function getEmergenciesByRadius(
  lat: number,
  lng: number,
  radiusKm: number = 50
) {
  // Haversine distance formula in SQL
  const distanceFormula = sql<number>`(
    6371 * ACOS(
      COS(RADIANS(${lat})) * COS(RADIANS(${emergencies.lat})) * 
      COS(RADIANS(${emergencies.lng}) - RADIANS(${lng})) + 
      SIN(RADIANS(${lat})) * SIN(RADIANS(${emergencies.lat}))
    )
  )`;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const result = await db
    .select({
      id: emergencies.id,
      tipo: emergencies.tipo,
      titulo: emergencies.titulo,
      descripcion: emergencies.descripcion,
      lat: emergencies.lat,
      lng: emergencies.lng,
      severidad: emergencies.severidad,
      estado: emergencies.estado,
      fecha_actualizacion: emergencies.fecha_actualizacion,
      fuente: emergencies.fuente,
      distance_km: distanceFormula,
    })
    .from(emergencies)
    .where(
      and(
        gte(emergencies.fecha_actualizacion, sevenDaysAgo),
        sql`${distanceFormula} < ${radiusKm}`
      )
    )
    .orderBy(distanceFormula);

  return result.map((row) => ({
    ...row,
    lat: parseFloat(row.lat),
    lng: parseFloat(row.lng),
    distance_km: row.distance_km,
  }));
}

/**
 * Get emergencies by type
 * Excludes "extinguido" status and data older than 7 days
 */
export async function getEmergenciesByType(tipo: string) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const result = await db
    .select()
    .from(emergencies)
    .where(
      and(
        eq(emergencies.tipo, tipo),
        ne(emergencies.estado, "extinguido"),
        gte(emergencies.fecha_actualizacion, sevenDaysAgo)
      )
    )
    .orderBy(desc(emergencies.fecha_actualizacion));

  return result.map(convertEmergencyFromDb);
}

/**
 * Get all active emergencies
 * Excludes "extinguido" status and data older than 7 days
 */
export async function getAllEmergencies() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const result = await db
    .select()
    .from(emergencies)
    .where(
      and(
        ne(emergencies.estado, "extinguido"),
        gte(emergencies.fecha_actualizacion, sevenDaysAgo)
      )
    )
    .orderBy(desc(emergencies.fecha_actualizacion));

  return result.map(convertEmergencyFromDb);
}

/**
 * Delete emergencies older than 24 hours
 * This runs as a scheduled job to keep the database clean
 */
export async function cleanupOldEmergencies() {
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

  const result = await db
    .delete(emergencies)
    .where(sql`${emergencies.fecha_actualizacion} < ${twentyFourHoursAgo}`)
    .returning({ id: emergencies.id });

  console.log(`🗑️  Cleaned up ${result.length} old emergencies (>24h)`);
  return result.length;
}

/**
 * Get emergency statistics for aggregation
 * Used by the daily stats job
 */
export async function getEmergencyStatsForDate(date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const result = await db
    .select({
      total: sql<number>`COUNT(*)`,
      sismos: sql<number>`COUNT(*) FILTER (WHERE tipo = 'seismo')`,
      incendios: sql<number>`COUNT(*) FILTER (WHERE tipo = 'incendio_forestal')`,
      alertas: sql<number>`COUNT(*) FILTER (WHERE tipo = 'alerta_meteorologica')`,
      tsunamis: sql<number>`COUNT(*) FILTER (WHERE tipo = 'tsunami')`,
      severidad_critica: sql<number>`COUNT(*) FILTER (WHERE severidad = 'critica')`,
      severidad_alta: sql<number>`COUNT(*) FILTER (WHERE severidad = 'alta')`,
      severidad_media: sql<number>`COUNT(*) FILTER (WHERE severidad = 'media')`,
      severidad_baja: sql<number>`COUNT(*) FILTER (WHERE severidad = 'baja')`,
      sismos_mag_max: sql<number>`MAX((metadata->>'magnitud')::float) FILTER (WHERE tipo = 'seismo')`,
      sismos_mag_avg: sql<number>`AVG((metadata->>'magnitud')::float) FILTER (WHERE tipo = 'seismo')`,
      incendios_superficie: sql<number>`SUM((metadata->>'superficie_afectada')::float) FILTER (WHERE tipo = 'incendio_forestal')`,
    })
    .from(emergencies)
    .where(
      and(
        gte(emergencies.fecha_actualizacion, startOfDay),
        sql`${emergencies.fecha_actualizacion} <= ${endOfDay}`
      )
    );

  return result[0];
}

/**
 * Helper function to convert database emergency to application format
 * Ensures lat/lng are numbers, not strings
 */
function convertEmergencyFromDb(dbEmergency: any): any {
  return {
    ...dbEmergency,
    lat: parseFloat(dbEmergency.lat),
    lng: parseFloat(dbEmergency.lng),
    metadata: typeof dbEmergency.metadata === 'string' 
      ? JSON.parse(dbEmergency.metadata) 
      : dbEmergency.metadata,
  };
}
