import { Hono } from "hono";
import { RefugiosService } from "../services/refugios";

export const refugiosRouter = new Hono();

// GET all active refugios
refugiosRouter.get("/", async (c) => {
  const refugios = await RefugiosService.getAllRefugios();
  
  return c.json({ refugios, count: refugios.length });
});

// GET refugios nearby a location
refugiosRouter.get("/nearby", async (c) => {
  const lat = parseFloat(c.req.query("lat") || "0");
  const lng = parseFloat(c.req.query("lng") || "0");
  const radius = parseFloat(c.req.query("radius") || "50");

  if (!lat || !lng) {
    return c.json({ error: "lat and lng are required" }, 400);
  }

  const refugios = await RefugiosService.getRefugiosNearby(lat, lng, radius);
  
  return c.json({ refugios, count: refugios.length });
});

// POST calculate safe zones
refugiosRouter.post("/calculate-safe-zones", async (c) => {
  const minDistance = parseFloat(c.req.query("minDistance") || "10");
  
  const count = await RefugiosService.calculateSafeZones(minDistance);
  
  return c.json({ message: "Safe zones calculated", count });
});

// POST sync from SENAPRED
refugiosRouter.post("/sync", async (c) => {
  const count = await RefugiosService.syncRefugiosFromSenapred();
  
  return c.json({ message: "Sync completed", count });
});

// POST update distances to emergencies
refugiosRouter.post("/update-distances", async (c) => {
  const count = await RefugiosService.updateRefugioDistances();
  
  return c.json({ message: "Distances updated", count });
});

// POST add manual refugio
refugiosRouter.post("/add", async (c) => {
  const body = await c.req.json();
  
  if (!body.nombre || !body.lat || !body.lng) {
    return c.json({ error: "nombre, lat, and lng are required" }, 400);
  }

  const refugio = await RefugiosService.addRefugio(body);
  
  return c.json({ refugio });
});
