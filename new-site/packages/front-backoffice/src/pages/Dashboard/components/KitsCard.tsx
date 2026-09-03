import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shirt } from "lucide-react";
import type { KitSalesStats } from "@/api/dashboard";

type GroupMode = "color" | "size";

interface KitGroup {
  label: string;
  total: number;
  children: { label: string; count: number }[];
}

// Monta a árvore de agrupamento a partir da lista plana byColorAndSize do backend
// (cor × tamanho × corte). O corte (is_babylook) não é separado no toggle; as
// quantidades são somadas dentro do agrupamento escolhido.
function buildGroups(data: KitSalesStats | undefined, mode: GroupMode): KitGroup[] {
  const variants = data?.byColorAndSize ?? [];

  const groups = new Map<string, Map<string, number>>();
  for (const variant of variants) {
    const outer = mode === "color" ? variant.color : variant.size;
    const inner = mode === "color" ? variant.size : variant.color;

    if (!groups.has(outer)) groups.set(outer, new Map());
    const innerMap = groups.get(outer)!;
    innerMap.set(inner, (innerMap.get(inner) ?? 0) + variant.count);
  }

  return [...groups.entries()]
    .map(([label, innerMap]) => {
      const children = [...innerMap.entries()]
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count);
      const total = children.reduce((sum, child) => sum + child.count, 0);
      return { label, total, children };
    })
    .sort((a, b) => b.total - a.total);
}

export default function KitsCard({ data, loading }: { data?: KitSalesStats; loading: boolean }) {
  const [mode, setMode] = useState<GroupMode>("color");

  const groups = useMemo(() => buildGroups(data, mode), [data, mode]);

  const outerLabel = mode === "color" ? "Cor" : "Tamanho";
  const innerLabel = mode === "color" ? "Tamanho" : "Cor";

  return (
    <Card className="border-border bg-card/80 rounded-2xl transition-colors hover:border-primary/40">
      <CardHeader>
        <div className="mb-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-primary/15 p-2 text-primary">
              <Shirt className="w-5 h-5" />
            </span>
            <CardTitle>Vendas de kits</CardTitle>
          </div>

          <div className="flex rounded-lg border border-border bg-muted/20 p-0.5 text-xs">
            {(["color", "size"] as GroupMode[]).map((m) => (
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
                {m === "color" ? "Por cor" : "Por tamanho"}
              </button>
            ))}
          </div>
        </div>
        <CardDescription>
          Quantidade vendida agrupada por {outerLabel.toLowerCase()}.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        ) : groups.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Sem dados de kits vendidos.</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {groups.map((group) => (
              <div key={group.label} className="rounded-xl border border-border/50 bg-muted/20 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{group.label}</p>
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                    {group.total.toLocaleString("pt-BR")} no total
                  </span>
                </div>

                <div className="space-y-1.5">
                  {group.children.map((child) => {
                    const width = group.total > 0 ? (child.count / group.total) * 100 : 0;
                    return (
                      <div key={child.label} className="flex items-center gap-2">
                        <span className="w-24 shrink-0 text-xs text-muted-foreground">
                          {innerLabel}: {child.label}
                        </span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary/60"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                        <span className="w-12 shrink-0 text-right text-xs font-medium text-foreground">
                          {child.count.toLocaleString("pt-BR")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}