import { Hono } from "hono";
import {
  getEmergenciesByRadius,
  getEmergenciesByType,
  getAllEmergencies,
} from "../services/database";

export const emergenciasRouter = new Hono();

// GET emergencias por radio
emergenciasRouter.get("/radio", async (c) => {
  const lat = parseFloat(c.req.query("lat") || "0");
  const lng = parseFloat(c.req.query("lng") || "0");
  const radio = parseFloat(c.req.query("radio") || "50");

  if (!lat || !lng) {
    return c.json({ error: "lat y lng requeridos" }, 400);
  }

  const emergencies = await getEmergenciesByRadius(lat, lng, radio);
  return c.json({ emergencies, count: emergencies.length });
});

// GET emergencias por tipo
emergenciasRouter.get("/tipo/:tipo", async (c) => {
  const tipo = c.req.param("tipo");

  const emergencies = await getEmergenciesByType(tipo);
  return c.json({ emergencies, count: emergencies.length });
});

// GET todas activas
emergenciasRouter.get("/", async (c) => {
  const emergencies = await getAllEmergencies();
  return c.json({ emergencies, count: emergencies.length });
});
