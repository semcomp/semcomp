import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shirt } from "lucide-react";
import type { KitSalesStats, KitVariantStat } from "@/api/dashboard";

type AxisMode = "color" | "size";
type CutFilter = "all" | "babylook" | "traditional";

interface KitGroup {
  label: string;
  total: number;
  children: { label: string; count: number }[];
}

const CUT_FILTERS = ["all", "babylook", "traditional"] as CutFilter[];
const AXIS_MODES = ["color", "size"] as AxisMode[];

const CUT_LABELS: Record<CutFilter, string> = {
  all: "Todos",
  babylook: "Babylook",
  traditional: "Tradicional",
};

// Trecho usado na descrição do card, para casar com o filtro de corte ativo.
const CUT_PHRASES: Record<CutFilter, string> = {
  all: "de kits (babylook e tradicional)",
  babylook: "de babylooks",
  traditional: "de camisas tradicionais",
};

const CUT_EMPTY: Record<CutFilter, string> = {
  all: "Sem dados de kits vendidos.",
  babylook: "Sem babylooks vendidos.",
  traditional: "Sem camisas tradicionais vendidas.",
};

const AXIS_LABELS: Record<AxisMode, string> = {
  color: "Por cor",
  size: "Por tamanho",
};

const SEGMENT_CONTAINER = "flex rounded-lg border border-border bg-muted/20 p-0.5 text-xs";
const SEGMENT_ITEM = "rounded-md px-2.5 py-1 font-medium transition-colors";
const SEGMENT_ACTIVE = "bg-primary text-primary-foreground";
const SEGMENT_IDLE = "text-muted-foreground hover:text-foreground";

// Seleciona as variantes de um corte de camiseta. "all" mantém babylooks e
// tradicionais no mesmo agrupamento; os demais restringem a um corte só.
function matchesCut(variant: KitVariantStat, cut: CutFilter): boolean {
  if (cut === "all") return true;
  return variant.isBabylook === (cut === "babylook");
}

// Monta a árvore de agrupamento a partir da lista plana byColorAndSize do backend
// (cor × tamanho × corte), já filtrada pelo corte escolhido. O eixo externo é a
// cor ou o tamanho e o interno é o outro, de forma que o total exibido em cada
// grupo sempre some apenas as variantes do corte em questão.
function buildGroups(data: KitSalesStats | undefined, cut: CutFilter, axis: AxisMode): KitGroup[] {
  const variants = (data?.byColorAndSize ?? []).filter((variant) => matchesCut(variant, cut));

  const groups = new Map<string, Map<string, number>>();
  for (const variant of variants) {
    const outer = axis === "color" ? variant.color : variant.size;
    const inner = axis === "color" ? variant.size : variant.color;

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
  const [cut, setCut] = useState<CutFilter>("all");
  const [axis, setAxis] = useState<AxisMode>("color");

  const groups = useMemo(() => buildGroups(data, cut, axis), [data, cut, axis]);

  const outerLabel = axis === "color" ? "Cor" : "Tamanho";
  const innerLabel = axis === "color" ? "Tamanho" : "Cor";

  return (
    <Card className="border-border bg-card/80 rounded-2xl transition-colors hover:border-primary/40">
      <CardHeader>
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-lg bg-primary/15 p-2 text-primary">
            <Shirt className="w-5 h-5" />
          </span>
          <CardTitle>Vendas de kits</CardTitle>
        </div>

        <div className="mb-2 flex flex-wrap items-center gap-2">
          <div className={SEGMENT_CONTAINER}>
            {CUT_FILTERS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCut(option)}
                className={`${SEGMENT_ITEM} ${cut === option ? SEGMENT_ACTIVE : SEGMENT_IDLE}`}
              >
                {CUT_LABELS[option]}
              </button>
            ))}
          </div>

          <div className={SEGMENT_CONTAINER}>
            {AXIS_MODES.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setAxis(option)}
                className={`${SEGMENT_ITEM} ${axis === option ? SEGMENT_ACTIVE : SEGMENT_IDLE}`}
              >
                {AXIS_LABELS[option]}
              </button>
            ))}
          </div>
        </div>

        <CardDescription>
          Quantidade vendida {CUT_PHRASES[cut]}, agrupada por {outerLabel.toLowerCase()} e
          detalhada por {innerLabel.toLowerCase()}.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        ) : groups.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{CUT_EMPTY[cut]}</p>
        ) : (
          <>
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
          </>
        )}
      </CardContent>
    </Card>
  );
}