import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee } from "lucide-react";
import type { CoffeeSalesStats } from "@/api/dashboard";

export default function CoffeesCard({
  data,
  loading,
}: {
  data?: CoffeeSalesStats;
  loading: boolean;
}) {
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
          <div className="flex flex-col items-center justify-center py-6">
            <p className="text-4xl md:text-5xl font-bold text-primary">
              {(data?.totalSold ?? 0).toLocaleString("pt-BR")}
            </p>
            <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
              Coffes vendidos
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}