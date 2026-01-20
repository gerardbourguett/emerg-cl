import { Suspense, lazy } from "react";
import type { Route } from "./+types/home";

const Map = lazy(() => import("../../src/components/Map/Map.client"));

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Emergencias Chile | Mapa" },
    { name: "description", content: "Mapa en tiempo real de sismos, incendios y alertas." },
  ];
}

export default function Home() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-slate-900 text-white flex items-center justify-center">Cargando mapa...</div>}>
      <Map />
    </Suspense>
  );
}
