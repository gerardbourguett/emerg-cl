import { useState } from "react";
import { Filter } from "lucide-react";
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

            {/* Left Side Territory Visual Boxes - "Cuadros a la izquierda" */}
            {/* Left Side Territory Visual Boxes - "Cuadros a la izquierda" REMOVED AS PER USER REQUEST
            <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-6 z-[990] flex-col gap-4">
                <TerritoryBox
                    label="Insular"
                    sublabel="Rapa Nui"
                    icon="🗿"
                    onClick={() => onFlyTo("pascua")}
                />
                <TerritoryBox
                    label="Insular"
                    sublabel="J. Fernández"
                    icon="🏝️"
                    onClick={() => onFlyTo("juanfernandez")}
                />
                <TerritoryBox
                    label="Antártica"
                    sublabel="Chilena"
                    icon="❄️"
                    onClick={() => onFlyTo("antartica")}
                />
                <TerritoryBox
                    label="Continental"
                    sublabel="Chile"
                    icon="🇨🇱"
                    onClick={() => onFlyTo("continental")}
                />
            </div>
            */}

            {/* Bottom Panel Mobile (Drawer) */}
            {isExpanded && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998] md:hidden"
                        onClick={() => setIsExpanded(false)}
                    />

                    {/* Panel */}
                    <div className="fixed bottom-0 left-0 right-0 z-[999] md:hidden bg-card rounded-t-3xl shadow-2xl border-t border-border animate-slide-up">
                        {/* Handle */}
                        <div className="flex justify-center py-3">
                            <div className="w-12 h-1.5 bg-muted rounded-full" />
                        </div>

                        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                            {/* Dashboard Link Mobile REMOVED AS UNIMPLEMENTED
                            <a
                                href="/dashboard"
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-all"
                            >
                                📊 Ver Dashboard Histórico
                            </a>
                            */}

                            {/* Navegación territorial */}
                            <div>
                                <h3 className="text-xs text-muted-foreground uppercase tracking-wide mb-2 font-semibold">
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
                                <h3 className="text-xs text-muted-foreground uppercase tracking-wide mb-2 font-semibold">
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
                                        color="var(--color-chart-2)"
                                    />
                                    <FilterButton
                                        active={filter === "incendio_forestal"}
                                        onClick={() => { onFilterChange("incendio_forestal"); setIsExpanded(false); }}
                                        label="Incendios"
                                        color="var(--color-primary)" // Red/Primary
                                    />
                                    <FilterButton
                                        active={filter === "alerta"}
                                        onClick={() => { onFilterChange("alerta"); setIsExpanded(false); }}
                                        label="Alertas"
                                        color="var(--color-chart-4)" // Greenish? Check palette
                                    />
                                    <FilterButton
                                        active={filter === "albergues"}
                                        onClick={() => { onFilterChange("albergues"); setIsExpanded(false); }}
                                        label="Albergues"
                                        color="var(--color-chart-5)"
                                    />
                                </div>
                            </div>

                            {/* Stats detalladas */}
                            <div className="bg-muted/30 rounded-xl p-4 border border-border">
                                <h3 className="text-xs text-muted-foreground uppercase tracking-wide mb-3 font-semibold">
                                    Resumen de Emergencias
                                </h3>
                                <div className="space-y-2">
                                    <StatRow label="Sismos" count={counts.sismos} color="text-yellow-400" />
                                    <StatRow label="Incendios Forestales" count={counts.incendios} color="text-red-400" />
                                    <StatRow label="Alertas SENAPRED" count={counts.alertas} color="text-green-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Mobile Filter Toggle Button */}
            {!isExpanded && (
                <button
                    onClick={() => setIsExpanded(true)}
                    className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[990] bg-card/80 backdrop-blur-md border border-white/10 text-foreground px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2"
                >
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-semibold">Filtros</span>
                </button>
            )}

            {/* Desktop Bottom Dock */}
            <div className="hidden md:flex absolute bottom-10 left-1/2 -translate-x-1/2 z-[999] flex-col gap-4 items-center">
                {/* Filter Dock */}
                <div className="flex gap-2 p-2 rounded-2xl bg-card/80 backdrop-blur-xl border border-border shadow-2xl ring-1 ring-white/5">
                    <FilterButton
                        active={filter === "all"}
                        onClick={() => onFilterChange("all")}
                        label="Todos"
                    />
                    <FilterButton
                        active={filter === "seismo"}
                        onClick={() => onFilterChange("seismo")}
                        label="Sismos"
                        color="var(--color-chart-2)"
                    />
                    <FilterButton
                        active={filter === "incendio_forestal"}
                        onClick={() => onFilterChange("incendio_forestal")}
                        label="Incendios"
                        color="var(--color-primary)"
                    />
                    <FilterButton
                        active={filter === "alerta"}
                        onClick={() => onFilterChange("alerta")}
                        label="Alertas"
                        color="var(--color-chart-4)"
                    />
                    <FilterButton
                        active={filter === "albergues"}
                        onClick={() => onFilterChange("albergues")}
                        label="Albergues"
                        color="var(--color-chart-5)"
                    />
                </div>
            </div>
        </>
    );
}

function TerritoryBox({ label, sublabel, icon, onClick }: { label: string; sublabel: string; icon: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="group relative flex items-center gap-3 p-3 pr-6 bg-card/60 hover:bg-card border border-border/50 hover:border-primary/50 backdrop-blur-md rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10 text-left w-48"
        >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted/50 group-hover:bg-primary/20 text-2xl group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{sublabel}</p>
            </div>
        </button>
    );
}

function StatBadge({ label, count, color, compact = false }: { label: string; count: number; color: string; compact?: boolean }) {
    // Legacy colors mapping to new theme or direct classes
    const classes = `bg-${color}-500/10 text-${color}-400 border-${color}-500/20`;

    return (
        <div className={`px-2 py-1 rounded-lg border ${classes} flex items-center gap-1 transition-all`}>
            <span className="text-[10px] md:text-xs opacity-80 font-medium">{label}</span>
            <b className="text-sm md:text-base">{count}</b>
        </div>
    );
}

function StatRow({ label, count, color }: { label: string; count: number; color: string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className={`text-lg font-bold ${color}`}>{count}</span>
        </div>
    );
}

function NavButton({ onClick, label }: { onClick: () => void; label: string }) {
    return (
        <button
            onClick={onClick}
            className="px-4 py-2 rounded-full md:rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-95 w-full md:w-auto"
        >
            {label}
        </button>
    );
}

function FilterButton({
    active,
    onClick,
    label,
    color = "muted",
}: {
    active: boolean;
    onClick: () => void;
    label: string;
    color?: string;
}) {
    // If color starts with var, use style, else className
    const isCustomColor = color.startsWith("var");

    // Default active style
    let activeStyle = {};
    let activeClass = "bg-muted text-foreground ring-1 ring-ring";

    if (active) {
        if (isCustomColor) {
            activeStyle = {
                backgroundColor: color,
                color: "white",
                boxShadow: `0 0 15px ${color}` // Glow effect
            };
            activeClass = "";
        } else if (color === "muted") {
            activeClass = "bg-foreground text-background shadow-lg";
        }
    }

    return (
        <button
            onClick={onClick}
            style={active ? activeStyle : {}}
            className={`px-4 py-2.5 md:px-5 rounded-xl text-sm font-bold transition-all duration-300 w-full md:w-auto ${active
                ? `${activeClass} scale-105`
                : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20"
                }`}
        >
            {label}
        </button>
    );
}
