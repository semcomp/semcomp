import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BannerCard } from "@/components/BannerCard";
import { Tabs } from "@/constants/Tabs";
import { Presentation } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import { dashboardAPI } from "@/api/dashboard";
import type { EventStats } from "@/api/dashboard";
import { listDays, formatDayLabel, getEventDay } from "./components/presenceUtils";

type Metric = "present" | "rate";

const BAR_COLORS = ["#38bdf8", "#a78bfa", "#34d399", "#fbbf24", "#f472b6", "#fb7185", "#818cf8"];

interface PresenceDatum {
  name: string;
  present: number;
  total: number;
  rate: number;
}

type PresenceTooltipProps = Pick<TooltipContentProps<number, string>, "active" | "payload" | "label">;

function PresenceTooltip({ active, payload, label }: PresenceTooltipProps) {
  if (!active || !payload?.length) return null;

  const datum = payload[0].payload as PresenceDatum;

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-slate-100">{label}</p>
      <p className="mt-1 text-slate-300">
        Presenças: <span className="font-medium text-slate-100">{datum.present}</span>
      </p>
      <p className="text-slate-300">
        Inscritos: <span className="font-medium text-slate-100">{datum.total}</span>
      </p>
      <p className="text-slate-300">
        Taxa: <span className="font-medium text-sky-300">{datum.rate.toFixed(1)}%</span>
      </p>
    </div>
  );
}

export default function PresencePage() {
  const navigate = useNavigate();

  const [events, setEvents] = useState<EventStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [day, setDay] = useState<string>("all");
  const [metric, setMetric] = useState<Metric>("present");

  useEffect(() => {
    let cancelled = false;

    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await dashboardAPI.get({ sections: ["events"] });
        if (!cancelled) setEvents(response.events?.events ?? []);
      } catch {
        if (!cancelled) setError("Erro ao carregar os dados de presença");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchEvents();

    return () => {
      cancelled = true;
    };
  }, []);

  const days = useMemo(() => listDays(events), [events]);

  const filtered = useMemo(() => {
    if (day === "all") return events;
    return events.filter((e) => getEventDay(e.eventDate) === day);
  }, [events, day]);

  const chartData = useMemo<PresenceDatum[]>(
    () =>
      filtered
        .map((e) => ({
          name: e.eventName,
          present: e.present,
          total: e.total,
          rate: e.total > 0 ? (e.present / e.total) * 100 : 0,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [filtered]
  );

  const totals = useMemo(
    () =>
      chartData.reduce(
        (acc, e) => ({ present: acc.present + e.present, total: acc.total + e.total }),
        { present: 0, total: 0 }
      ),
    [chartData]
  );

  const meanRate = totals.total > 0 ? (totals.present / totals.total) * 100 : 0;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6">
      <BannerCard
        icon={Tabs.find((t) => t.key === "dashboard")?.icon}
        iconClassName="text-sky-400"
        label="Dados"
        title="Análise de Presença"
        description="Compare a presença entre os eventos, filtrando por dia."
        onBack={() => navigate("/dashboard")}
        cardClassName="border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-sky-950/40 overflow-hidden relative"
        labelClassName="text-xs uppercase tracking-[0.3em] text-sky-400 font-medium"
        titleClassName="text-2xl md:text-3xl text-white font-semibold"
        descriptionClassName="text-slate-400 mt-1"
      />

      {error && (
        <div className="rounded-lg bg-red-900/20 border border-red-700 p-4 text-red-200">{error}</div>
      )}

      {/* Filtro por dia + toggle de métrica */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setDay("all")}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              day === "all"
                ? "border-primary/40 bg-primary/30 text-primary"
                : "border-border bg-muted/20 text-muted-foreground hover:text-foreground"
            }`}
          >
            Todos os dias
          </button>
          {days.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDay(d)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                day === d
                  ? "border-primary/40 bg-primary/30 text-primary"
                  : "border-border bg-muted/20 text-muted-foreground hover:text-foreground"
              }`}
            >
              {formatDayLabel(d)}
            </button>
          ))}
        </div>

        <div className="flex rounded-lg border border-border bg-muted/20 p-0.5 text-xs">
          {(["present", "rate"] as Metric[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMetric(m)}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                metric === m
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "present" ? "Presenças" : "Taxa (%)"}
            </button>
          ))}
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: "Eventos", value: chartData.length.toLocaleString("pt-BR") },
          { label: "Presenças", value: totals.present.toLocaleString("pt-BR") },
          { label: "Taxa média", value: `${meanRate.toFixed(1)}%` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border/50 bg-muted/20 p-4 text-center">
            <p className="text-2xl font-bold text-primary">{stat.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <Card className="border-border bg-card/80 rounded-2xl">
        <CardHeader>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-lg bg-primary/15 p-2 text-primary">
              <Presentation className="w-5 h-5" />
            </span>
            <CardTitle>
              {day === "all" ? "Todos os eventos" : `Eventos de ${formatDayLabel(day)}`}
            </CardTitle>
            <CardDescription className="ml-auto hidden sm:block">
              {metric === "present" ? "Nº de presenças por evento" : "Taxa de presença por evento"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-muted-foreground">Carregando...</p>
            </div>
          ) : chartData.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Nenhum evento para o filtro selecionado.
            </p>
          ) : (
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 16, right: 8, left: 4, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={52}
                  />
                  <YAxis
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    domain={metric === "rate" ? [0, 100] : undefined}
                    unit={metric === "rate" ? "%" : undefined}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(148,163,184,0.1)" }}
                    content={({ active, payload, label }) => (
                      <PresenceTooltip active={active} payload={payload} label={label} />
                    )}
                  />
                  {metric === "present" ? (
                    <Bar name="Presenças" dataKey="present" radius={[6, 6, 0, 0]}>
                      {chartData.map((_, index) => (
                        <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                      ))}
                      <LabelList
                        dataKey="present"
                        position="top"
                        offset={6}
                        fontSize={11}
                        fill="#cbd5e1"
                        formatter={(value) =>
                          typeof value === "number" ? String(value) : String(value)
                        }
                      />
                    </Bar>
                  ) : (
                    <Bar name="Taxa (%)" dataKey="rate" radius={[6, 6, 0, 0]}>
                      {chartData.map((_, index) => (
                        <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                      ))}
                      <LabelList
                        dataKey="rate"
                        position="top"
                        offset={6}
                        fontSize={11}
                        fill="#cbd5e1"
                        formatter={(value) =>
                          typeof value === "number" ? `${value.toFixed(0)}%` : `${value}%`
                        }
                      />
                    </Bar>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}