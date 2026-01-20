import { useState } from "react";
import type { Emergency } from "../../types/emergency";

interface MapControlsProps {
    emergencies: Emergency[];
    filter: string;
    onFilterChange: (filter: string) => void;
    onFlyTo: (location: "continental" | "pascua" | "juanfernandez" | "antartica") => void;
}

export function MapControls({
    emergencies,
    filter,
    onFilterChange,
    onFlyTo,
}: MapControlsProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const counts = {
        sismos: emergencies.filter((e) => e.tipo === "seismo").length,
        incendios: emergencies.filter((e) => e.tipo === "incendio_forestal").length,
        alertas: emergencies.filter((e) => e.fuente === "SENAPRED Telegram").length,
    };

    return (
        <>
            {/* Header Removed as per user request */}

            {/* Bottom Panel Mobile (Drawer) */}
            {isExpanded && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998] md:hidden"
                        onClick={() => setIsExpanded(false)}
                    />

                    {/* Panel */}
                    <div className="fixed bottom-0 left-0 right-0 z-[999] md:hidden bg-slate-900 rounded-t-3xl shadow-2xl border-t border-white/10 animate-slide-up">
                        {/* Handle */}
                        <div className="flex justify-center py-3">
                            <div className="w-12 h-1.5 bg-slate-600 rounded-full" />
                        </div>

                        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                            {/* Dashboard Link Mobile */}
                            <a
                                href="/dashboard"
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold transition-all"
                            >
                                📊 Ver Dashboard Histórico
                            </a>

                            {/* Navegación territorial */}
                            <div>
                                <h3 className="text-xs text-slate-400 uppercase tracking-wide mb-2 font-semibold">
                                    Ir a Territorio
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <NavButton onClick={() => { onFlyTo("continental"); setIsExpanded(false); }} label="Continental" />
                                    <NavButton onClick={() => { onFlyTo("juanfernandez"); setIsExpanded(false); }} label="Juan Fernández" />
                                    <NavButton onClick={() => { onFlyTo("pascua"); setIsExpanded(false); }} label="Rapa Nui" />
                                    <NavButton onClick={() => { onFlyTo("antartica"); setIsExpanded(false); }} label="Antártica" />
                                </div>
                            </div>

                            {/* Filtros */}
                            <div>
                                <h3 className="text-xs text-slate-400 uppercase tracking-wide mb-2 font-semibold">
                                    Filtrar Emergencias
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <FilterButton
                                        active={filter === "all"}
                                        onClick={() => { onFilterChange("all"); setIsExpanded(false); }}
                                        label="Todos"
                                    />
                                    <FilterButton
                                        active={filter === "seismo"}
                                        onClick={() => { onFilterChange("seismo"); setIsExpanded(false); }}
                                        label="Sismos"
                                        color="yellow"
                                    />
                                    <FilterButton
                                        active={filter === "incendio_forestal"}
                                        onClick={() => { onFilterChange("incendio_forestal"); setIsExpanded(false); }}
                                        label="Incendios"
                                        color="red"
                                    />
                                    <FilterButton
                                        active={filter === "alerta"}
                                        onClick={() => { onFilterChange("alerta"); setIsExpanded(false); }}
                                        label="Alertas"
                                        color="green"
                                    />
                                </div>
                            </div>

                            {/* Stats detalladas */}
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-white/10">
                                <h3 className="text-xs text-slate-400 uppercase tracking-wide mb-3 font-semibold">
                                    Resumen de Emergencias
                                </h3>
                                <div className="space-y-2">
                                    <StatRow label="Sismos" count={counts.sismos} color="yellow" />
                                    <StatRow label="Incendios Forestales" count={counts.incendios} color="red" />
                                    <StatRow label="Alertas SENAPRED" count={counts.alertas} color="green" />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Desktop Bottom Dock (mantener original) */}
            <div className="hidden md:flex absolute bottom-10 left-1/2 -translate-x-1/2 z-[999] flex-col gap-4 items-center">
                {/* Navigation Pills */}
                <div className="flex gap-2 p-1.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-xl">
                    <NavButton onClick={() => onFlyTo("continental")} label="Continental" />
                    <NavButton onClick={() => onFlyTo("juanfernandez")} label="Juan Fernández" />
                    <NavButton onClick={() => onFlyTo("pascua")} label="Rapa Nui" />
                    <NavButton onClick={() => onFlyTo("antartica")} label="Antártica" />
                </div>

                {/* Filter Dock */}
                <div className="flex gap-2 p-2 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl ring-1 ring-white/5">
                    <FilterButton
                        active={filter === "all"}
                        onClick={() => onFilterChange("all")}
                        label="Todos"
                    />
                    <FilterButton
                        active={filter === "seismo"}
                        onClick={() => onFilterChange("seismo")}
                        label="Sismos"
                        color="yellow"
                    />
                    <FilterButton
                        active={filter === "incendio_forestal"}
                        onClick={() => onFilterChange("incendio_forestal")}
                        label="Incendios"
                        color="red"
                    />
                    <FilterButton
                        active={filter === "alerta"}
                        onClick={() => onFilterChange("alerta")}
                        label="Alertas"
                        color="green"
                    />
                </div>
            </div>
        </>
    );
}

function StatBadge({ label, count, color, compact = false }: { label: string; count: number; color: string; compact?: boolean }) {
    const colors = {
        yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        red: "bg-red-500/10 text-red-400 border-red-500/20",
        green: "bg-green-500/10 text-green-400 border-green-500/20",
    };
    // @ts-ignore
    const classes = colors[color];

    return (
        <div className={`px-2 py-1 rounded-lg border ${classes} flex items-center gap-1 transition-all`}>
            <span className="text-[10px] md:text-xs opacity-80 font-medium">{label}</span>
            <b className="text-sm md:text-base">{count}</b>
        </div>
    );
}

function StatRow({ label, count, color }: { label: string; count: number; color: string }) {
    const colors = {
        yellow: "text-yellow-400",
        red: "text-red-400",
        green: "text-green-400",
    };
    // @ts-ignore
    const textColor = colors[color];

    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">{label}</span>
            <span className={`text-lg font-bold ${textColor}`}>{count}</span>
        </div>
    );
}

function NavButton({ onClick, label }: { onClick: () => void; label: string }) {
    return (
        <button
            onClick={onClick}
            className="px-4 py-2 rounded-full md:rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all active:scale-95 w-full md:w-auto"
        >
            {label}
        </button>
    );
}

function FilterButton({
    active,
    onClick,
    label,
    color = "blue",
}: {
    active: boolean;
    onClick: () => void;
    label: string;
    color?: string;
}) {
    const activeClass =
        color === "yellow"
            ? "bg-yellow-500 text-slate-900 shadow-[0_0_15px_rgba(234,179,8,0.4)]"
            : color === "red"
                ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                : color === "green"
                    ? "bg-green-500 text-slate-900 shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                    : "bg-white text-slate-900 shadow-[0_0_15px_rgba(255,255,255,0.4)]";

    return (
        <button
            onClick={onClick}
            className={`px-4 py-2.5 md:px-5 rounded-xl text-sm font-bold transition-all duration-300 w-full md:w-auto ${active
                ? `${activeClass} scale-105`
                : "bg-transparent text-slate-400 hover:text-white hover:bg-white/5"
                }`}
        >
            {label}
        </button>
    );
}
