import { useState, useEffect } from "react";
import type { Route } from "./+types/home";
import { useTheme } from "../../src/hooks/useTheme";
import MapboxMap from "../../src/components/Map/MapboxMap.client";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Emergencias Chile | Mapa" },
    { name: "description", content: "Mapa en tiempo real de sismos, incendios y alertas." },
  ];
}

export default function Home() {
  const { theme } = useTheme();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="h-screen w-full bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🗺️</div>
          <p className="text-lg">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return <MapboxMap />;
}
