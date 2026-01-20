import { useEffect, useState } from "react";

export function WeatherWidget() {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetch("/api/meteo/condiciones")
            .then((res) => res.json())
            .then((json) => setData(json.data))
            .catch((err) => console.error("Error loading meteo:", err));
    }, []);

    if (!data) return null;

    return (
        <div className="absolute top-4 right-4 md:top-6 md:left-[300px] md:right-auto z-[999] p-2 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-xl flex items-center gap-3 font-sans transition-all hover:bg-slate-900/80">
            <span className="text-2xl animate-pulse">☀️</span>
            <div>
                <p className="text-white text-sm font-bold">{data.location}</p>
                <p className="text-yellow-400 text-lg font-bold leading-none">{data.temperature}</p>
            </div>
        </div>
    );
}
