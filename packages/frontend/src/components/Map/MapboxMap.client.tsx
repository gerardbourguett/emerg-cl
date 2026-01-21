import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Toaster } from "sonner";
import { MapControls } from "../UI/MapControls";
import { AlertsTicker } from "../UI/AlertsTicker";
import { EnhancedWeatherWidget } from "../Widgets/EnhancedWeatherWidget";
import { EmergencyNumbers } from "../UI/EmergencyNumbers";
import { EmergencyDetailPanel } from "../UI/EmergencyDetailPanel";
import { EmergencySidebar } from "../UI/EmergencySidebar";
import { AlertSystem } from "../Alerts/AlertSystem";
import { AlertBanner } from "../Alerts/AlertBanner";
import { useTheme } from "../../hooks/useTheme";
import type { Emergency } from "../../types/emergency";
import { SEVERITY_COLORS } from "../../types/emergency";
import { ALBERGUES_DATA } from "../../data/albergues";

// Mapbox access token
mapboxgl.accessToken = "pk.eyJ1IjoiZ2VyYXJkYm91cmd1ZXR0IiwiYSI6ImNtNTZ3emZxbDNqeHoycXE2dWFyYmYyeXYifQ.pwHT8EVzcl6ImooofWgmcw";

// Map styles for light/dark/satellite
const MAP_STYLES = {
  light: "mapbox://styles/mapbox/light-v11",
  dark: "mapbox://styles/mapbox/dark-v11",
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
};

const TERRITORIES = {
  continental: { center: [-71, -35] as [number, number], zoom: 5 },
  pascua: { center: [-109.35, -27.11] as [number, number], zoom: 11 },
  juanfernandez: { center: [-78.85, -33.64] as [number, number], zoom: 11 },
  antartica: { center: [-58.9, -62.2] as [number, number], zoom: 8 },
};





export default function MapboxMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const alberguesMarkersRef = useRef<mapboxgl.Marker[]>([]);

  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [filter, setFilter] = useState("all");
  const [selectedEmergency, setSelectedEmergency] = useState<Emergency | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  // showAlbergues state removed in favor of filter logic

  const { theme } = useTheme();
  // Local style state to allow toggling satellite independently of theme
  const [currentStyle, setCurrentStyle] = useState<string>(theme === "dark" ? MAP_STYLES.dark : MAP_STYLES.light);
  const [isSatellite, setIsSatellite] = useState(false);

  // Track map center for weather widget
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(TERRITORIES.continental.center as any);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Use explicit center coordinates for initialization
    const initialCenter = TERRITORIES.continental.center;
    setMapCenter({ lat: initialCenter[1], lng: initialCenter[0] });

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: currentStyle,
      center: initialCenter,
      zoom: TERRITORIES.continental.zoom,
      pitch: 0,
      bearing: 0,
    });

    map.current.on("load", () => {
      setMapLoaded(true);
      console.log("🗺️  Mapbox map loaded");
    });

    // Update center on move end
    map.current.on("moveend", () => {
      const center = map.current!.getCenter();
      setMapCenter({ lat: center.lat, lng: center.lng });
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

  // Update map style when theme changes (only if not in satellite mode)
  useEffect(() => {
    if (!map.current || !mapLoaded || isSatellite) return;

    const newStyle = theme === "dark" ? MAP_STYLES.dark : MAP_STYLES.light;
    map.current.setStyle(newStyle);
    setCurrentStyle(newStyle);
    console.log(`🎨 Map style changed to ${theme} mode`);
  }, [theme, mapLoaded, isSatellite]);

  const toggleSatellite = () => {
    if (!map.current) return;

    if (isSatellite) {
      // Revert to theme
      const themeStyle = theme === "dark" ? MAP_STYLES.dark : MAP_STYLES.light;
      map.current.setStyle(themeStyle);
      setCurrentStyle(themeStyle);
      setIsSatellite(false);
    } else {
      // Switch to satellite
      map.current.setStyle(MAP_STYLES.satellite);
      setCurrentStyle(MAP_STYLES.satellite);
      setIsSatellite(true);
    }
  };

  // Fetch emergencies
  const loadEmergencies = async () => {
    try {
      // Fetch all emergencies from the main endpoint
      const response = await fetch("/api/emergencias");
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
      // If filtering for albergues specifically, hide emergencies
      if (filter === "albergues") return false;

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

  // Add albergues markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing albergues markers
    alberguesMarkersRef.current.forEach((marker) => marker.remove());
    alberguesMarkersRef.current = [];

    // Only add if filter is 'all' or 'albergues'
    const showAlbergues = filter === "all" || filter === "albergues";
    if (!showAlbergues) return;

    // Add markers for albergues
    ALBERGUES_DATA.forEach((albergue) => {
      const el = createAlbergueMarkerElement(albergue);

      // Create popup with albergue info
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        maxWidth: "300px",
      }).setHTML(createAlberguePopupHTML(albergue));

      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([albergue.lng, albergue.lat])
        .setPopup(popup)
        .addTo(map.current!);

      alberguesMarkersRef.current.push(marker);
    });
  }, [mapLoaded, filter]);

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

  // Handle emergency click from sidebar
  const handleEmergencyClick = (emergency: Emergency) => {
    if (!map.current) return;

    // Fly to emergency location
    map.current.flyTo({
      center: [emergency.lng, emergency.lat],
      zoom: 14,
      duration: 1500,
    });

    // Set as selected emergency for detail panel
    setSelectedEmergency(emergency);
  };

  return (
    <div className="relative w-full h-screen theme-bg-primary overflow-hidden">
      {/* Toast notifications */}
      <Toaster position="top-right" richColors closeButton />

      {/* Alert system (monitors for critical emergencies) */}
      <AlertSystem emergencies={emergencies} />

      {/* AlertBanner removed as per user request */}

      {/* Satellite Toggle Button */}
      <button
        onClick={toggleSatellite}
        className="absolute bottom-32 right-3 md:bottom-24 md:right-14 z-[990] bg-card/80 backdrop-blur-md p-2 rounded-lg border border-border shadow-lg hover:bg-card transition-colors group"
        title={isSatellite ? "Ver Mapa Base" : "Ver Satélite"}
      >
        <div className="relative w-8 h-8 rounded-md overflow-hidden border border-border/50">
          {isSatellite ? (
            // Show "Map" preview when in Satellite mode
            <div className="w-full h-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">MAP</div>
          ) : (
            // Show "Satellite" preview (simplified visual)
            <div className="w-full h-full bg-emerald-900 flex items-center justify-center">
              <div className="w-full h-1/2 bg-blue-500/50 absolute bottom-0"></div>
              <span className="relative z-10 text-[8px] text-white font-bold drop-shadow-md">SAT</span>
            </div>
          )}
        </div>
      </button>

      <MapControls
        emergencies={emergencies}
        filter={filter}
        onFilterChange={setFilter}
        onFlyTo={handleFlyTo}
      />

      {/* AlertsTicker removed as per user request to clean up UI
      <AlertsTicker />
      */}

      {/* EnhancedWeatherWidget removed from top-right, moved next to SOS button */}

      {/* Emergency Sidebar */}
      <EmergencySidebar emergencies={emergencies} onEmergencyClick={handleEmergencyClick} />

      {/* Albergues Toggle Button removed (moved to filter) */}

      {/* Mapbox container */}
      <div ref={mapContainer} className="w-full h-full z-0" />

      <EmergencyNumbers />

      {/* Weather Widget - positioned next to SOS button */}
      <EnhancedWeatherWidget lat={mapCenter.lat} lng={mapCenter.lng} />

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

  // Minimalist dot marker style
  inner.style.cssText = `
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: ${color.bg};
    border: 2px solid white;
    box-shadow: 0 0 4px ${color.bg}, 0 2px 4px rgba(0,0,0,0.2);
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  `;

  // Hover effect
  container.addEventListener("mouseenter", () => {
    inner.style.transform = "scale(1.5)";
    inner.style.boxShadow = `0 0 12px ${color.bg}, 0 4px 8px rgba(0,0,0,0.3)`;
    inner.style.zIndex = "100";
    container.style.zIndex = "100";
  });

  container.addEventListener("mouseleave", () => {
    inner.style.transform = "scale(1)";
    inner.style.boxShadow = `0 0 4px ${color.bg}, 0 2px 4px rgba(0,0,0,0.2)`;
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
        gap: 8px;
      ">
        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.8);"></span>
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

/**
 * Create a custom marker element for an albergue
 */
function createAlbergueMarkerElement(albergues?: any): HTMLDivElement {
  const container = document.createElement("div");
  container.className = "albergue-marker-container";
  container.style.cssText = `
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  `;

  const inner = document.createElement("div");
  inner.className = "albergue-marker-inner";
  inner.style.cssText = `
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #10b981;
    border: 2px solid white;
    box-shadow: 0 0 4px #10b981, 0 2px 4px rgba(0,0,0,0.2);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  `;

  container.addEventListener("mouseenter", () => {
    inner.style.transform = "scale(1.4)";
    inner.style.boxShadow = "0 0 8px #10b981, 0 4px 6px rgba(0,0,0,0.3)";
    inner.style.zIndex = "100";
    container.style.zIndex = "100";
  });

  container.addEventListener("mouseleave", () => {
    inner.style.transform = "scale(1)";
    inner.style.boxShadow = "0 0 4px #10b981, 0 2px 4px rgba(0,0,0,0.2)";
    inner.style.zIndex = "1";
    container.style.zIndex = "1";
  });

  container.appendChild(inner);
  return container;
}

/**
 * Create popup HTML content for an albergue
 */
function createAlberguePopupHTML(albergue: typeof ALBERGUES_DATA[0]): string {
  return `
    <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 250px;">
      <div style="
        background: #10b981;
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
        <span>⛺</span>
        <span>Albergue SENAPRED</span>
      </div>
      
      <div style="padding: 4px 0;">
        <h3 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #1e293b;">
          ${albergue.nombre}
        </h3>
        
        <p style="margin: 0 0 4px 0; font-size: 13px; color: #475569;">
          <strong>📍 Dirección:</strong> ${albergue.direccion}
        </p>
        
        <p style="margin: 0 0 4px 0; font-size: 13px; color: #475569;">
          <strong>🏘️ Comuna:</strong> ${albergue.comuna}
        </p>
        
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #475569;">
          <strong>🗺️ Región:</strong> ${albergue.region}
        </p>
        
        <p style="margin: 6px 0 0 0; font-size: 11px; color: #94a3b8;">
          Coordenadas: ${albergue.lat.toFixed(4)}, ${albergue.lng.toFixed(4)}
        </p>
      </div>
    </div>
  `;
}
