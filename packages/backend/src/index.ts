import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { initializeDatabase, pool } from "./config/database";
import { emergenciasRouter } from "./routes/emergencias";
import { scrapeSismosChile } from "./services/scrapers/sismos";
import { scrapeNASAFIRMS } from "./services/scrapers/firms";
import { scrapeSenapredTelegram } from "./services/scrapers/senapred-telegram";
import { saveEmergency } from "./services/database";
import { SenapredService } from "./services/senapred";
import { MeteoService } from "./services/meteo";
import { ConafService } from "./services/conaf";
import { serve } from "bun";

const app = new Hono();

// Middleware para pasar pool a contexto
app.use(async (c, next) => {
  (c as any).env = { pool };
  await next();
});

// Servir archivos estáticos
app.use("/*", serveStatic({ root: "./public" }));

// Health check
app.get("/api/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

// Rutas
app.route("/api/emergencias", emergenciasRouter);

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

app.get("/api/conaf/situacion", async (c) => {
  const data = await ConafService.getSituacion();
  return c.json({ source: "CONAF", data });
});

// Iniciar scrapers en background
async function startScrapers() {
  console.log("🔄 Iniciando scrapers...");

  // Ejecutar inmediatamente al inicio
  await runScrapers();

  // Luego cada 5 minutos
  setInterval(runScrapers, 5 * 60 * 1000);
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

  serve({ fetch: app.fetch, port: 3000 });
  console.log("🚀 Servidor corriendo en http://localhost:3000");
}

main().catch(console.error);
