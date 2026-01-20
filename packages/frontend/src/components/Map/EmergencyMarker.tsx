import { Marker, Popup } from "react-leaflet";
import { divIcon } from "leaflet";
import type { Emergency } from "../../types/emergency";
import { EMERGENCY_ICONS, SEVERITY_COLORS } from "../../types/emergency";

interface EmergencyMarkerProps {
    emergency: Emergency;
    onClick?: () => void;
}

export function EmergencyMarker({ emergency, onClick }: EmergencyMarkerProps) {
    const { tipo, severidad, lat, lng } = emergency;
    const color = SEVERITY_COLORS[severidad];
    const iconChar = EMERGENCY_ICONS[tipo];

    const size = severidad === "critica" ? 28 : severidad === "alta" ? 24 : 20;
    const pulseClass = severidad === "critica" ? "animate-pulse" : "";

    const customIcon = divIcon({
        className: "custom-marker-wrapper",
        html: `
      <div class="${pulseClass}" style="
        width: ${size}px;
        height: ${size}px;
        background: ${color.bg};
        border: 3px solid ${color.border};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size * 0.6}px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        color: black;
        cursor: pointer;
        transition: transform 0.2s ease;
      ">${iconChar}</div>
    `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2],
    });

    return (
        <Marker 
            position={[lat, lng]} 
            icon={customIcon}
            eventHandlers={{
                click: () => {
                    if (onClick) {
                        onClick();
                    }
                }
            }}
        >
            <Popup className="emergency-popup" closeButton={true} maxWidth={300}>
                <div className="p-3 min-w-[250px] bg-slate-900 rounded-lg">
                    <div className="flex items-start gap-3 mb-3">
                        <div
                            className="text-2xl flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: color.bg }}
                        >
                            {iconChar}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base text-white mb-1 line-clamp-2">
                                {emergency.titulo}
                            </h3>
                            <span
                                className="inline-block px-2 py-0.5 rounded text-xs font-bold uppercase"
                                style={{ backgroundColor: color.bg, color: "#000" }}
                            >
                                {severidad}
                            </span>
                        </div>
                    </div>
                    
                    <div className="space-y-2 text-sm border-t border-slate-700 pt-2">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Tipo:</span>
                            <span className="text-white font-medium">{tipo.replace("_", " ")}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Fuente:</span>
                            <span className="text-white font-medium text-xs">{emergency.fuente}</span>
                        </div>
                        
                        {emergency.magnitud && (
                            <div className="flex justify-between bg-yellow-500/10 px-2 py-1 rounded">
                                <span className="text-yellow-400 font-semibold">Magnitud:</span>
                                <span className="text-yellow-300 font-bold">{emergency.magnitud} ML</span>
                            </div>
                        )}
                        
                        {emergency.superficie_afectada && (
                            <div className="flex justify-between bg-red-500/10 px-2 py-1 rounded">
                                <span className="text-red-400 font-semibold">Superficie:</span>
                                <span className="text-red-300 font-bold">{emergency.superficie_afectada} ha</span>
                            </div>
                        )}
                    </div>

                    {onClick && (
                        <button
                            onClick={onClick}
                            className="mt-3 w-full py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 font-semibold rounded-lg transition text-sm"
                        >
                            Ver más detalles →
                        </button>
                    )}
                    
                    <p className="text-xs text-slate-500 mt-2 text-center">
                        {new Date(emergency.fecha_actualizacion).toLocaleString("es-CL", {
                            dateStyle: "short",
                            timeStyle: "short"
                        })}
                    </p>
                </div>
            </Popup>
        </Marker>
    );
}
