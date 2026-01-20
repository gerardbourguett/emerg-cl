import { Hono } from "hono";
import { getHistoricalStats } from "../services/stats";
import { db, emergencyStatsDaily } from "../db";
import { desc, gte, sql } from "drizzle-orm";

export const statsRouter = new Hono();

// GET historical stats for last N days
statsRouter.get("/daily", async (c) => {
  const days = parseInt(c.req.query("days") || "30");
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const stats = await db
    .select()
    .from(emergencyStatsDaily)
    .where(gte(emergencyStatsDaily.fecha, startDate))
    .orderBy(desc(emergencyStatsDaily.fecha));

  return c.json({ stats, count: stats.length });
});

// GET summary stats
statsRouter.get("/summary", async (c) => {
  const days = parseInt(c.req.query("days") || "30");
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const result = await db
    .select({
      totalEmergencias: sql<number>`SUM(${emergencyStatsDaily.total_emergencias})`,
      totalSismos: sql<number>`SUM(${emergencyStatsDaily.sismos_count})`,
      totalIncendios: sql<number>`SUM(${emergencyStatsDaily.incendios_count})`,
      totalAlertas: sql<number>`SUM(${emergencyStatsDaily.alertas_count})`,
      totalCriticas: sql<number>`SUM(${emergencyStatsDaily.severidad_critica})`,
      totalAltas: sql<number>`SUM(${emergencyStatsDaily.severidad_alta})`,
      maxMagnitud: sql<number>`MAX(${emergencyStatsDaily.sismos_magnitud_max})`,
      avgMagnitud: sql<number>`AVG(${emergencyStatsDaily.sismos_magnitud_avg})`,
    })
    .from(emergencyStatsDaily)
    .where(gte(emergencyStatsDaily.fecha, startDate));

  return c.json({ summary: result[0] || {} });
});

// GET trends (comparison with previous period)
statsRouter.get("/trends", async (c) => {
  const days = parseInt(c.req.query("days") || "7");
  
  const currentPeriodStart = new Date();
  currentPeriodStart.setDate(currentPeriodStart.getDate() - days);
  
  const previousPeriodStart = new Date();
  previousPeriodStart.setDate(previousPeriodStart.getDate() - (days * 2));
  const previousPeriodEnd = currentPeriodStart;

  // Current period stats
  const currentStats = await db
    .select({
      total: sql<number>`SUM(${emergencyStatsDaily.total_emergencias})`,
    })
    .from(emergencyStatsDaily)
    .where(gte(emergencyStatsDaily.fecha, currentPeriodStart));

  // Previous period stats
  const previousStats = await db
    .select({
      total: sql<number>`SUM(${emergencyStatsDaily.total_emergencias})`,
    })
    .from(emergencyStatsDaily)
    .where(
      sql`${emergencyStatsDaily.fecha} >= ${previousPeriodStart} AND ${emergencyStatsDaily.fecha} < ${previousPeriodEnd}`
    );

  const current = currentStats[0]?.total || 0;
  const previous = previousStats[0]?.total || 0;
  const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;

  return c.json({
    current,
    previous,
    change: Math.round(change * 10) / 10,
    trend: change > 0 ? "up" : change < 0 ? "down" : "stable",
  });
});
