import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Toaster } from "sonner";
import { MapControls } from "../UI/MapControls";
import { AlertsTicker } from "../UI/AlertsTicker";
import { EnhancedWeatherWidget } from "../Widgets/EnhancedWeatherWidget";
import { StatsWidget } from "../UI/StatsWidget";
import { EmergencyNumbers } from "../UI/EmergencyNumbers";
import { EmergencyDetailPanel } from "../UI/EmergencyDetailPanel";
import { AlertSystem } from "../Alerts/AlertSystem";
import { AlertBanner } from "../Alerts/AlertBanner";
import { useTheme } from "../../hooks/useTheme";
import type { Emergency } from "../../types/emergency";
import { SEVERITY_COLORS } from "../../types/emergency";

// Mapbox access token
mapboxgl.accessToken = "pk.eyJ1IjoiZ2VyYXJkYm91cmd1ZXR0IiwiYSI6ImNtNTZ3emZxbDNqeHoycXE2dWFyYmYyeXYifQ.pwHT8EVzcl6ImooofWgmcw";

const TERRITORIES = {
  continental: { center: [-71, -35] as [number, number], zoom: 5 },
  pascua: { center: [-109.35, -27.11] as [number, number], zoom: 11 },
  juanfernandez: { center: [-78.85, -33.64] as [number, number], zoom: 11 },
  antartica: { center: [-58.9, -62.2] as [number, number], zoom: 8 },
};

// Emergency type icons
const EMERGENCY_ICONS: Record<string, string> = {
  seismo: "📍",
  incendio_forestal: "🔥",
  alerta_meteorologica: "⚠️",
  tsunami: "🌊",
};

// Map styles for light/dark themes
const MAP_STYLES = {
  light: "mapbox://styles/mapbox/light-v11",
  dark: "mapbox://styles/mapbox/dark-v11",
};

export default function MapboxMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [filter, setFilter] = useState("all");
  const [selectedEmergency, setSelectedEmergency] = useState<Emergency | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const { theme } = useTheme();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_STYLES[theme],
      center: TERRITORIES.continental.center,
      zoom: TERRITORIES.continental.zoom,
      pitch: 0,
      bearing: 0,
    });

    map.current.on("load", () => {
      setMapLoaded(true);
      console.log("🗺️  Mapbox map loaded");
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({ showCompass: true }),
      "bottom-right"
    );

    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl(), "bottom-right");

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update map style when theme changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    map.current.setStyle(MAP_STYLES[theme]);
    console.log(`🎨 Map style changed to ${theme} mode`);
  }, [theme, mapLoaded]);

  // Fetch emergencies
  const loadEmergencies = async () => {
    try {
      // Fetch all emergencies from the main endpoint
      const response = await fetch("http://localhost:3000/api/emergencias");
      const data = await response.json();
      setEmergencies(data.emergencies || []);
      console.log(`📊 Loaded ${data.emergencies?.length || 0} emergencies`);
    } catch (err) {
      console.error("Failed to load emergencies", err);
    }
  };

  useEffect(() => {
    loadEmergencies();
    const interval = setInterval(loadEmergencies, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update markers when emergencies or filter changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Filter emergencies
    const filteredEmergencies = emergencies.filter((e) => {
      if (filter === "all") return true;
      if (filter === "alerta") return e.fuente === "SENAPRED Telegram";
      return e.tipo === filter;
    });

    // Add markers for filtered emergencies
    filteredEmergencies.forEach((emergency) => {
      const el = createMarkerElement(emergency);

      // Create popup with emergency info
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        maxWidth: "300px",
      }).setHTML(createPopupHTML(emergency));

      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([emergency.lng, emergency.lat])
        .setPopup(popup)
        .addTo(map.current!);

      // Add click handler for mobile detail panel
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        setSelectedEmergency(emergency);

        // On larger screens, also fly to location
        if (window.innerWidth >= 768) {
          map.current?.flyTo({
            center: [emergency.lng, emergency.lat],
            zoom: 12,
            duration: 1500,
          });
        }
      });

      markersRef.current.push(marker);
    });
  }, [emergencies, filter, mapLoaded]);

  // Fly to territory
  const handleFlyTo = (territory: keyof typeof TERRITORIES) => {
    if (!map.current) return;

    const target = TERRITORIES[territory];
    map.current.flyTo({
      center: target.center,
      zoom: target.zoom,
      duration: 2000,
    });
  };

  return (
    <div className="relative w-full h-screen theme-bg-primary overflow-hidden">
      {/* Toast notifications */}
      <Toaster position="top-right" richColors closeButton />

      {/* Alert system (monitors for critical emergencies) */}
      <AlertSystem emergencies={emergencies} />

      {/* Critical alerts banner */}
      <AlertBanner emergencies={emergencies} />

      <MapControls
        emergencies={emergencies}
        filter={filter}
        onFilterChange={setFilter}
        onFlyTo={handleFlyTo}
      />

      <AlertsTicker />
      <EnhancedWeatherWidget />
      <StatsWidget />

      {/* Mapbox container */}
      <div ref={mapContainer} className="w-full h-full z-0" />

      <EmergencyNumbers />

      {/* Detail panel for mobile */}
      <EmergencyDetailPanel
        emergency={selectedEmergency}
        onClose={() => setSelectedEmergency(null)}
      />
    </div>
  );
}

/**
 * Create a custom marker element for an emergency
 */
function createMarkerElement(emergency: Emergency): HTMLDivElement {
  // Container div - positioned by Mapbox, NO transforms applied here by us
  const container = document.createElement("div");
  container.className = "emergency-marker-container";
  container.style.cssText = `
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  `;

  // Inner div - handles the visual style and hover scale
  const inner = document.createElement("div");
  inner.className = "emergency-marker-inner";

  const color = SEVERITY_COLORS[emergency.severidad];
  const icon = EMERGENCY_ICONS[emergency.tipo] || "📍";

  inner.style.cssText = `
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: ${color.bg};
    border: 2px solid rgba(255, 255, 255, 0.9);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  `;

  inner.innerHTML = icon;

  // Hover effect applied to INNER element only
  container.addEventListener("mouseenter", () => {
    inner.style.transform = "scale(1.25)";
    inner.style.boxShadow = "0 8px 12px rgba(0, 0, 0, 0.5)";
    inner.style.zIndex = "100";
    container.style.zIndex = "100"; // Lift container z-index temporarily
  });

  container.addEventListener("mouseleave", () => {
    inner.style.transform = "scale(1)";
    inner.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.3)";
    inner.style.zIndex = "1";
    container.style.zIndex = "1";
  });

  container.appendChild(inner);
  return container;
}

/**
 * Create popup HTML content for an emergency
 */
function createPopupHTML(emergency: Emergency): string {
  const severityLabels = {
    critica: "Crítica",
    alta: "Alta",
    media: "Media",
    baja: "Baja",
  };

  const tipoLabels = {
    seismo: "Sismo",
    incendio_forestal: "Incendio Forestal",
    alerta_meteorologica: "Alerta Meteorológica",
    tsunami: "Tsunami",
  };

  const color = SEVERITY_COLORS[emergency.severidad];
  const fecha = new Date(emergency.fecha_actualizacion).toLocaleString("es-CL");

  // Extract metadata info
  let metadataHTML = "";
  if (emergency.metadata) {
    const metadata = emergency.metadata as any;

    if (metadata.magnitud) {
      metadataHTML += `<p class="text-sm"><strong>Magnitud:</strong> ${metadata.magnitud}</p>`;
    }
    if (metadata.profundidad) {
      metadataHTML += `<p class="text-sm"><strong>Profundidad:</strong> ${metadata.profundidad} km</p>`;
    }
    if (metadata.superficie_afectada) {
      metadataHTML += `<p class="text-sm"><strong>Superficie:</strong> ${metadata.superficie_afectada} ha</p>`;
    }
  }

  return `
    <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 250px;">
      <div style="
        background: ${color.bg};
        color: white;
        padding: 8px 12px;
        margin: -10px -10px 10px -10px;
        border-radius: 3px 3px 0 0;
        font-weight: 600;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
      ">
        <span>${EMERGENCY_ICONS[emergency.tipo] || "📍"}</span>
        <span>${tipoLabels[emergency.tipo] || emergency.tipo}</span>
      </div>
      
      <div style="padding: 4px 0;">
        <h3 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #1e293b;">
          ${emergency.titulo}
        </h3>
        
        ${emergency.descripcion ? `
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #475569; line-height: 1.4;">
            ${emergency.descripcion}
          </p>
        ` : ""}
        
        <div style="
          display: inline-block;
          background: ${color.bg};
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 8px;
        ">
          ${severityLabels[emergency.severidad]}
        </div>
        
        ${metadataHTML}
        
        <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b;">
          <strong>Fuente:</strong> ${emergency.fuente}<br>
          <strong>Actualizado:</strong> ${fecha}
        </p>
        
        <p style="margin: 6px 0 0 0; font-size: 11px; color: #94a3b8;">
          📍 ${emergency.lat.toFixed(4)}, ${emergency.lng.toFixed(4)}
        </p>
      </div>
    </div>
  `;
}
