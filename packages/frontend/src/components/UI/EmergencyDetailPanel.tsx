import type { Emergency } from "../../types/emergency";
import { EMERGENCY_ICONS, SEVERITY_COLORS } from "../../types/emergency";

interface EmergencyDetailPanelProps {
  emergency: Emergency | null;
  onClose: () => void;
}

export function EmergencyDetailPanel({ emergency, onClose }: EmergencyDetailPanelProps) {
  if (!emergency) return null;

  const color = SEVERITY_COLORS[emergency.severidad];
  const icon = EMERGENCY_ICONS[emergency.tipo];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] transition-opacity"
        onClick={onClose}
      />

      {/* Panel deslizante desde abajo */}
      <div className="fixed bottom-0 left-0 right-0 z-[1001] bg-slate-900 rounded-t-3xl shadow-2xl border-t border-white/10 animate-slide-up max-h-[85vh] overflow-hidden flex flex-col">
        {/* Handle visual para arrastrar */}
        <div className="flex justify-center py-2 border-b border-white/10">
          <div className="w-12 h-1.5 bg-slate-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-white/10 bg-gradient-to-b from-slate-800 to-slate-900">
          <div className="flex items-start gap-3 flex-1">
            <div
              className="text-3xl flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: color.bg }}
            >
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-white mb-1 line-clamp-2">
                {emergency.titulo}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wide"
                  style={{ backgroundColor: color.bg, color: "#000" }}
                >
                  {emergency.severidad}
                </span>
                <span className="text-xs text-slate-400">
                  {emergency.tipo.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition flex-shrink-0"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Descripción */}
          {emergency.descripcion && (
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                Descripción
              </h3>
              <p className="text-white leading-relaxed">{emergency.descripcion}</p>
            </div>
          )}

          {/* Información adicional */}
          <div className="grid grid-cols-2 gap-3">
            <InfoCard
              label="Fuente"
              value={emergency.fuente}
              icon="📡"
            />
            <InfoCard
              label="Región"
              value={emergency.region || "Nacional"}
              icon="📍"
            />
          </div>

          {/* Sismos específicos */}
          {emergency.tipo === "seismo" && emergency.magnitud && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">📊</span>
                <div>
                  <p className="text-xs text-yellow-300/80 uppercase tracking-wide">Magnitud</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    {emergency.magnitud} <span className="text-lg">ML</span>
                  </p>
                </div>
              </div>
              {emergency.profundidad && (
                <p className="text-sm text-slate-300 mt-2">
                  Profundidad: <strong>{emergency.profundidad} km</strong>
                </p>
              )}
            </div>
          )}

          {/* Incendios específicos */}
          {emergency.tipo === "incendio_forestal" && emergency.superficie_afectada && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">🔥</span>
                <div>
                  <p className="text-xs text-red-300/80 uppercase tracking-wide">Superficie Afectada</p>
                  <p className="text-2xl font-bold text-red-400">
                    {emergency.superficie_afectada} ha
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Coordenadas */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
            <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide">
              Ubicación
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Latitud</p>
                <p className="text-white font-mono">{emergency.lat.toFixed(6)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Longitud</p>
                <p className="text-white font-mono">{emergency.lng.toFixed(6)}</p>
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className="space-y-2">
            <TimeInfo
              label="Fecha de inicio"
              date={emergency.fecha_inicio}
            />
            <TimeInfo
              label="Última actualización"
              date={emergency.fecha_actualizacion}
            />
          </div>

          {/* URL si existe */}
          {emergency.url && (
            <a
              href={emergency.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center text-blue-400 font-semibold hover:bg-blue-500/20 transition"
            >
              Ver información oficial →
            </a>
          )}
        </div>

        {/* Footer con acciones */}
        <div className="p-4 border-t border-white/10 bg-slate-900">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </>
  );
}

function InfoCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-3 border border-white/5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-white font-medium truncate">{value}</p>
    </div>
  );
}

function TimeInfo({ label, date }: { label: string; date: string }) {
  const formattedDate = new Date(date).toLocaleString("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="text-white font-medium">{formattedDate}</span>
    </div>
  );
}
