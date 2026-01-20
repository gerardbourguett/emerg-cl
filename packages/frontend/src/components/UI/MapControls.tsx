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
    const counts = {
        sismos: emergencies.filter((e) => e.tipo === "seismo").length,
        incendios: emergencies.filter((e) => e.tipo === "incendio_forestal").length,
        alertas: emergencies.filter((e) => e.fuente === "SENAPRED Telegram").length,
    };

    return (
        <>
            {/* Header & Stats - Top Left */}
            <div className="absolute top-4 left-4 md:top-6 md:left-6 z-[999] p-3 md:p-5 rounded-2xl md:rounded-3xl bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-2xl skew-y-0 transition-all hover:bg-slate-900/70 font-sans group">
                <h1 className="text-lg md:text-2xl font-bold flex items-center gap-2 md:gap-3 mb-2 md:mb-4 text-white tracking-tight">
                    <span className="text-2xl md:text-3xl filter drop-shadow-lg group-hover:scale-110 transition-transform duration-300">🚨</span>
                    <span className="hidden md:inline">Emergencias Chile</span>
                    <span className="md:hidden">EmergenciasCL</span>
                </h1>
                <div className="flex gap-2 md:gap-3 text-xs md:text-sm font-medium">
                    <StatBadge label="Sismos" count={counts.sismos} color="yellow" />
                    <StatBadge label="Incendios" count={counts.incendios} color="red" />
                    <StatBadge label="Alertas" count={counts.alertas} color="green" />
                </div>
            </div>

            {/* Bottom Dock - Navigation & Filters */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[999] flex flex-col gap-4 items-center">

                {/* Navigation Pills */}
                <div className="flex gap-2 p-1.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-xl">
                    <NavButton onClick={() => onFlyTo("continental")} label="Cont." fullLabel="Continental" />
                    <NavButton onClick={() => onFlyTo("juanfernandez")} label="J.F." fullLabel="Juan Fernández" />
                    <NavButton onClick={() => onFlyTo("pascua")} label="Rapa" fullLabel="Rapa Nui" />
                    <NavButton onClick={() => onFlyTo("antartica")} label="Ant." fullLabel="Antártica" />
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

function StatBadge({ label, count, color }: { label: string; count: number; color: string }) {
    const colors = {
        yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        red: "bg-red-500/10 text-red-400 border-red-500/20",
        green: "bg-green-500/10 text-green-400 border-green-500/20",
    };
    // @ts-ignore
    const classes = colors[color];

    return (
        <div className={`px-3 py-1.5 rounded-xl border ${classes} flex items-center gap-2 transition-all hover:scale-105 cursor-default`}>
            <span className="opacity-80">{label}</span>
            <b className="text-lg">{count}</b>
        </div>
    );
}

function NavButton({ onClick, label, fullLabel }: { onClick: () => void; label: string, fullLabel?: string }) {
    return (
        <button
            onClick={onClick}
            className="px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all active:scale-95 font-sans"
        >
            <span className="md:hidden">{label}</span>
            <span className="hidden md:inline">{fullLabel || label}</span>
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
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 font-sans ${active
                ? `${activeClass} scale-105`
                : "bg-transparent text-slate-400 hover:text-white hover:bg-white/5"
                }`}
        >
            {label}
        </button>
    );
}
