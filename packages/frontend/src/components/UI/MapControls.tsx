import { useState } from "react";
import { Filter, Globe, Map, Flame, Waves, Activity, AlertTriangle, Layers } from "lucide-react";
import type { Emergency } from "../../types/emergency";
import { SEVERITY_COLORS } from "../../types/emergency";

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
    const [activeGroup, setActiveGroup] = useState<"filters" | "territories" | null>(null);

    return (
        <div className="fixed left-4 top-1/2 -translate-y-1/2 z-[995] flex flex-col gap-6 pointer-events-none">

            {/* Main Dock Container */}
            <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-full p-2 flex flex-col gap-4 shadow-2xl pointer-events-auto">

                {/* Territories Group */}
                <div className="relative group">
                    <DockButton
                        icon={Globe}
                        label="Territorios"
                        active={activeGroup === "territories"}
                        onClick={() => setActiveGroup(activeGroup === "territories" ? null : "territories")}
                    />

                    {/* Popover Menu for Territories */}
                    {activeGroup === "territories" && (
                        <div className="absolute left-full top-0 ml-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex flex-col gap-1 w-40 animate-in fade-in slide-in-from-left-4">
                            <MenuButton label="Continental" onClick={() => onFlyTo("continental")} />
                            <MenuButton label="Rapa Nui" onClick={() => onFlyTo("pascua")} />
                            <MenuButton label="J. Fernández" onClick={() => onFlyTo("juanfernandez")} />
                            <MenuButton label="Antártica" onClick={() => onFlyTo("antartica")} />
                        </div>
                    )}
                </div>

                <div className="w-8 h-[1px] bg-white/10 mx-auto" />

                {/* Filters Group */}
                <div className="relative group">
                    <DockButton
                        icon={Filter}
                        label="Filtros"
                        active={activeGroup === "filters"}
                        onClick={() => setActiveGroup(activeGroup === "filters" ? null : "filters")}
                    />

                    {/* Popover Menu for Filters */}
                    {activeGroup === "filters" && (
                        <div className="absolute left-full top-0 ml-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex flex-col gap-1 w-40 animate-in fade-in slide-in-from-left-4">
                            <MenuButton
                                label="Todos"
                                active={filter === "all"}
                                onClick={() => onFilterChange("all")}
                                icon={Map}
                            />
                            <MenuButton
                                label="Sismos"
                                active={filter === "seismo"}
                                onClick={() => onFilterChange("seismo")}
                                icon={Activity}
                                iconColor={SEVERITY_COLORS.alta.bg}
                            />
                            <MenuButton
                                label="Incendios"
                                active={filter === "incendio_forestal"}
                                onClick={() => onFilterChange("incendio_forestal")}
                                icon={Flame}
                                iconColor={SEVERITY_COLORS.critica.bg}
                            />
                            <MenuButton
                                label="Alertas"
                                active={filter === "alerta"}
                                onClick={() => onFilterChange("alerta")}
                                icon={AlertTriangle}
                                iconColor="text-yellow-500"
                            />
                            <MenuButton
                                label="Tsunamis"
                                active={filter === "tsunami"}
                                onClick={() => onFilterChange("tsunami")}
                                icon={Waves}
                                iconColor="text-cyan-500"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function DockButton({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`
                group relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                ${active ? "bg-white text-black" : "bg-white/5 text-white hover:bg-white/20 hover:scale-110"}
            `}
        >
            <Icon className="w-5 h-5" strokeWidth={2} />

            {/* Tooltip (only if not active) */}
            {!active && (
                <span className="absolute left-full ml-3 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {label}
                </span>
            )}
        </button>
    );
}

function MenuButton({ label, onClick, active, icon: Icon, iconColor }: { label: string, onClick: () => void, active?: boolean, icon?: any, iconColor?: string }) {
    return (
        <button
            onClick={onClick}
            className={`
                w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2
                ${active
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }
            `}
        >
            {Icon && (
                <Icon className={`w-4 h-4 ${iconColor || ""}`} strokeWidth={2} style={iconColor?.startsWith("#") ? { color: iconColor } : {}} />
            )}
            {label}
        </button>
    );
}
