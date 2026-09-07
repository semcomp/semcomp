import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee } from "lucide-react";
import type { CoffeeSalesStats } from "@/api/dashboard";
import { isNightCoffee } from "@/utils/coffeeRules";

function formatDateTime(dateTime: string): string {
  return new Date(dateTime).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CoffeesCard({
  data,
  loading,
}: {
  data?: CoffeeSalesStats;
  loading: boolean;
}) {
  const coffees = data?.byCoffee ?? [];

  return (
    <Card className="border-border bg-card/80 rounded-2xl transition-colors hover:border-primary/40">
      <CardHeader>
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-lg bg-primary/15 p-2 text-primary">
            <Coffee className="w-5 h-5" />
          </span>
          <CardTitle>Coffes vendidos</CardTitle>
        </div>
        <CardDescription>Quantidade total de coffes vendidos.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center py-6">
              <p className="text-4xl md:text-5xl font-bold text-primary">
                {(data?.totalSold ?? 0).toLocaleString("pt-BR")}
              </p>
              <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                Coffes vendidos
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Por dia</p>
              {coffees.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">Sem dados de coffes vendidos.</p>
              ) : (
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {coffees.map((coffee) => (
                    <div
                      key={coffee.coffeeId}
                      className="flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-muted/20 p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {formatDateTime(coffee.dateTime)}
                        </p>
                        <span
                          className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            isNightCoffee(coffee.dateTime)
                              ? "bg-amber-400/15 text-amber-400"
                              : "bg-sky-400/15 text-sky-400"
                          }`}
                        >
                          {isNightCoffee(coffee.dateTime) ? "Noturno" : "Diurno"}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-foreground">
                          {coffee.sold.toLocaleString("pt-BR")}
                        </p>
                        <p className="text-xs text-muted-foreground">vendidos</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}