import { Marker, Popup, LayersControl } from "react-leaflet";
import { divIcon } from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { ALBERGUES_DATA } from "../../data/albergues";

export function AlberguesLayer() {
    const iconMarkup = renderToStaticMarkup(
        <div className="text-2xl drop-shadow-lg">⛺</div>
    );

    const shelterIcon = divIcon({
        html: iconMarkup,
        className: "bg-transparent",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
    });

    return (
        <LayersControl.Overlay name="Albergues SENAPRED" checked>
            <>
                {ALBERGUES_DATA.map((albergue) => (
                    <Marker
                        key={albergue.id}
                        position={[albergue.lat, albergue.lng]}
                        icon={shelterIcon}
                    >
                        <Popup>
                            <div className="font-sans min-w-[200px]">
                                <h3 className="font-bold text-blue-600 text-sm mb-1">⛺ {albergue.nombre}</h3>
                                <p className="text-xs text-gray-600 mb-1">{albergue.direccion}</p>
                                <p className="text-xs font-medium text-gray-800">
                                    {albergue.comuna}, {albergue.region}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </>
        </LayersControl.Overlay>
    );
}
