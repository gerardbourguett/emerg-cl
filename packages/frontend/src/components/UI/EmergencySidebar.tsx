import { useState } from "react";
import { X, ChevronLeft, ChevronRight, AlertTriangle, Clock } from "lucide-react";
import type { Emergency } from "../../types/emergency";
import { SEVERITY_COLORS } from "../../types/emergency";

interface EmergencySidebarProps {
    emergencies: Emergency[];
    onEmergencyClick: (emergency: Emergency) => void;
}

const EMERGENCY_ICONS: Record<string, string> = {
    seismo: "📍",
    incendio_forestal: "🔥",
    alerta_meteorologica: "⚠️",
    tsunami: "🌊",
};

const TIPO_LABELS: Record<string, string> = {
    seismo: "Sismo",
    incendio_forestal: "Incendio",
    alerta_meteorologica: "Alerta Meteo",
    tsunami: "Tsunami",
};

export function EmergencySidebar({ emergencies, onEmergencyClick }: EmergencySidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Filtrar emergencias críticas y de alta severidad
    const criticalEmergencies = emergencies
        .filter((e) => e.severidad === "critica" || e.severidad === "alta")
        .sort((a, b) => new Date(b.fecha_actualizacion).getTime() - new Date(a.fecha_actualizacion).getTime())
        .slice(0, 5);

    // Emergencias más recientes
    const recentEmergencies = emergencies
        .sort((a, b) => new Date(b.fecha_actualizacion).getTime() - new Date(a.fecha_actualizacion).getTime())
        .slice(0, 8);

    return (
        <>
            {/* Desktop Sidebar */}
            <div
                className={`hidden md:flex fixed top-0 right-0 h-screen z-[995] transition-all duration-300 ${isCollapsed ? "w-12" : "w-96"
                    }`}
            >
                {/* Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full bg-card/90 backdrop-blur-md border border-border rounded-l-lg p-2 hover:bg-card transition-colors shadow-lg"
                    title={isCollapsed ? "Expandir" : "Colapsar"}
                >
                    {isCollapsed ? (
                        <ChevronLeft className="w-4 h-4 text-foreground" />
                    ) : (
                        <ChevronRight className="w-4 h-4 text-foreground" />
                    )}
                </button>

                {/* Sidebar Content */}
                {!isCollapsed && (
                    <div className="w-full bg-card/80 backdrop-blur-xl border-l border-border shadow-2xl overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b border-border bg-card/50">
                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-primary" />
                                Emergencias Activas
                            </h2>
                            <p className="text-xs text-muted-foreground mt-1">
                                {emergencies.length} emergencias en total
                            </p>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {/* Critical Section */}
                            {criticalEmergencies.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                        Críticas ({criticalEmergencies.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {criticalEmergencies.map((emergency) => (
                                            <EmergencyCard
                                                key={emergency.id}
                                                emergency={emergency}
                                                onClick={() => onEmergencyClick(emergency)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recent Section */}
                            <div>
                                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Más Recientes
                                </h3>
                                <div className="space-y-2">
                                    {recentEmergencies.map((emergency) => (
                                        <EmergencyCard
                                            key={emergency.id}
                                            emergency={emergency}
                                            onClick={() => onEmergencyClick(emergency)}
                                            compact
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Bottom Sheet */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-[995]">
                <div className="bg-card/90 backdrop-blur-xl border-t border-border rounded-t-3xl shadow-2xl max-h-[40vh] overflow-hidden">
                    {/* Handle */}
                    <div className="flex justify-center py-2">
                        <div className="w-12 h-1.5 bg-muted rounded-full" />
                    </div>

                    {/* Content */}
                    <div className="px-4 pb-4 overflow-y-auto max-h-[35vh]">
                        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-primary" />
                            Emergencias Críticas
                        </h3>
                        <div className="space-y-2">
                            {criticalEmergencies.slice(0, 3).map((emergency) => (
                                <EmergencyCard
                                    key={emergency.id}
                                    emergency={emergency}
                                    onClick={() => onEmergencyClick(emergency)}
                                    compact
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

interface EmergencyCardProps {
    emergency: Emergency;
    onClick: () => void;
    compact?: boolean;
}

function EmergencyCard({ emergency, onClick, compact = false }: EmergencyCardProps) {
    const color = SEVERITY_COLORS[emergency.severidad];
    const icon = EMERGENCY_ICONS[emergency.tipo] || "📍";
    const tipoLabel = TIPO_LABELS[emergency.tipo] || emergency.tipo;

    const timeAgo = getTimeAgo(new Date(emergency.fecha_actualizacion));

    return (
        <button
            onClick={onClick}
            className="w-full text-left bg-muted/30 hover:bg-muted/50 border border-border rounded-xl p-3 transition-all hover:scale-[1.02] hover:shadow-lg group"
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                    className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: color.bg + "20" }}
                >
                    {icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground">{tipoLabel}</span>
                        <div
                            className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                            style={{ backgroundColor: color.bg }}
                        >
                            {emergency.severidad.toUpperCase()}
                        </div>
                    </div>

                    <h4 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {emergency.titulo}
                    </h4>

                    {!compact && emergency.descripcion && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {emergency.descripcion}
                        </p>
                    )}

                    <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{timeAgo}</span>
                    </div>
                </div>
            </div>
        </button>
    );
}

function getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return `Hace ${diffDays}d`;
}
