import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "hono/bun";
import { initializeDatabase, db } from "./config/database";
import { emergenciasRouter } from "./routes/emergencias";
import { weatherRouter } from "./routes/weather";
import { hospitalsRouter } from "./routes/hospitals";
import { refugiosRouter } from "./routes/refugios";
import { statsRouter } from "./routes/stats";
import { scrapeSismosChile } from "./services/scrapers/sismos";
import { scrapeNASAFIRMS } from "./services/scrapers/firms";
import { scrapeSenapredTelegram } from "./services/scrapers/senapred-telegram";
import { saveEmergency, cleanupOldEmergencies, getArchivedEmergencies } from "./services/database";
import { aggregateDailyStats } from "./services/stats";
import { SenapredService } from "./services/senapred";
import { MeteoService } from "./services/meteo";
import { ConafService } from "./services/conaf";
import { OpenWeatherService } from "./services/openweather";
import { RefugiosService } from "./services/refugios";
import { serve } from "bun";

const app = new Hono();

// CORS - permitir requests desde cualquier origen en producción
app.use("/*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

// Middleware para pasar db a contexto
app.use(async (c, next) => {
  (c as any).env = { db };
  await next();
});

// Servir archivos estáticos
app.use("/*", serveStatic({ root: "./public" }));

// Health check
app.get("/api/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

// Rutas
app.route("/api/emergencias", emergenciasRouter);
app.route("/api/weather", weatherRouter);
app.route("/api/hospitals", hospitalsRouter);
app.route("/api/refugios", refugiosRouter);
app.route("/api/stats", statsRouter);

// Archive endpoint for historical data
app.get("/api/emergencias/archive", async (c) => {
  try {
    const days = parseInt(c.req.query("days") || "7");
    const data = await getArchivedEmergencies(days);
    return c.json({
      source: "archive",
      days,
      count: data.length,
      data
    });
  } catch (error) {
    console.error("Error fetching archive:", error);
    return c.json({ error: "Failed to fetch archive" }, 500);
  }
});

// Backend Scraper Routes
app.get("/api/senapred/albergues", async (c) => {
  const data = await SenapredService.getAlbergues();
  return c.json({ source: "SENAPRED", data });
});

app.get("/api/senapred/eventos", async (c) => {
  const data = await SenapredService.getEvents();
  return c.json({ source: "SENAPRED", data });
});

app.get("/api/meteo/condiciones", async (c) => {
  try {
    const data = await MeteoService.getConditions();
    return c.json({ source: "MeteoChile", data });
  } catch (error) {
    console.error("Error fetching meteo:", error);
    return c.json({ source: "MeteoChile", data: null, error: "Failed to fetch" }, 500);
  }
});

// CONAF endpoint temporarily disabled - causing errors
/*
app.get("/api/conaf/situacion", async (c) => {
  try {
    const data = await ConafService.getSituacion();
    return c.json({ source: "CONAF", data });
  } catch (error) {
    console.error("Error in /api/conaf/situacion:", error);
    return c.json({ source: "CONAF", data: null, error: "Internal Server Error" }, 500);
  }
});
*/

// Iniciar scrapers en background
async function startScrapers() {
  console.log("🔄 Iniciando scrapers...");

  // Ejecutar inmediatamente al inicio
  await runScrapers();

  // Luego cada 5 minutos
  setInterval(runScrapers, 5 * 60 * 1000);
}

// Cleanup job: runs every hour to delete data older than 24h
async function startCleanupJob() {
  console.log("🗑️  Iniciando cleanup job...");

  // Run immediately
  await cleanupOldEmergencies();

  // Then every hour
  setInterval(async () => {
    await cleanupOldEmergencies();
  }, 60 * 60 * 1000); // 1 hour
}

// Stats aggregation job: runs once per day at midnight
async function startStatsAggregationJob() {
  console.log("📊 Iniciando stats aggregation job...");

  // Calculate time until next midnight
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const msUntilMidnight = tomorrow.getTime() - now.getTime();

  // Run at midnight
  setTimeout(async () => {
    await aggregateDailyStats();

    // Then every 24 hours
    setInterval(async () => {
      await aggregateDailyStats();
    }, 24 * 60 * 60 * 1000);
  }, msUntilMidnight);

  console.log(`   Next run at: ${tomorrow.toISOString()}`);
}

// Periodic maintenance job: runs every 6 hours
async function startMaintenanceJobs() {
  console.log("🔧 Iniciando maintenance jobs...");

  // Run immediately
  await runMaintenance();

  // Then every 6 hours
  setInterval(runMaintenance, 6 * 60 * 60 * 1000);
}

async function runMaintenance() {
  console.log("🔧 Running maintenance tasks...");

  // Clean expired weather cache
  await OpenWeatherService.cleanExpiredCache();

  // Update refugio distances to emergencies
  await RefugiosService.updateRefugioDistances();

  console.log("✅ Maintenance completed");
}

async function runScrapers() {
  // Scraper de sismos
  try {
    console.log("📡 Obteniendo sismos...");
    const sismos = await scrapeSismosChile();
    console.log(`   Encontrados: ${sismos.length} sismos`);

    let savedSismos = 0;
    for (const sismo of sismos) {
      if ((sismo.metadata as any).magnitud >= 3) {
        await saveEmergency(sismo);
        savedSismos++;
      }
    }
    console.log(`✓ Sismos: ${savedSismos} guardados en BD`);
  } catch (error) {
    console.error("✗ Scraper sismos falló:", error);
  }

  // Scraper de incendios (NASA FIRMS)
  try {
    console.log("🔥 Obteniendo focos de calor (NASA FIRMS)...");
    const incendios = await scrapeNASAFIRMS();
    console.log(`   Encontrados: ${incendios.length} focos`);

    let savedIncendios = 0;
    for (const incendio of incendios) {
      await saveEmergency(incendio);
      savedIncendios++;
    }
    console.log(`✓ Incendios: ${savedIncendios} guardados en BD`);
  } catch (error) {
    console.error("✗ Scraper FIRMS falló:", error);
  }

  // Scraper de alertas SENAPRED (Telegram)
  try {
    console.log("🚨 Obteniendo alertas SENAPRED (Telegram)...");
    const alertas = await scrapeSenapredTelegram();
    console.log(`   Encontradas: ${alertas.length} alertas`);

    let savedAlertas = 0;
    for (const alerta of alertas) {
      await saveEmergency(alerta);
      savedAlertas++;
    }
    console.log(`✓ Alertas SENAPRED: ${savedAlertas} guardadas en BD`);
  } catch (error) {
    console.error("✗ Scraper SENAPRED Telegram falló:", error);
  }
}

async function main() {
  await initializeDatabase();
  await startScrapers();
  await startCleanupJob();
  await startStatsAggregationJob();
  await startMaintenanceJobs();

  serve({ fetch: app.fetch, port: 3000 });
  console.log("🚀 Servidor corriendo en http://localhost:3000");
}

main().catch(console.error);
