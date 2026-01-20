import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, ZoomControl, useMap, LayersControl } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { EmergencyMarker } from "./EmergencyMarker";
import { BotonRojoLayer } from "./BotonRojoLayer";
import { MapControls } from "../UI/MapControls";
import { AlertsTicker } from "../UI/AlertsTicker";
import { WeatherWidget } from "../UI/WeatherWidget";
import { StatsWidget } from "../UI/StatsWidget";
import { EmergencyNumbers } from "../UI/EmergencyNumbers";
import { AlberguesLayer } from "./AlberguesLayer";
import type { Emergency } from "../../types/emergency";

const TERRITORIES = {
    continental: { center: [-35, -71] as [number, number], zoom: 5 },
    pascua: { center: [-27.11, -109.35] as [number, number], zoom: 11 },
    juanfernandez: { center: [-33.64, -78.85] as [number, number], zoom: 11 },
    antartica: { center: [-62.2, -58.9] as [number, number], zoom: 8 },
};

function FlyToController({
    target,
}: {
    target: { center: [number, number]; zoom: number } | null;
}) {
    const map = useMap();
    useEffect(() => {
        if (target) {
            map.flyTo(target.center, target.zoom, { duration: 1.5 });
        }
    }, [target, map]);
    return null;
}

export default function Map() {
    const [emergencies, setEmergencies] = useState<Emergency[]>([]);
    const [filter, setFilter] = useState("all");
    const [flyTarget, setFlyTarget] = useState<{
        center: [number, number];
        zoom: number;
    } | null>(null);

    // Fetch data
    const loadEmergencies = async () => {
        try {
            const [sismosRes, incendiosRes] = await Promise.all([
                fetch("/api/emergencias/tipo/seismo"),
                fetch("/api/emergencias/tipo/incendio_forestal"),
            ]);
            const sismos = await sismosRes.json();
            const incendios = await incendiosRes.json();
            setEmergencies([...sismos.emergencies, ...incendios.emergencies]);
        } catch (err) {
            console.error("Failed to load emergencies", err);
        }
    };

    useEffect(() => {
        loadEmergencies();
        const interval = setInterval(loadEmergencies, 30000);
        return () => clearInterval(interval);
    }, []);

    const filteredEmergencies = emergencies.filter((e) => {
        if (filter === "all") return true;
        if (filter === "alerta") return e.fuente === "SENAPRED Telegram";
        return e.tipo === filter;
    });

    return (
        <div className="relative w-full h-screen bg-slate-900 border-t border-slate-700">
            <MapControls
                emergencies={emergencies}
                filter={filter}
                onFilterChange={setFilter}
                onFlyTo={(t) => setFlyTarget(TERRITORIES[t])}
            />

            <AlertsTicker />
            <WeatherWidget />
            <StatsWidget />

            <MapContainer
                center={[-35, -71]}
                zoom={5}
                className="w-full h-full z-0"
                zoomControl={false}
                maxBounds={[
                    [-90, -120],
                    [-15, -50],
                ]}
            >
                <ZoomControl position="bottomright" />

                <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="Oscuro (CartoDB)">
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                        />
                    </LayersControl.BaseLayer>

                    <LayersControl.BaseLayer name="Satelital (ESRI)">
                        <TileLayer
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                        />
                    </LayersControl.BaseLayer>

                    <LayersControl.BaseLayer name="Claro (OSM)">
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                    </LayersControl.BaseLayer>

                    <BotonRojoLayer />
                    <AlberguesLayer />
                </LayersControl>

                <FlyToController target={flyTarget} />

                {/* @ts-ignore: Type mismatch in library but works at runtime */}
                <MarkerClusterGroup
                    chunkedLoading
                    maxClusterRadius={60}
                    spiderfyOnMaxZoom={true}
                    disableClusteringAtZoom={14}
                    showCoverageOnHover={false}
                    iconCreateFunction={(cluster: any) => {
                        const count = cluster.getChildCount();
                        let sizeClass = 'small';
                        let size = 40;
                        if (count >= 100) {
                            sizeClass = 'large';
                            size = 60;
                        } else if (count >= 10) {
                            sizeClass = 'medium';
                            size = 50;
                        }
                        return L.divIcon({
                            html: `<div class="cluster-icon cluster-${sizeClass}"><span>${count}</span></div>`,
                            className: '',
                            iconSize: L.point(size, size, true),
                        });
                    }}
                >
                    {filteredEmergencies.map((e) => (
                        <EmergencyMarker key={e.id} emergency={e} />
                    ))}
                </MarkerClusterGroup>
            </MapContainer>
            <EmergencyNumbers />
        </div>
    );
}
