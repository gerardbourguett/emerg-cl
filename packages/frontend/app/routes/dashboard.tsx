import { Suspense, lazy } from "react";
import type { Route } from "./+types/dashboard";

const HistoricalDashboard = lazy(() => import("../../src/components/Dashboard/HistoricalDashboard"));

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard Histórico | Emergencias Chile" },
    { name: "description", content: "Análisis y estadísticas históricas de emergencias en Chile." },
  ];
}

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full bg-background text-foreground flex items-center justify-center">
          Cargando dashboard...
        </div>
      }
    >
      <HistoricalDashboard />
    </Suspense>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <div className="h-screen w-full bg-background text-foreground flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Error en Dashboard</h1>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    </div>
  );
}
