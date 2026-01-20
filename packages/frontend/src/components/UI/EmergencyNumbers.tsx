import { useState } from "react";
import { EMERGENCY_NUMBERS } from "../../data/albergues";
import { Phone } from "lucide-react";

export function EmergencyNumbers() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Minimalist Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 left-6 z-[999] group flex items-center gap-2 pr-4 pl-3 py-3 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--primary-foreground)] shadow-lg shadow-black/20 rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer border border-white/10"
                title="Números de Emergencia"
            >
                <div className="p-1.5 rounded-full">
                    <Phone className="w-5 h-5 text-white fill-current" />
                </div>
                <span className="font-semibold text-sm tracking-wide hidden md:block">SOS</span>
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-[1002] flex items-end md:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div
                        className="fixed inset-0"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300">

                        {/* Header */}
                        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-3">
                                <span className="text-red-500">📞</span>
                                Números de Emergencia
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Grid */}
                        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {EMERGENCY_NUMBERS.map((item) => (
                                <a
                                    key={item.number}
                                    href={`tel:${item.number}`}
                                    className="group flex flex-col items-center justify-center p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all active:scale-95"
                                >
                                    <span
                                        className={`font-bold text-slate-200 group-hover:text-red-400 transition-colors mb-1 ${item.number.length > 12 ? "text-sm md:text-base leading-tight" :
                                            item.number.length > 8 ? "text-lg md:text-xl" : "text-2xl"
                                            }`}
                                    >
                                        {item.number}
                                    </span>
                                    <span className="text-xs text-slate-500 group-hover:text-slate-400 font-medium text-center leading-tight">
                                        {item.label}
                                    </span>
                                </a>
                            ))}
                        </div>

                        {/* Disclaimer */}
                        <div className="px-6 py-4 bg-slate-950/30 border-t border-slate-800">
                            <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                                <span className="text-yellow-500/80">⚠️</span>
                                Mantén la calma y sigue instrucciones oficiales.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
