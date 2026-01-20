import { Hono } from "hono";
import { OpenWeatherService } from "../services/openweather";

export const weatherRouter = new Hono();

// GET current weather for a location
weatherRouter.get("/current", async (c) => {
  const lat = parseFloat(c.req.query("lat") || "0");
  const lng = parseFloat(c.req.query("lng") || "0");

  if (!lat || !lng) {
    return c.json({ error: "lat and lng are required" }, 400);
  }

  const weather = await OpenWeatherService.getCurrentWeather(lat, lng);
  
  if (!weather) {
    return c.json({ error: "Failed to fetch weather data" }, 500);
  }

  return c.json({ weather });
});

// GET UV index for a location
weatherRouter.get("/uv", async (c) => {
  const lat = parseFloat(c.req.query("lat") || "0");
  const lng = parseFloat(c.req.query("lng") || "0");

  if (!lat || !lng) {
    return c.json({ error: "lat and lng are required" }, 400);
  }

  const uv = await OpenWeatherService.getUVIndex(lat, lng);
  
  if (!uv) {
    return c.json({ error: "Failed to fetch UV data" }, 500);
  }

  return c.json({ uv });
});

// GET air quality for a location
weatherRouter.get("/air-quality", async (c) => {
  const lat = parseFloat(c.req.query("lat") || "0");
  const lng = parseFloat(c.req.query("lng") || "0");

  if (!lat || !lng) {
    return c.json({ error: "lat and lng are required" }, 400);
  }

  const airQuality = await OpenWeatherService.getAirQuality(lat, lng);
  
  if (!airQuality) {
    return c.json({ error: "Failed to fetch air quality data" }, 500);
  }

  return c.json({ airQuality });
});

// GET all weather data for a location
weatherRouter.get("/all", async (c) => {
  const lat = parseFloat(c.req.query("lat") || "0");
  const lng = parseFloat(c.req.query("lng") || "0");

  if (!lat || !lng) {
    return c.json({ error: "lat and lng are required" }, 400);
  }

  const data = await OpenWeatherService.getAllWeatherData(lat, lng);
  
  return c.json(data);
});
