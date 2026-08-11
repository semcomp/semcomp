import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs } from "@/constants/Tabs";
import { BannerCard } from "@/components/BannerCard";
import { useNotification } from "@/contexts/NotificationContext";
import { useHasPermission } from "@/contexts/AuthContext";
import { salesAPI } from "@/api/sales";
import type { Sale as BaseSale, SaleItem } from "@/api/sales";
import { CrudTable } from "@/components/CrudTable";
import type { CrudQueryParams } from "@/components/CrudTable";
import { fields } from "@/data/salesCrudField";
import type { CrudItemType } from "@/types/CrudItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, PackageCheck, PackageX, UtensilsCrossed } from "lucide-react";

// TODO: mover estes campos para a definição de `Sale` em "@/api/sales" assim que o
// tipo lá for atualizado. O backend já retorna `has_kit_items`, `has_coffee_items`
// (calculados a partir dos produtos da venda, inclusive dentro de COMBOs) e
// `dietary_restrictions` (texto livre, informado pelo admin).
type Sale = BaseSale & {
  has_kit_items?: boolean;
  has_coffee_items?: boolean;
  dietary_restrictions?: string;
};

// Extrai um nome amigável para exibição a partir do produto vinculado ao item da venda.
// KIT e COFFEE têm nome próprio; COMBO não tem nome direto, então montamos uma
// descrição a partir dos itens que o compõem (quando disponíveis via preload).
function getProductDisplayName(product: any): string {
  if (!product) return "Produto";

  if (product.kit?.name) return product.kit.name;
  if (product.coffee?.name) return product.coffee.name;

  if (product.type === "COMBO" && product.combo_items?.length) {
    const itemNames = product.combo_items
      .map((ci: any) => ci.item?.kit?.name ?? ci.item?.coffee?.name)
      .filter(Boolean);
    if (itemNames.length > 0) {
      return `Combo (${itemNames.join(" + ")})`;
    }
    return "Combo";
  }

  return product.type ?? "Produto";
}

// Monta uma linha descritiva com tamanho/cor/modelo de um Kit (camiseta).
function formatKitInfo(kit: any): string {
  const parts = [`Tamanho ${kit.size}`];
  if (kit.color) parts.push(kit.color);
  if (kit.is_babydoll) parts.push("Babydoll");
  return parts.join(" · ");
}

// Retorna uma linha de detalhe por Kit envolvido no item da venda: o Kit direto
// (quando o produto do item é do tipo KIT) e/ou os Kits que fazem parte de um Combo.
function getKitInfoLines(product: any): string[] {
  if (!product) return [];
  const lines: string[] = [];

  if (product.kit) {
    lines.push(formatKitInfo(product.kit));
  }

  if (product.type === "COMBO" && product.combo_items?.length) {
    for (const comboItem of product.combo_items) {
      if (comboItem.item?.kit) {
        lines.push(formatKitInfo(comboItem.item.kit));
      }
    }
  }

  return lines;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// const statusColors: Record<string, string> = {
//   PENDENTE: "bg-amber-900/40 text-amber-300 border-amber-700/40",
//   PAGO: "bg-emerald-900/40 text-emerald-300 border-emerald-700/40",
//   CANCELADO: "bg-red-900/40 text-red-300 border-red-700/40",
//   REEMBOLSADO: "bg-blue-900/40 text-blue-300 border-blue-700/40",
// };

interface SaleFormState {
  status: "PENDENTE" | "PAGO" | "CANCELADO" | "REEMBOLSADO";
  payment_method: string;
  dietary_restrictions: string;
}

function SaleForm({
  value,
  onChange,
  showDietaryRestrictions,
}: {
  value: SaleFormState;
  onChange: (v: SaleFormState) => void;
  showDietaryRestrictions: boolean;
}) {
  return (
    <div className="space-y-4 py-2">
      <div className="space-y-1.5">
        <Label className="text-foreground text-sm">Status do Pedido</Label>
        <select
          value={value.status}
          onChange={(e) => onChange({ ...value, status: e.target.value as any })}
          className="flex h-10 w-full rounded-md border border-muted/30 bg-muted/40 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <option value="PENDENTE">Pendente</option>
          <option value="PAGO">Pago</option>
          <option value="CANCELADO">Cancelado</option>
          <option value="REEMBOLSADO">Reembolsado</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-foreground text-sm">Método de Pagamento</Label>
        <Input
          value={value.payment_method}
          onChange={(e) => onChange({ ...value, payment_method: e.target.value })}
          placeholder="Ex: PIX, MERCADOPAGO"
          className="bg-muted/40 border-muted/30 text-foreground focus-visible:ring-primary"
        />
      </div>

      {showDietaryRestrictions && (
        <div className="space-y-1.5">
          <Label className="text-foreground text-sm flex items-center gap-1.5">
            <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" />
            Restrições Alimentares
          </Label>
          <Input
            value={value.dietary_restrictions}
            onChange={(e) => onChange({ ...value, dietary_restrictions: e.target.value })}
            placeholder="Ex: Vegano, sem lactose, alergia a amendoim"
            className="bg-muted/40 border-muted/30 text-foreground focus-visible:ring-primary"
          />
          <p className="text-xs text-muted-foreground">
            Este pedido inclui coffee, então é possível registrar restrições alimentares do participante.
          </p>
        </div>
      )}
    </div>
  );
}

export default function SalesCRUD() {
  const canWrite = useHasPermission("Vendas", "RW");
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [data, setData] = useState<Sale[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal de edição
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Sale | null>(null);
  const [form, setForm] = useState<SaleFormState>({ status: "PENDENTE", payment_method: "", dietary_restrictions: "" });

  // Modal de Itens (Para controle de retirada de Kits/Produtos)
  const [itemsOpen, setItemsOpen] = useState(false);
  const [itemsSale, setItemsSale] = useState<Sale | null>(null);

  const fetchSales = useCallback(async (params?: CrudQueryParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await salesAPI.getAll(
        params?.page ?? 1,
        params?.pageSize ?? 10,
        params?.sortField ?? "created_at",
        params?.sortOrder ?? "desc",
        params?.filterField && params?.filterValue ? params.filterField : undefined,
        params?.filterValue || undefined,
      );
      console.log(response.sales[0]);
      setData(response.sales || []);
      setTotalRecords(response.filtered_records ?? response.total_records ?? 0);
    } catch {
      setError("Erro ao carregar vendas");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = useCallback((params: CrudQueryParams) => {
    fetchSales(params);
  }, [fetchSales]);

  // Abre o dialog de edição quando o pencil é clicado
  const handleEditClick = (_item: CrudItemType, itemKey: string) => {
    const sale = data.find((s) => s.id.toString() === itemKey);
    if (!sale) return;
    setEditTarget(sale);
    setForm({
      status: sale.status,
      payment_method: sale.payment_method,
      dietary_restrictions: sale.dietary_restrictions ?? "",
    });
    setEditOpen(true);
  };

  const handleDelete = async (itemKey: string) => {
    try {
      await salesAPI.delete(itemKey);
      setData((prev) => prev.filter((s) => s.id.toString() !== itemKey));
      setTotalRecords((prev) => prev - 1);
      showNotification("Venda removida com sucesso", "success");
    } catch {
      showNotification("Erro ao remover venda", "error");
    }
  };

  const handleUpdate = async () => {
    if (!editTarget) return;
    try {
      const { sale } = await salesAPI.update(editTarget.id.toString(), {
        status: form.status,
        payment_method: form.payment_method,
        dietary_restrictions: form.dietary_restrictions,
      });
      setData((prev) => prev.map((s) => (s.id === editTarget.id ? sale : s)));
      setEditOpen(false);
      setEditTarget(null);
      showNotification("Venda atualizada com sucesso", "success");
    } catch (err: any) {
      showNotification(err.response?.data?.message || "Erro ao atualizar venda", "error");
    }
  };

  const openItems = async (sale: Sale) => {
    setItemsSale(sale);
    setItemsOpen(true);
  };

  const handleTogglePickup = async (item: SaleItem, newValue: boolean) => {
    if (!itemsSale) return;
    try {
      console.log(item.id.toString());
      const { item: updatedItem } = await salesAPI.updateItemPickup(item.id.toString(), newValue);

      // Atualiza o estado local do item dentro da venda
      setItemsSale((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items?.map((i) => (i.id === item.id ? updatedItem : i)),
        };
      });

      // Atualiza a tabela geral
      setData((prev) =>
        prev.map((s) =>
          s.id === itemsSale.id
            ? { ...s, items: s.items?.map((i) => (i.id === item.id ? updatedItem : i)) }
            : s
        )
      );

      showNotification(`Status de retirada atualizado para ${newValue ? 'Retirado' : 'Pendente'}`, "success");
    } catch (err: any) {
      showNotification(err.response?.data?.message || "Erro ao atualizar status de retirada", "error");
    }
  };

  const tableData: CrudItemType[] = data.map((sale) => ({
    ...sale,
    id: sale.id.toString(), // CrudTable geralmente espera ID string
    total_amount_formatted: formatCurrency(sale.total_amount),
    // status: (
    //   <Badge className={`px-2 py-0.5 text-xs border ${statusColors[sale.status] || "bg-muted text-foreground"}`}>
    //     {sale.status}
    //   </Badge>
    // ),
  }));

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6">
      <BannerCard
        icon={Tabs.find((t) => t.key === "sales")?.icon}
        iconClassName="text-violet-400"
        label="Loja"
        title="Gerenciamento de Vendas"
        description="Acompanhe os pedidos, altere o status de pagamento e dê baixa nos kits retirados pelos participantes."
        onBack={() => navigate("/home")}
        cardClassName="border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-emerald-950/30 overflow-hidden relative"
        labelClassName="text-xs uppercase tracking-[0.3em] text-violet-400 font-medium"
        titleClassName="text-2xl md:text-3xl text-white font-semibold"
        descriptionClassName="text-slate-400 mt-1"
      />

      <div className="rounded-xl border border-border bg-card/80 p-5">
        {error && (
          <div className="mb-4 rounded-lg bg-red-900/20 border border-red-700 p-4 text-red-200">{error}</div>
        )}
        {loading && data.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-400">Carregando vendas...</p>
          </div>
        )}

        <CrudTable
          data={tableData}
          fields={fields}
          onEdit={() => {}}
          onEditClick={handleEditClick}
          onDelete={handleDelete}
          getItemKey={(item) => (item as Sale & { id: string }).id}
          entityLabel="venda"
          serverSide
          totalRecords={totalRecords}
          onQueryChange={handleQueryChange}
          canWrite={canWrite}
          onAction={(item) => {
            const sale = data.find((s) => s.id.toString() === (item as any).id);
            if (!sale) return;
            if (!sale.has_kit_items && !sale.has_coffee_items) {
              // TODO: confirme se "info" existe no union type de showNotification;
              // troque por "success"/"error" se necessário.
              showNotification("Este pedido não possui kits para retirada nem itens de café", "info");
              return;
            }
            openItems(sale);
          }}
          actionIcon={<ShoppingBag className="w-3.5 h-3.5" />}
          actionTitle="Ver itens / Retirada / Restrições"
        />
      </div>

      {/* Modal Editar Venda */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-card border-border text-foreground w-[95vw] sm:max-w-106.25 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Editar Venda #{editTarget?.id}</DialogTitle>
          </DialogHeader>
          <SaleForm
            value={form}
            onChange={setForm}
            showDietaryRestrictions={!!editTarget?.has_coffee_items}
          />
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setEditOpen(false)} className="text-muted-foreground">
              Cancelar
            </Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={handleUpdate}>
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Itens / Retirada / Restrições Alimentares */}
      <Dialog open={itemsOpen} onOpenChange={setItemsOpen}>
        <DialogContent className="bg-card border-border text-foreground w-[95vw] sm:max-w-106.25 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-emerald-400" />
              Pedido #{itemsSale?.id}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2 max-h-[60vh] overflow-y-auto">
            {/* Retirada: só é exibida se a venda envolve algum produto do tipo KIT
                (direto ou dentro de um COMBO) — vendas só de café não têm o que retirar. */}
            {itemsSale?.has_kit_items && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <PackageCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Retirada de Kits
                </h3>

                {(!itemsSale?.items || itemsSale.items.length === 0) ? (
                  <p className="text-muted-foreground text-sm text-center py-4">Nenhum item encontrado nesta venda.</p>
                ) : (
                  <div className="space-y-3">
                    {itemsSale.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">
                            {item.quantity}x {getProductDisplayName((item as any).product)}
                          </span>
                          {getKitInfoLines((item as any).product).map((line, idx) => (
                            <span key={idx} className="text-xs font-semibold text-amber-300/90">
                              {line}
                            </span>
                          ))}
                          <span className="text-xs text-muted-foreground">
                            Preço unitário: {formatCurrency(item.unit_price)}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge className={item.is_picked_up ? "bg-emerald-900/40 text-emerald-300" : "bg-slate-800 text-slate-300"}>
                            {item.is_picked_up ? "Retirado" : "Pendente"}
                          </Badge>

                          {canWrite && (
                            <Button
                              size="sm"
                              variant={item.is_picked_up ? "outline" : "default"}
                              className={`h-8 w-8 p-0 ${item.is_picked_up ? "border-emerald-500/30 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20" : "bg-emerald-600 hover:bg-emerald-500 text-white"}`}
                              onClick={() => handleTogglePickup(item, !item.is_picked_up)}
                              title={item.is_picked_up ? "Desfazer retirada" : "Marcar como retirado"}
                            >
                              {item.is_picked_up ? <PackageX className="h-4 w-4" /> : <PackageCheck className="h-4 w-4" />}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Restrições alimentares: só é exibida se a venda envolve algum produto
                do tipo COFFEE (direto ou dentro de um COMBO). */}
            {itemsSale?.has_coffee_items && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" />
                  Restrições Alimentares
                </h3>
                <div className="p-3 rounded-lg border border-border/50 bg-muted/20">
                  {itemsSale.dietary_restrictions ? (
                    <p className="text-sm text-foreground">{itemsSale.dietary_restrictions}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhuma restrição informada.</p>
                  )}
                </div>
                {canWrite && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground px-0 h-auto"
                    onClick={() => {
                      setItemsOpen(false);
                      if (itemsSale) handleEditClick(itemsSale as unknown as CrudItemType, itemsSale.id.toString());
                    }}
                  >
                    Editar restrições alimentares
                  </Button>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setItemsOpen(false)} className="text-muted-foreground">
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}