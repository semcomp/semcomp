import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";
import type { SalesOverviewStats } from "@/api/dashboard";

type SortMode = "sold" | "revenue";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function ProductsCard({
  data,
  loading,
}: {
  data?: SalesOverviewStats;
  loading: boolean;
}) {
  const [mode, setMode] = useState<SortMode>("sold");

  const ranked = useMemo(() => {
    const products = data?.topProducts ?? [];
    return [...products].sort((a, b) => b[mode] - a[mode]);
  }, [data, mode]);

  const maxValue = ranked.length > 0 ? ranked[0][mode] : 0;

  const tiles = [
    { label: "Pagos", value: (data?.totalPaid ?? 0).toLocaleString("pt-BR") },
    { label: "Pendentes", value: (data?.totalPending ?? 0).toLocaleString("pt-BR") },
    { label: "Faturamento", value: formatCurrency(data?.totalRevenue ?? 0) },
  ];

  return (
    <Card className="border-border bg-card/80 rounded-2xl transition-colors hover:border-primary/40">
      <CardHeader>
        <div className="mb-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-primary/15 p-2 text-primary">
              <ShoppingBag className="w-5 h-5" />
            </span>
            <CardTitle>Compras e produtos</CardTitle>
          </div>

          <div className="flex rounded-lg border border-border bg-muted/20 p-0.5 text-xs">
            {(["sold", "revenue"] as SortMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  mode === m
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "sold" ? "Mais vendidos" : "Maior valor"}
              </button>
            ))}
          </div>
        </div>
        <CardDescription>
          Quantidade, faturamento e ranking de itens vendidos (pedidos PAGO).
        </CardDescription>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2">
              {tiles.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-border/50 bg-muted/20 p-3 text-center"
                >
                  <p className="text-base md:text-lg font-bold text-primary">{stat.value}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {ranked.length === 0 ? null : (
              <div className="mt-4 space-y-2 max-h-96 overflow-y-auto pr-1">
                {ranked.map((product, index) => {
                  const width = maxValue > 0 ? (product[mode] / maxValue) * 100 : 0;
                  return (
                    <div
                      key={product.productId}
                      className="rounded-xl border border-border/50 bg-muted/20 p-3"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                            {index + 1}º
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {product.name}
                            </p>
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase text-primary">
                              {product.type}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-bold text-foreground">
                            {mode === "sold"
                              ? product.sold.toLocaleString("pt-BR")
                              : formatCurrency(product.revenue)}
                          </p>
                          {mode === "sold" ? (
                            <p className="text-[11px] text-muted-foreground">
                              {formatCurrency(product.revenue)}
                            </p>
                          ) : (
                            <p className="text-[11px] text-muted-foreground">
                              {product.sold.toLocaleString("pt-BR")} vendidos
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary/50"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}