import { useEffect, useState } from "react";
import { ALBERGUES_DATA } from "../../data/albergues";

interface ActionEvent {
    title: string;
    fecha: string;
    url: string;
}

// Interface matching the component's display needs, mapped from ALBERGUES_DATA
interface AlbergueUI {
    region: string;
    provincia: string;
    comuna: string;
    lugar: string;
}

export function AlertsTicker() {
    const [events, setEvents] = useState<ActionEvent[]>([]);
    // Initialize with hardcoded data explicitly
    const [albergues, setAlbergues] = useState<AlbergueUI[]>(
        ALBERGUES_DATA.map(a => ({
            region: a.region,
            provincia: "Biobío", // Default or derived if needed, though data mostly lacks it
            comuna: a.comuna,
            lugar: a.nombre
        }))
    );
    const [activeTab, setActiveTab] = useState<"eventos" | "albergues">("eventos");
    const [collapsed, setCollapsed] = useState(true);

    useEffect(() => {
        // Fetch Events
        fetch("/api/senapred/eventos")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data.data)) setEvents(data.data.slice(0, 5));
            })
            .catch(console.error);

        // Albergues are now static, no fetch needed
    }, []);

    if (events.length === 0 && albergues.length === 0) return null;

    return (
        <div className="absolute top-[80px] md:top-24 left-4 right-4 md:left-6 md:right-auto z-[990] md:w-80 pointer-events-none transition-all flex flex-col gap-2">
            <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-xl overflow-hidden shadow-xl shadow-black/20 pointer-events-auto ring-1 ring-white/5">
                {/* Compact Header */}
                <div
                    onClick={() => setCollapsed(!collapsed)}
                    className="flex items-center justify-between px-4 py-3 bg-slate-900/60 cursor-pointer hover:bg-slate-900/80 transition-colors"
                >
                    <div className="flex items-center gap-2.5">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                        <span className="text-slate-200 text-sm font-semibold tracking-wide">SENAPRED</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <span>{collapsed ? "Mostrar" : "Ocultar"}</span>
                        <span className={`transform transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}>▼</span>
                    </div>
                </div>

                {/* Content */}
                {!collapsed && (
                    <div className="animate-in slide-in-from-top-2 duration-200">
                        {/* Minimal Tabs */}
                        <div className="flex border-b border-slate-800">
                            <button
                                onClick={() => setActiveTab("eventos")}
                                className={`flex-1 py-2 text-[11px] uppercase tracking-wider font-semibold transition-colors ${activeTab === "eventos"
                                    ? "text-red-400 bg-red-500/5"
                                    : "text-slate-500 hover:text-slate-300"
                                    }`}
                            >
                                Alertas
                            </button>
                            <button
                                onClick={() => setActiveTab("albergues")}
                                className={`flex-1 py-2 text-[11px] uppercase tracking-wider font-semibold transition-colors ${activeTab === "albergues"
                                    ? "text-blue-400 bg-blue-500/5"
                                    : "text-slate-500 hover:text-slate-300"
                                    }`}
                            >
                                Albergues <span className="text-slate-600">({albergues.length})</span>
                            </button>
                        </div>

                        {/* List */}
                        <div className="max-h-60 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {activeTab === "eventos" ? (
                                <>
                                    {events.map((e, i) => (
                                        <a
                                            key={i}
                                            href={e.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group"
                                        >
                                            <p className="text-slate-300 text-xs font-medium leading-relaxed group-hover:text-slate-100 transition-colors">
                                                {e.title}
                                            </p>
                                            <div className="mt-1.5 flex items-center justify-between">
                                                <span className="text-[10px] text-slate-600 font-mono">{e.fecha}</span>
                                                <span className="text-[10px] text-red-500/0 group-hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0">
                                                    Ver más →
                                                </span>
                                            </div>
                                        </a>
                                    ))}
                                    {events.length === 0 && (
                                        <div className="text-center py-8">
                                            <p className="text-slate-600 text-xs">Sin alertas activas</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    {albergues.map((a, i) => (
                                        <div
                                            key={i}
                                            className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10"
                                        >
                                            <div className="flex items-start justify-between">
                                                <p className="text-blue-200 text-xs font-semibold">{a.lugar}</p>
                                                <span className="text-[9px] text-blue-400/70 border border-blue-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                    Refugio
                                                </span>
                                            </div>
                                            <p className="text-slate-400 text-[10px] mt-1">
                                                {a.comuna}, {a.provincia}
                                            </p>
                                        </div>
                                    ))}
                                    {albergues.length === 0 && (
                                        <div className="text-center py-8">
                                            <p className="text-slate-600 text-xs">Sin albergues habilitados</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
