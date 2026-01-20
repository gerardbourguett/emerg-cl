import { db, emergencyStatsDaily, type EmergencyStatsDailyInsert } from "../db";
import { eq } from "drizzle-orm";
import { getEmergencyStatsForDate } from "./database";

/**
 * Aggregate daily statistics for emergencies
 * Runs once per day to store historical data
 */
export async function aggregateDailyStats(date: Date = new Date()) {
  const stats = await getEmergencyStatsForDate(date);
  
  const statsData: EmergencyStatsDailyInsert = {
    fecha: date,
    total_emergencias: stats.total || 0,
    sismos_count: stats.sismos || 0,
    incendios_count: stats.incendios || 0,
    alertas_count: stats.alertas || 0,
    tsunamis_count: stats.tsunamis || 0,
    severidad_critica: stats.severidad_critica || 0,
    severidad_alta: stats.severidad_alta || 0,
    severidad_media: stats.severidad_media || 0,
    severidad_baja: stats.severidad_baja || 0,
    sismos_magnitud_max: stats.sismos_mag_max || null,
    sismos_magnitud_avg: stats.sismos_mag_avg || null,
    incendios_superficie_total: stats.incendios_superficie || null,
  };

  const result = await db
    .insert(emergencyStatsDaily)
    .values(statsData)
    .onConflictDoUpdate({
      target: emergencyStatsDaily.fecha,
      set: statsData,
    })
    .returning();

  console.log(`📊 Daily stats aggregated for ${date.toISOString().split('T')[0]}`);
  return result[0];
}

/**
 * Get historical stats for the last N days
 */
export async function getHistoricalStats(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const result = await db
    .select()
    .from(emergencyStatsDaily)
    .where(eq(emergencyStatsDaily.fecha, startDate))
    .orderBy(emergencyStatsDaily.fecha);

  return result;
}
