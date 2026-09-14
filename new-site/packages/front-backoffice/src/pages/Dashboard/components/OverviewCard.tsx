import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import type { UsersStats } from "@/api/dashboard";

interface OverviewCardProps {
  data?: UsersStats;
  loading: boolean;
}

function formatNumber(value: number | undefined): string {
  return (value ?? 0).toLocaleString("pt-BR");
}

export default function OverviewCard({ data, loading }: OverviewCardProps) {
  const stats = [
    {
      label: "Inscritos",
      value: formatNumber(data?.total),
      accent: "text-sky-400",
    },
    {
      label: "Justificados de ausência",
      value: formatNumber(data?.justifiedAbsence),
      accent: "text-amber-400",
    },
    {
      label: "Com PAPFE",
      value: formatNumber(data?.totalWithPapfe),
      accent: "text-emerald-400",
    },
  ];

  const usp = data?.uspParticipants ?? 0;
  const external = data?.externalParticipants ?? 0;
  const originTotal = usp + external;
  const uspPercent = originTotal > 0 ? (usp / originTotal) * 100 : 0;
  const externalPercent = originTotal > 0 ? (external / originTotal) * 100 : 0;

  return (
    <Card className="border-border bg-card/80 rounded-2xl transition-colors hover:border-primary/40">
      <CardHeader>
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-lg bg-primary/15 p-2 text-primary">
            <Users className="w-5 h-5" />
          </span>
          <CardTitle>Overview de participantes</CardTitle>
        </div>
        <CardDescription>
          Inscritos, justificados de ausência e alunos com PAPFE. Origem: USP × externos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border/50 bg-muted/20 p-4 text-center"
                >
                  <p className={`text-2xl md:text-3xl font-bold ${stat.accent}`}>{stat.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Origem</p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-sky-400">
                    <span className="h-2 w-2 rounded-full bg-sky-400" />
                    USP · {formatNumber(usp)} ({uspPercent.toFixed(1).replace(".", ",")}%)
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-violet-400">
                    <span className="h-2 w-2 rounded-full bg-violet-400" />
                    Externos · {formatNumber(external)} ({externalPercent.toFixed(1).replace(".", ",")}%)
                  </span>
                </div>
              </div>
              {originTotal > 0 ? (
                <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-sky-400 transition-all"
                    style={{ width: `${uspPercent}%` }}
                  />
                  <div
                    className="h-full bg-violet-400 transition-all"
                    style={{ width: `${externalPercent}%` }}
                  />
                </div>
              ) : (
                <p className="py-1 text-center text-xs text-muted-foreground">Sem dados de origem.</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}