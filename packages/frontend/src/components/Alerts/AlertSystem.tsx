import { useEffect } from "react";
import { toast } from "sonner";
import type { Emergency } from "../../types/emergency";

interface AlertSystemProps {
  emergencies: Emergency[];
}

/**
 * Alert System that monitors emergencies and shows notifications
 * - Toast for new critical emergencies
 * - Banner for active critical alerts
 */
export function AlertSystem({ emergencies }: AlertSystemProps) {
  useEffect(() => {
    // Track which emergencies we've already shown alerts for
    const shownAlerts = new Set<string>(
      JSON.parse(localStorage.getItem("shown-alerts") || "[]")
    );

    // Find critical emergencies we haven't shown yet
    const criticalEmergencies = emergencies.filter(
      (e) => e.severidad === "critica" && !shownAlerts.has(e.id)
    );

    // Show toast for each new critical emergency
    criticalEmergencies.forEach((emergency) => {
      /* Toast notifications disabled by user request to prevent saturation
      const icon = getEmergencyIcon(emergency.tipo);
      
      toast.error(`${icon} ${emergency.titulo}`, {
        description: emergency.descripcion,
        duration: 10000, // 10 seconds
        action: {
          label: "Ver en mapa",
          onClick: () => {
            // Scroll to emergency on map
            window.dispatchEvent(
              new CustomEvent("emergency-focus", { detail: emergency })
            );
          },
        },
      });
      */

      // Mark as shown so we track them regardless
      shownAlerts.add(emergency.id);
    });

    // Save shown alerts to localStorage
    if (criticalEmergencies.length > 0) {
      localStorage.setItem("shown-alerts", JSON.stringify([...shownAlerts]));
    }

    // Clean up old alerts (older than 24h)
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const activeAlerts = emergencies
      .filter((e) => new Date(e.fecha_actualizacion) > oneDayAgo)
      .map((e) => e.id);

    const cleanedAlerts = [...shownAlerts].filter((id) => activeAlerts.includes(id));
    localStorage.setItem("shown-alerts", JSON.stringify(cleanedAlerts));
  }, [emergencies]);

  return null; // This component doesn't render anything
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
