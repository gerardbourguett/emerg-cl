import { Suspense, lazy, useEffect } from "react";
import type { Route } from "./+types/home";
import { useTheme } from "../../src/hooks/useTheme";

const MapboxMap = lazy(() => import("../../src/components/Map/MapboxMap.client"));

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Emergencias Chile | Mapa" },
    { name: "description", content: "Mapa en tiempo real de sismos, incendios y alertas." },
  ];
}

export default function Home() {
  const { theme } = useTheme();

  return (
    <Suspense fallback={<div className="h-screen w-full theme-bg-primary theme-text-primary flex items-center justify-center">Cargando mapa...</div>}>
      <MapboxMap />
    </Suspense>
  );
}
