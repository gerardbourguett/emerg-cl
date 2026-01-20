import { useEffect, useState } from "react";

interface ConafStats {
    total: string;
    en_combate: string;
    controlado: string;
    bajo_observacion: string;
}

export function StatsWidget() {
    const [stats, setStats] = useState<ConafStats | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(true);

    useEffect(() => {
        fetch("/api/conaf/situacion")
            .then((res) => res.json())
            .then((json) => {
                if (json.data && !json.data.error) {
                    setStats(json.data);
                }
            })
            .catch((err) => console.error("Error loading CONAF stats:", err));
    }, []);

    if (!stats) return null;

    return (
        <div className="absolute top-36 right-3 md:top-6 md:right-6 z-[998] pointer-events-none">
            <div 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="pointer-events-auto bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-xl rounded-2xl transition-all cursor-pointer hover:bg-slate-900/90"
            >
                {/* Versión colapsada (móvil) */}
                {isCollapsed && (
                    <div className="p-2.5 flex items-center gap-2">
                        <span className="text-xl">🔥</span>
                        <div className="text-xs">
                            <p className="text-red-400 font-bold">{stats.total}</p>
                            <p className="text-slate-500 text-[9px] uppercase">Total</p>
                        </div>
                    </div>
                )}
                
                {/* Versión expandida */}
                {!isCollapsed && (
                    <div className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">🔥</span>
                            <h3 className="text-white text-xs font-bold uppercase tracking-wide">
                                Incendios CONAF
                            </h3>
                        </div>
                        <div className="flex gap-3 border-t border-white/10 pt-2">
                            <StatItem label="Total" value={stats.total} color="red" />
                            <StatItem label="Combate" value={stats.en_combate} color="orange" />
                            <StatItem label="Control" value={stats.controlado} color="green" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatItem({ label, value, color }: { label: string; value: string; color: string }) {
    const colorClass = {
        red: "text-red-400",
        orange: "text-orange-400",
        green: "text-green-400",
    }[color] || "text-white";

    return (
        <div className="flex flex-col items-center">
            <span className={`${colorClass} font-bold text-lg leading-none`}>{value}</span>
            <span className="text-slate-400 text-[9px] uppercase tracking-wider mt-0.5">{label}</span>
        </div>
    );
}
