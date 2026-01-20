import { Marker, Popup } from "react-leaflet";
import { divIcon } from "leaflet";
import type { Emergency } from "../../types/emergency";
import { EMERGENCY_ICONS, SEVERITY_COLORS } from "../../types/emergency";

interface EmergencyMarkerProps {
    emergency: Emergency;
}

export function EmergencyMarker({ emergency }: EmergencyMarkerProps) {
    const { tipo, severidad, lat, lng } = emergency;
    const color = SEVERITY_COLORS[severidad];
    const iconChar = EMERGENCY_ICONS[tipo];

    const size = severidad === "critica" ? 24 : severidad === "alta" ? 20 : 16;
    const pulseClass = severidad === "critica" ? "animate-pulse" : "";

    const customIcon = divIcon({
        className: "custom-marker-wrapper",
        html: `
      <div class="${pulseClass}" style="
        width: ${size}px;
        height: ${size}px;
        background: ${color.bg};
        border: 2px solid ${color.border};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size * 0.6}px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        color: black;
      ">${iconChar}</div>
    `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2],
    });

    return (
        <Marker position={[lat, lng]} icon={customIcon}>
            <Popup className="bg-slate-900 text-slate-100 rounded-lg">
                <div className="p-2 min-w-[200px]">
                    <h3 className="font-bold text-lg mb-2 border-b border-slate-700 pb-1">
                        {emergency.titulo}
                    </h3>
                    <div className="text-sm space-y-1">
                        <p>
                            <span className="text-slate-400">Tipo:</span> {tipo}
                        </p>
                        <p>
                            <span className="text-slate-400">Severidad:</span>{" "}
                            <span
                                className="px-2 py-0.5 rounded text-xs font-bold uppercase"
                                style={{ backgroundColor: color.bg, color: "black" }}
                            >
                                {severidad}
                            </span>
                        </p>
                        <p>
                            <span className="text-slate-400">Fuente:</span> {emergency.fuente}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                            Updated: {new Date(emergency.fecha_actualizacion).toLocaleString()}
                        </p>
                    </div>
                </div>
            </Popup>
        </Marker>
    );
}
