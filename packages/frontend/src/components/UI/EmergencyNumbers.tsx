import { useState } from "react";
import { EMERGENCY_NUMBERS } from "../../data/albergues";

export function EmergencyNumbers() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="absolute bottom-32 right-4 md:bottom-10 md:right-24 z-[999] w-14 h-14 rounded-full bg-red-500 text-white text-2xl font-bold shadow-lg hover:bg-red-600 transition-all hover:scale-110 flex items-center justify-center animate-pulse"
                title="Números de Emergencia"
            >
                📞
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-3xl shadow-2xl max-w-sm w-full p-6 font-sans">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                📞 Emergencias
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/50 hover:text-white text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {EMERGENCY_NUMBERS.map((item) => (
                                <a
                                    key={item.number}
                                    href={`tel:${item.number}`}
                                    className="flex flex-col items-center p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition group"
                                >
                                    <span className="text-lg font-bold text-red-400 group-hover:text-red-300">
                                        {item.number}
                                    </span>
                                    <span className="text-xs text-slate-400">{item.label}</span>
                                </a>
                            ))}
                        </div>

                        <p className="text-center text-xs text-slate-500 mt-4">
                            Mantente informado por los canales oficiales.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
