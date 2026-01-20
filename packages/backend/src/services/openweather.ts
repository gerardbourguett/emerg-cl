import { db, weatherCache, type WeatherCacheInsert } from "../db";
import { and, eq, gte, sql } from "drizzle-orm";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || "08506bf62b00d97381dcfefda705fe0b";
const CACHE_DURATION_MINUTES = 30; // Cache weather data for 30 minutes

interface WeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  description: string;
  icon: string;
  wind_speed: number;
  wind_deg: number;
  clouds: number;
  visibility: number;
}

interface UVData {
  value: number;
  date: string;
}

interface AirQualityData {
  aqi: number; // 1-5 scale
  pm2_5: number;
  pm10: number;
  co: number;
  no2: number;
  o3: number;
  so2: number;
}

export class OpenWeatherService {
  /**
   * Get current weather for a location
   */
  static async getCurrentWeather(lat: number, lng: number): Promise<WeatherData | null> {
    // Check cache first
    const cached = await this.getFromCache(lat, lng, "current");
    if (cached) {
      console.log("   ⚡ Weather from cache");
      return cached as WeatherData;
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=es`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`OpenWeather API error: ${response.status}`);
        return null;
      }

      const data = await response.json();
      
      const weatherData: WeatherData = {
        temp: data.main.temp,
        feels_like: data.main.feels_like,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        wind_speed: data.wind.speed,
        wind_deg: data.wind.deg,
        clouds: data.clouds.all,
        visibility: data.visibility,
      };

      // Save to cache
      await this.saveToCache(lat, lng, "current", weatherData);
      
      return weatherData;
    } catch (error) {
      console.error("Error fetching weather:", error);
      return null;
    }
  }

  /**
   * Get UV Index for a location
   */
  static async getUVIndex(lat: number, lng: number): Promise<UVData | null> {
    // Check cache first
    const cached = await this.getFromCache(lat, lng, "uv");
    if (cached) {
      console.log("   ⚡ UV Index from cache");
      return cached as UVData;
    }

    try {
      // Note: OpenWeather UV Index endpoint requires One Call API 3.0
      const url = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`OpenWeather UV API error: ${response.status}`);
        return null;
      }

      const data = await response.json();
      
      const uvData: UVData = {
        value: data.value,
        date: data.date_iso || new Date().toISOString(),
      };

      // Save to cache
      await this.saveToCache(lat, lng, "uv", uvData);
      
      return uvData;
    } catch (error) {
      console.error("Error fetching UV index:", error);
      return null;
    }
  }

  /**
   * Get Air Quality data for a location
   */
  static async getAirQuality(lat: number, lng: number): Promise<AirQualityData | null> {
    // Check cache first
    const cached = await this.getFromCache(lat, lng, "air_quality");
    if (cached) {
      console.log("   ⚡ Air Quality from cache");
      return cached as AirQualityData;
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`OpenWeather Air Quality API error: ${response.status}`);
        return null;
      }

      const data = await response.json();
      const list = data.list[0];
      
      const airQualityData: AirQualityData = {
        aqi: list.main.aqi,
        pm2_5: list.components.pm2_5,
        pm10: list.components.pm10,
        co: list.components.co,
        no2: list.components.no2,
        o3: list.components.o3,
        so2: list.components.so2,
      };

      // Save to cache
      await this.saveToCache(lat, lng, "air_quality", airQualityData);
      
      return airQualityData;
    } catch (error) {
      console.error("Error fetching air quality:", error);
      return null;
    }
  }

  /**
   * Get all weather data for a location (current, UV, air quality)
   */
  static async getAllWeatherData(lat: number, lng: number) {
    const [current, uv, airQuality] = await Promise.all([
      this.getCurrentWeather(lat, lng),
      this.getUVIndex(lat, lng),
      this.getAirQuality(lat, lng),
    ]);

    return {
      current,
      uv,
      airQuality,
    };
  }

  /**
   * Get weather data from cache
   */
  private static async getFromCache(lat: number, lng: number, tipo: string): Promise<any | null> {
    const now = new Date();
    
    const result = await db
      .select()
      .from(weatherCache)
      .where(
        and(
          eq(weatherCache.lat, lat.toString()),
          eq(weatherCache.lng, lng.toString()),
          eq(weatherCache.tipo, tipo),
          gte(weatherCache.expires_at, now)
        )
      )
      .limit(1);

    if (result.length > 0) {
      return result[0].data;
    }
    
    return null;
  }

  /**
   * Save weather data to cache
   */
  private static async saveToCache(lat: number, lng: number, tipo: string, data: any) {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + CACHE_DURATION_MINUTES);

    const cacheData: WeatherCacheInsert = {
      lat: lat.toString(),
      lng: lng.toString(),
      tipo,
      data: data as any,
      expires_at: expiresAt,
    };

    try {
      await db.insert(weatherCache).values(cacheData);
    } catch (error) {
      // Ignore duplicate errors, cache will be refreshed naturally
      console.log("   Cache insert failed (likely duplicate)");
    }
  }

  /**
   * Clean up expired cache entries
   * Should be run periodically
   */
  static async cleanExpiredCache() {
    const now = new Date();
    
    const result = await db
      .delete(weatherCache)
      .where(sql`${weatherCache.expires_at} < ${now}`)
      .returning({ id: weatherCache.id });

    console.log(`🗑️  Cleaned up ${result.length} expired weather cache entries`);
    return result.length;
  }
}
