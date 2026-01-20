import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "../../../app/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Activity, AlertTriangle, Flame, Waves, ArrowLeft } from "lucide-react";

interface DailyStats {
  fecha: string;
  total_emergencias: number;
  sismos_count: number;
  incendios_count: number;
  alertas_count: number;
  tsunamis_count: number;
  criticas_count: number;
  altas_count: number;
  medias_count: number;
  bajas_count: number;
  max_magnitud?: number;
  total_superficie?: number;
}

interface SummaryStats {
  total_emergencias: number;
  sismos_count: number;
  incendios_count: number;
  alertas_count: number;
  tsunamis_count: number;
  criticas_count: number;
  altas_count: number;
  medias_count: number;
  bajas_count: number;
  max_magnitud?: number;
  total_superficie?: number;
}

interface TrendData {
  current_period: SummaryStats;
  previous_period: SummaryStats;
  trend_percentage: number;
  trend_direction: "up" | "down" | "stable";
}

const EMERGENCY_COLORS = {
  sismos: "#3b82f6",
  incendios: "#ef4444",
  alertas: "#f59e0b",
  tsunamis: "#06b6d4",
};

const SEVERITY_COLORS = {
  critica: "#dc2626",
  alta: "#f97316",
  media: "#eab308",
  baja: "#22c55e",
};

export function HistoricalDashboard() {
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadDashboardData();
  }, [days]);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const [dailyRes, summaryRes, trendsRes] = await Promise.all([
        fetch(`http://localhost:3000/api/stats/daily?days=${days}`),
        fetch(`http://localhost:3000/api/stats/summary?days=${days}`),
        fetch(`http://localhost:3000/api/stats/trends?days=7`),
      ]);

      if (dailyRes.ok) {
        const dailyData = await dailyRes.json();
        setDailyStats(dailyData.stats || []);
      }

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData.summary);
      }

      if (trendsRes.ok) {
        const trendsData = await trendsRes.json();
        setTrends(trendsData);
      }
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  }

  // Prepare data for charts
  const emergencyTypeData = summary
    ? [
        { name: "Sismos", value: summary.sismos_count, color: EMERGENCY_COLORS.sismos },
        { name: "Incendios", value: summary.incendios_count, color: EMERGENCY_COLORS.incendios },
        { name: "Alertas", value: summary.alertas_count, color: EMERGENCY_COLORS.alertas },
        { name: "Tsunamis", value: summary.tsunamis_count, color: EMERGENCY_COLORS.tsunamis },
      ].filter((item) => item.value > 0)
    : [];

  const severityData = summary
    ? [
        { name: "Crítica", value: summary.criticas_count, color: SEVERITY_COLORS.critica },
        { name: "Alta", value: summary.altas_count, color: SEVERITY_COLORS.alta },
        { name: "Media", value: summary.medias_count, color: SEVERITY_COLORS.media },
        { name: "Baja", value: summary.bajas_count, color: SEVERITY_COLORS.baja },
      ].filter((item) => item.value > 0)
    : [];

  const timeSeriesData = dailyStats.map((stat) => ({
    fecha: new Date(stat.fecha).toLocaleDateString("es-CL", { month: "short", day: "numeric" }),
    total: stat.total_emergencias,
    sismos: stat.sismos_count,
    incendios: stat.incendios_count,
    alertas: stat.alertas_count,
    tsunamis: stat.tsunamis_count,
  }));

  const getTrendIcon = () => {
    if (!trends) return <Minus className="w-4 h-4" />;
    if (trends.trend_direction === "up") return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (trends.trend_direction === "down") return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = () => {
    if (!trends) return "text-gray-500";
    if (trends.trend_direction === "up") return "text-red-500";
    if (trends.trend_direction === "down") return "text-green-500";
    return "text-gray-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Cargando estadísticas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card hover:bg-accent border border-border text-foreground transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Volver al Mapa</span>
            </a>
            <div>
              <h1 className="text-3xl font-bold">Dashboard Histórico</h1>
              <p className="text-muted-foreground mt-1">
                Análisis de emergencias de los últimos {days} días
              </p>
            </div>
          </div>
          
          {/* Days selector */}
          <div className="flex gap-2">
            {[7, 14, 30, 60, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                  days === d
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-accent border-border"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Emergencias</p>
                <p className="text-3xl font-bold mt-2">{summary?.total_emergencias || 0}</p>
              </div>
              <Activity className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
            {trends && (
              <div className={`flex items-center gap-1 mt-3 text-sm ${getTrendColor()}`}>
                {getTrendIcon()}
                <span>{Math.abs(trends.trend_percentage).toFixed(1)}% vs período anterior</span>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas Críticas</p>
                <p className="text-3xl font-bold mt-2">{summary?.criticas_count || 0}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Magnitud Máxima</p>
                <p className="text-3xl font-bold mt-2">
                  {summary?.max_magnitud?.toFixed(1) || "N/A"}
                </p>
              </div>
              <div className="text-4xl opacity-20">📍</div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Incendios</p>
                <p className="text-3xl font-bold mt-2">{summary?.incendios_count || 0}</p>
              </div>
              <Flame className="w-10 h-10 text-orange-500 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart - Emergencies Over Time */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Emergencias en el Tiempo</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="fecha" stroke="hsl(var(--foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Total"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Pie Chart - Emergency Types */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Distribución por Tipo</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={emergencyTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {emergencyTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Bar Chart - Severity Distribution */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Distribución por Severidad</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Area Chart - Stacked Emergency Types */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Tendencia por Tipo</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="fecha" stroke="hsl(var(--foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="sismos"
                  stackId="1"
                  stroke={EMERGENCY_COLORS.sismos}
                  fill={EMERGENCY_COLORS.sismos}
                  name="Sismos"
                />
                <Area
                  type="monotone"
                  dataKey="incendios"
                  stackId="1"
                  stroke={EMERGENCY_COLORS.incendios}
                  fill={EMERGENCY_COLORS.incendios}
                  name="Incendios"
                />
                <Area
                  type="monotone"
                  dataKey="alertas"
                  stackId="1"
                  stroke={EMERGENCY_COLORS.alertas}
                  fill={EMERGENCY_COLORS.alertas}
                  name="Alertas"
                />
                <Area
                  type="monotone"
                  dataKey="tsunamis"
                  stackId="1"
                  stroke={EMERGENCY_COLORS.tsunamis}
                  fill={EMERGENCY_COLORS.tsunamis}
                  name="Tsunamis"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default HistoricalDashboard;
