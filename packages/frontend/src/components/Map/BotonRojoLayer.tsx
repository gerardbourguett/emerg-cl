import { useEffect, useState } from "react";
import { GeoJSON, LayersControl, useMap } from "react-leaflet";
import L from "leaflet";

const BOTON_ROJO_API =
    "https://services5.arcgis.com/A1ELWse9bRAi2JiV/arcgis/rest/services/Boton_Rojo/FeatureServer/0/query?f=geojson&where=1=1&outFields=*";

export function BotonRojoLayer() {
    const [data, setData] = useState<any>(null);
    const map = useMap();

    useEffect(() => {
        fetch(BOTON_ROJO_API)
            .then((res) => res.json())
            .then((geojson) => {
                setData(geojson);
                // Optional: fit bounds if data exists
                if (geojson.features.length > 0) {
                    // We won't auto-fit for now to avoid disrupting user navigation
                    // but it's good to know we received data
                    console.log("Botón Rojo data loaded:", geojson.features.length, "features");
                }
            })
            .catch((err) => console.error("Error loading Botón Rojo:", err));
    }, []);

    if (!data) return null;

    return (
        <LayersControl.Overlay name="Botón Rojo (Riesgo Incendio)">
            <GeoJSON
                data={data}
                style={{
                    color: "#ff4757",
                    weight: 2,
                    opacity: 0.8,
                    fillColor: "#ff6b6b",
                    fillOpacity: 0.3,
                }}
                onEachFeature={(feature, layer) => {
                    if (feature.properties) {
                        layer.bindPopup(
                            `
              <div class="p-2">
                <h3 class="font-bold border-b border-white/20 mb-1">Zona de Riesgo</h3>
                <p class="text-sm">Comuna: ${feature.properties.COMUNA || "N/A"}</p>
                <p class="text-sm">Provincia: ${feature.properties.PROVINCIA || "N/A"}</p>
                <p class="text-sm">Región: ${feature.properties.REGION || "N/A"}</p>
              </div>
              `
                        );
                    }
                }}
            />
        </LayersControl.Overlay>
    );
}
