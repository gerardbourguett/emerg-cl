import { Hono } from "hono";
import { OverpassService } from "../services/overpass";

export const hospitalsRouter = new Hono();

// GET hospitals nearby a location
hospitalsRouter.get("/nearby", async (c) => {
  const lat = parseFloat(c.req.query("lat") || "0");
  const lng = parseFloat(c.req.query("lng") || "0");
  const radius = parseFloat(c.req.query("radius") || "50");

  if (!lat || !lng) {
    return c.json({ error: "lat and lng are required" }, 400);
  }

  const hospitals = await OverpassService.getHospitalsNearby(lat, lng, radius);
  
  return c.json({ hospitals, count: hospitals.length });
});

// GET hospitals by region
hospitalsRouter.get("/region/:region", async (c) => {
  const region = c.req.param("region");

  const hospitals = await OverpassService.getHospitalsByRegion(region);
  
  return c.json({ hospitals, count: hospitals.length });
});

// POST sync hospitals from OSM
hospitalsRouter.post("/sync", async (c) => {
  const count = await OverpassService.syncHospitalsFromOSM();
  
  return c.json({ message: "Sync completed", count });
});

// GET hospital count
hospitalsRouter.get("/count", async (c) => {
  const count = await OverpassService.getHospitalCount();
  
  return c.json({ count });
});
