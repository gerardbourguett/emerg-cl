import { useEffect, useState } from "react";

export function WeatherWidget() {
    const [data, setData] = useState<any>(null);
    const [isCollapsed, setIsCollapsed] = useState(true);

    useEffect(() => {
        fetch("/api/meteo/condiciones")
            .then((res) => res.json())
            .then((json) => setData(json.data))
            .catch((err) => console.error("Error loading meteo:", err));
    }, []);

    if (!data) return null;

    return (
        <div className="absolute top-20 right-3 md:top-24 md:right-6 z-[998] pointer-events-none">
            <div 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="pointer-events-auto bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-xl rounded-2xl transition-all cursor-pointer hover:bg-slate-900/90"
            >
                {/* Versión colapsada (móvil) */}
                {isCollapsed && (
                    <div className="p-2.5 flex items-center gap-2">
                        <span className="text-xl">☀️</span>
                        <div className="text-xs">
                            <p className="text-yellow-400 font-bold leading-tight">{data.temperature}</p>
                        </div>
                    </div>
                )}
                
                {/* Versión expandida */}
                {!isCollapsed && (
                    <div className="p-3">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">☀️</span>
                            <div>
                                <p className="text-white text-sm font-bold">{data.location}</p>
                                <p className="text-yellow-400 text-lg font-bold leading-none">{data.temperature}</p>
                            </div>
                        </div>
                        {data.description && (
                            <p className="text-xs text-slate-400 border-t border-white/10 pt-2">
                                {data.description}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
