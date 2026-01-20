import { useState, useEffect } from "react";
import { X, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import type { Emergency } from "../../types/emergency";
import { Button } from "~/components/ui/button";

interface AlertBannerProps {
  emergencies: Emergency[];
}

/**
 * Alert Banner - Shows critical emergencies at the top of the screen
 */
export function AlertBanner({ emergencies }: AlertBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Find critical emergencies
  const criticalEmergencies = emergencies.filter(
    (e) => e.severidad === "critica" && e.estado === "activo",
  );

  // Reset dismissed state when new critical emergencies appear
  useEffect(() => {
    if (criticalEmergencies.length > 0) {
      setIsDismissed(false);
    }
  }, [criticalEmergencies.length]);

  if (criticalEmergencies.length === 0 || isDismissed) {
    return null;
  }

  const latestCritical = criticalEmergencies[0];
  const count = criticalEmergencies.length;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="pointer-events-auto">
        {/* Banner */}
        <div className="bg-red-600 text-white shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <AlertTriangle className="h-6 w-6 flex-shrink-0 animate-pulse" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm uppercase tracking-wide">
                      Alerta Crítica
                    </span>
                    {count > 1 && (
                      <span className="bg-red-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                        {count} activas
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-medium truncate">
                    {latestCritical.titulo}
                  </p>

                  {isExpanded && latestCritical.descripcion && (
                    <p className="text-xs mt-1 opacity-90 line-clamp-2">
                      {latestCritical.descripcion}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                {/* Expand/Collapse button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-white hover:bg-red-700 h-8 w-8 p-0"
                  aria-label={isExpanded ? "Colapsar" : "Expandir"}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>

                {/* Dismiss button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDismissed(true)}
                  className="text-white hover:bg-red-700 h-8 w-8 p-0"
                  aria-label="Cerrar"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Expanded content - multiple alerts */}
            {isExpanded && count > 1 && (
              <div className="pb-3 space-y-2">
                <div className="border-t border-red-700 pt-3">
                  <p className="text-xs font-semibold mb-2 opacity-90">
                    Otras alertas críticas:
                  </p>
                  <div className="space-y-1.5">
                    {criticalEmergencies.slice(1, 4).map((emergency) => (
                      <div
                        key={emergency.id}
                        className="text-xs bg-red-700 rounded px-2 py-1.5 flex items-center gap-2"
                      >
                        <span>{getEmergencyIcon(emergency.tipo)}</span>
                        <span className="flex-1 truncate">
                          {emergency.titulo}
                        </span>
                        <span className="text-[10px] opacity-75">
                          {new Date(
                            emergency.fecha_actualizacion,
                          ).toLocaleTimeString("es-CL", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    ))}
                    {count > 4 && (
                      <p className="text-xs opacity-75 pl-2">
                        +{count - 4} más...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pulse animation bar */}
        <div className="h-1 bg-red-700 animate-pulse" />
      </div>
    </div>
  );
}

function getEmergencyIcon(tipo: string): string {
  const icons: Record<string, string> = {
    seismo: "📍",
    incendio_forestal: "🔥",
    alerta_meteorologica: "⚠️",
    tsunami: "🌊",
  };
  return icons[tipo] || "🚨";
}
