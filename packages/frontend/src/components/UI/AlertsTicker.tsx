import { useEffect, useState } from "react";

interface ActionEvent {
    title: string;
    fecha: string;
    url: string;
}

interface Albergue {
    region: string;
    provincia: string;
    comuna: string;
    lugar: string;
}

export function AlertsTicker() {
    const [events, setEvents] = useState<ActionEvent[]>([]);
    const [albergues, setAlbergues] = useState<Albergue[]>([]);
    const [activeTab, setActiveTab] = useState<"eventos" | "albergues">("eventos");
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        // Fetch Events
        fetch("/api/senapred/eventos")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data.data)) setEvents(data.data.slice(0, 5)); // Limit to 5
            })
            .catch(console.error);

        // Fetch Albergues
        fetch("/api/senapred/albergues")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data.data)) setAlbergues(data.data);
            })
            .catch(console.error);
    }, []);

    if (events.length === 0 && albergues.length === 0) return null;

    return (
        <div className="absolute top-40 left-4 md:left-6 z-[998] w-[calc(100%-2rem)] md:w-72 flex flex-col gap-2 pointer-events-none font-sans transition-all">
            <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl pointer-events-auto">
                {/* Header with Collapse Toggle */}
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10">
                    <span className="text-white/50 text-xs font-medium">Alertas</span>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="text-white/50 hover:text-white p-1 rounded transition"
                        title={collapsed ? "Mostrar" : "Ocultar"}
                    >
                        {collapsed ? "▼" : "▲"}
                    </button>
                </div>

                {!collapsed && (
                    <>
                        <div className="flex border-b border-white/10">
                            <button
                                onClick={() => setActiveTab("eventos")}
                                className={`flex-1 py-2 text-sm font-bold transition ${activeTab === "eventos" ? "bg-red-500/20 text-red-400" : "text-slate-400 hover:text-white"}`}
                            >
                                Últimas Alertas
                            </button>
                            <button
                                onClick={() => setActiveTab("albergues")}
                                className={`flex-1 py-2 text-sm font-bold transition ${activeTab === "albergues" ? "bg-blue-500/20 text-blue-400" : "text-slate-400 hover:text-white"}`}
                            >
                                Albergues ({albergues.length})
                            </button>
                        </div>

                        <div className="max-h-60 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/20">
                            {activeTab === "eventos" ? (
                                <div className="flex flex-col gap-2">
                                    {events.map((e, i) => (
                                        <a key={i} href={e.url} target="_blank" rel="noreferrer" className="block p-2 rounded hover:bg-white/5 transition group">
                                            <p className="text-white text-xs font-medium leading-tight group-hover:text-red-300">{e.title}</p>
                                            <span className="text-[10px] text-slate-500">{e.fecha}</span>
                                        </a>
                                    ))}
                                    {events.length === 0 && <p className="text-slate-500 text-xs text-center py-2">Cargando eventos...</p>}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {albergues.map((a, i) => (
                                        <div key={i} className="p-2 border border-white/5 rounded bg-white/5">
                                            <p className="text-blue-300 text-xs font-bold">{a.lugar}</p>
                                            <p className="text-slate-400 text-[10px]">{a.comuna}, {a.region}</p>
                                        </div>
                                    ))}
                                    {albergues.length === 0 && <p className="text-slate-500 text-xs text-center py-2">No hay albergues activos reportados o cargando...</p>}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
