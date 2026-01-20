import { useEffect, useState } from "react";

interface ConafStats {
    total: string;
    en_combate: string;
    controlado: string;
    bajo_observacion: string;
}

export function StatsWidget() {
    const [stats, setStats] = useState<ConafStats | null>(null);

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
        <div className="absolute top-20 right-4 md:top-6 md:right-20 z-[999] p-3 md:p-4 rounded-2xl md:rounded-3xl bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-2xl skew-y-0 transition-all hover:bg-slate-900/70 font-sans group flex gap-3 md:gap-6 scale-90 md:scale-100 origin-top-right">
            <div className="flex flex-col items-center">
                <span className="text-red-400 font-bold text-xl leading-none">{stats.total}</span>
                <span className="text-slate-400 text-[10px] uppercase tracking-wider">Total</span>
            </div>
            <div className="w-px bg-white/10"></div>
            <div className="flex flex-col items-center">
                <span className="text-orange-400 font-bold text-xl leading-none">{stats.en_combate}</span>
                <span className="text-slate-400 text-[10px] uppercase tracking-wider">Combate</span>
            </div>
            <div className="w-px bg-white/10"></div>
            <div className="flex flex-col items-center">
                <span className="text-green-400 font-bold text-xl leading-none">{stats.controlado}</span>
                <span className="text-slate-400 text-[10px] uppercase tracking-wider">Controlado</span>
            </div>
        </div>
    );
}
