import { useEffect, useState } from "react";
import { Cloud, Droplets, Wind, Eye, Gauge, Sun, Moon, CloudRain, CloudLightning, Snowflake, CloudFog, CloudSun, CloudMoon } from "lucide-react";
import { Card } from "~/components/ui/card";

interface WeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  description: string;
  name: string;
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
  aqi: number;
  pm2_5: number;
  pm10: number;
  co: number;
  no2: number;
  o3: number;
  so2: number;
}

const SANTIAGO_COORDS = { lat: -33.45, lng: -70.65 };

export function EnhancedWeatherWidget({ lat, lng }: { lat: number; lng: number }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [uv, setUV] = useState<UVData | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    loadWeatherData();
    // Refresh every 30 minutes
    const interval = setInterval(loadWeatherData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [lat, lng]); // Reload when location changes

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/weather/all?lat=${lat}&lng=${lng}`,
      );
      const data = await response.json();

      setWeather(data.current);
      setUV(data.uv);
      setAirQuality(data.airQuality);
      setLastUpdated(new Date().toLocaleTimeString("es-CL"));
    } catch (err) {
      console.error("Error loading weather:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !weather) {
    return (
      <div className="absolute top-20 right-3 md:top-24 md:right-6 z-[998] pointer-events-none">
        <Card className="pointer-events-auto theme-widget p-3">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5 animate-pulse theme-text-muted" />
            <span className="text-xs theme-text-muted">Cargando...</span>
          </div>
        </Card>
      </div>
    );
  }

  const getUVLevel = (value: number) => {
    if (value <= 2) return { label: "Bajo", color: "text-green-500" };
    if (value <= 5) return { label: "Moderado", color: "text-yellow-500" };
    if (value <= 7) return { label: "Alto", color: "text-orange-500" };
    if (value <= 10) return { label: "Muy Alto", color: "text-red-500" };
    return { label: "Extremo", color: "text-purple-500" };
  };

  const getAQILevel = (aqi: number) => {
    const levels = [
      { max: 1, label: "Buena", color: "text-green-500" },
      { max: 2, label: "Aceptable", color: "text-yellow-500" },
      { max: 3, label: "Moderada", color: "text-orange-500" },
      { max: 4, label: "Mala", color: "text-red-500" },
      { max: 5, label: "Muy Mala", color: "text-purple-500" },
    ];
    return levels.find((l) => aqi <= l.max) || levels[4];
  };

  const uvLevel = uv ? getUVLevel(uv.value) : null;
  const aqiLevel = airQuality ? getAQILevel(airQuality.aqi) : null;

  const getWeatherIcon = (iconCode: string) => {
    // OpenWeatherMap icon codes mapping
    // https://openweathermap.org/weather-conditions
    if (iconCode === "01d") return <Sun className="h-full w-full text-yellow-500" />;
    if (iconCode === "01n") return <Moon className="h-full w-full text-slate-200" />;

    if (iconCode === "02d") return <CloudSun className="h-full w-full text-yellow-400" />;
    if (iconCode === "02n") return <CloudMoon className="h-full w-full text-slate-400" />;

    if (iconCode.startsWith("03") || iconCode.startsWith("04"))
      return <Cloud className="h-full w-full text-gray-400" />;

    if (iconCode.startsWith("09") || iconCode.startsWith("10"))
      return <CloudRain className="h-full w-full text-blue-400" />;

    if (iconCode.startsWith("11"))
      return <CloudLightning className="h-full w-full text-purple-400" />;

    if (iconCode.startsWith("13"))
      return <Snowflake className="h-full w-full text-cyan-200" />;

    if (iconCode.startsWith("50"))
      return <CloudFog className="h-full w-full text-slate-400" />;

    // Default fallback
    return iconCode.includes("n")
      ? <Moon className="h-full w-full text-slate-200" />
      : <Sun className="h-full w-full text-yellow-500" />;
  };

  return (
    <div className="absolute top-20 right-3 md:top-24 md:right-6 z-[998] pointer-events-none">
      <Card
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="pointer-events-auto theme-widget cursor-pointer hover:shadow-xl transition-all"
      >
        {/* Collapsed View */}
        {isCollapsed && (
          <div className="p-3 flex items-center gap-3">
            <div className="h-8 w-8">
              {getWeatherIcon(weather.icon)}
            </div>
            <div>
              <p className="text-lg font-bold theme-text-primary leading-none">
                {Math.round(weather.temp)}°C
              </p>
              <p className="text-xs theme-text-muted capitalize">
                {weather.description}
              </p>
            </div>
          </div>
        )}

        {/* Expanded View */}
        {!isCollapsed && (
          <div className="p-4 min-w-[280px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10">
                  {getWeatherIcon(weather.icon)}
                </div>
                <div>
                  <p className="text-sm font-semibold theme-text-secondary">
                    {weather.name || "Ubicación en Mapa"}
                  </p>
                  <p className="text-2xl font-bold theme-text-primary leading-none">
                    {Math.round(weather.temp)}°C
                  </p>
                  <p className="text-xs theme-text-muted capitalize">
                    {weather.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Weather Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 theme-text-muted" />
                <div>
                  <p className="text-xs theme-text-muted">Sensación</p>
                  <p className="text-sm font-semibold theme-text-primary">
                    {Math.round(weather.feels_like)}°C
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 theme-text-muted" />
                <div>
                  <p className="text-xs theme-text-muted">Humedad</p>
                  <p className="text-sm font-semibold theme-text-primary">
                    {weather.humidity}%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 theme-text-muted" />
                <div>
                  <p className="text-xs theme-text-muted">Viento</p>
                  <p className="text-sm font-semibold theme-text-primary">
                    {Math.round(weather.wind_speed * 3.6)} km/h
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 theme-text-muted" />
                <div>
                  <p className="text-xs theme-text-muted">Visibilidad</p>
                  <p className="text-sm font-semibold theme-text-primary">
                    {(weather.visibility / 1000).toFixed(1)} km
                  </p>
                </div>
              </div>
            </div>

            {/* UV Index */}
            {uv && uvLevel && (
              <div className="border-t theme-border pt-3 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 theme-text-muted" />
                    <span className="text-xs theme-text-muted">Índice UV</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold theme-text-primary">
                      {uv.value.toFixed(1)}
                    </p>
                    <p className={`text-xs font-semibold ${uvLevel.color}`}>
                      {uvLevel.label}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Air Quality */}
            {airQuality && aqiLevel && (
              <div className="border-t theme-border pt-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4 theme-text-muted" />
                    <span className="text-xs theme-text-muted">
                      Calidad del Aire
                    </span>
                  </div>
                  <p className={`text-xs font-semibold ${aqiLevel.color}`}>
                    {aqiLevel.label}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="theme-text-muted">PM2.5:</span>{" "}
                    <span className="font-semibold theme-text-primary">
                      {airQuality.pm2_5.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="theme-text-muted">PM10:</span>{" "}
                    <span className="font-semibold theme-text-primary">
                      {airQuality.pm10.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Timestamp */}
            <p className="text-[10px] theme-text-muted mt-3 text-center opacity-75">
              Actualizado: {lastUpdated}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
