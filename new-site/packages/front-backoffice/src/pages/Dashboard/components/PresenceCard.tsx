import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Presentation, ArrowRight } from "lucide-react";
import type { EventsSummary } from "@/api/dashboard";

export default function PresenceCard({
  data,
  loading,
}: {
  data?: EventsSummary;
  loading: boolean;
}) {
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const events = data?.events ?? [];
    const present = events.reduce((acc, e) => acc + e.present, 0);
    const total = events.reduce((acc, e) => acc + e.total, 0);
    const rate = total > 0 ? (present / total) * 100 : 0;
    return { events: events.length, present, rate };
  }, [data]);

  const items = [
    { label: "Eventos", value: stats.events.toLocaleString("pt-BR") },
    { label: "Presenças", value: stats.present.toLocaleString("pt-BR") },
    { label: "Taxa média", value: `${stats.rate.toFixed(1)}%` },
  ];

  return (
    <Card className="border-border bg-card/80 rounded-2xl transition-colors hover:border-primary/40">
      <CardHeader>
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-lg bg-primary/15 p-2 text-primary">
            <Presentation className="w-5 h-5" />
          </span>
          <CardTitle>Presença em eventos</CardTitle>
        </div>
        <CardDescription>Presenças, taxa média e análise detalhada por evento.</CardDescription>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {items.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-border/50 bg-muted/20 p-3 text-center"
              >
                <p className="text-xl font-bold text-primary">{stat.value}</p>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          variant="ghost"
          size="sm"
          className="w-full gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/dashboard/presence")}
        >
          Ver análise de presença
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}