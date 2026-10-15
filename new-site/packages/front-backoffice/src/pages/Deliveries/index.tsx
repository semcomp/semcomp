import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Award, PackageCheck } from "lucide-react";
import { Tabs } from "@/constants/Tabs";
import { BannerCard } from "@/components/BannerCard";
import { useNotification } from "@/contexts/NotificationContext";
import { useHasPermission } from "@/contexts/AuthContext";
import { deliveriesAPI } from "@/api/deliveries";
import type { BadgeDeliveryUser } from "@/api/deliveries";
import type { Sale, SaleItem, SaleProduct } from "@/api/sales";
import { CrudTable } from "@/components/CrudTable";
import type { CrudItemType, } from "@/types/CrudItem";
import type { CrudField, CrudQueryParams } from "@/components/CrudTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// ── Tipos de aba ─────────────────────────────────────────────────────────────

type DeliveryTab = "KIT" | "CRACHA";

const DELIVERY_TABS: { type: DeliveryTab; label: string; icon: React.ReactNode; activeClass: string }[] = [
  {
    type: "KIT",
    label: "Kit",
    icon: <Package className="w-4 h-4" />,
    activeClass: "bg-blue-600 text-white border-blue-600",
  },
  {
    type: "CRACHA",
    label: "Crachá",
    icon: <Award className="w-4 h-4" />,
    activeClass: "bg-emerald-600 text-white border-emerald-600",
  },
];

// ── Helpers de kit ────────────────────────────────────────────────────────────

interface FlatKitItem {
  id: string;
  itemId: number;
  saleId: number;
  user_number_formatted: string;
  user_name: string;
  kit_name: string;
  kit_details: string;
  quantity: number;
  status: string; // "Retirado" | "Pendente"
  is_picked_up: boolean;
}

function formatKitDetails(kit: { size: string; color: string; is_babylook: boolean }): string {
  const parts = [`Tam. ${kit.size}`];
  if (kit.color) parts.push(kit.color);
  if (kit.is_babylook) parts.push("Babylook");
  return parts.join(" · ");
}

function resolveKit(item: SaleItem): SaleProduct["kit"] | undefined {
  if (item.product?.type === "KIT") return item.product.kit;
  if (item.product?.type === "COMBO") return item.kit_product?.kit;
  return undefined;
}

function hasKitProduct(item: SaleItem): boolean {
  if (item.product?.type === "KIT") return true;
  if (item.product?.type === "COMBO") return !!item.kit_product?.kit;
  return false;
}

function flattenKitItems(sales: Sale[]): FlatKitItem[] {
  const result: FlatKitItem[] = [];
  for (const sale of sales) {
    if (sale.status !== "PAGO") continue;
    for (const item of sale.items ?? []) {
      if (!hasKitProduct(item)) continue;
      const kit = resolveKit(item);
      result.push({
        id: String(item.id),
        itemId: item.id,
        saleId: sale.id,
        user_number_formatted: String(sale.user_number).padStart(5, "0"),
        user_name: sale.user?.name ?? `#${sale.user_number}`,
        kit_name: kit?.name ?? "Kit",
        kit_details: kit ? formatKitDetails(kit) : "",
        quantity: item.quantity,
        status: item.is_picked_up ? "Retirado" : "Pendente",
        is_picked_up: item.is_picked_up,
      });
    }
  }
  return result;
}

// ── Campos CrudTable ──────────────────────────────────────────────────────────

const KIT_FIELDS: CrudField[] = [
  { value: "user_number_formatted", label: "Nº", type: "text", sortable: false },
  { value: "user_name", label: "Participante", type: "text" },
  { value: "kit_name", label: "Kit", type: "text" },
  { value: "kit_details", label: "Detalhes", type: "text", sortable: false, searchable: false },
  { value: "quantity", label: "Qtd", type: "number", searchable: false },
  {
    value: "status",
    label: "Status",
    type: "select",
    sortable: false,
    searchable: false,
    selectVariants: {
      Retirado: "bg-emerald-900/40 text-emerald-300 border border-emerald-700/30",
      Pendente: "bg-slate-800 text-slate-300 border border-slate-600/30",
    },
  },
];

const BADGE_FIELDS: CrudField[] = [
  { value: "user_number", label: "Nº", type: "text" },
  { value: "name", label: "Participante", type: "text" },
  {
    value: "status",
    label: "Status",
    type: "select",
    sortable: false,
    searchable: false,
    selectVariants: {
      Entregue: "bg-emerald-900/40 text-emerald-300 border border-emerald-700/30",
      Pendente: "bg-slate-800 text-slate-300 border border-slate-600/30",
    },
  },
];

// ── Helpers client-side de paginação ──────────────────────────────────────────

function applyClientQuery<T extends Record<string, unknown>>(
  all: T[],
  params: CrudQueryParams,
): { items: T[]; total: number } {
  let filtered = all;

  if (params.filterValue && params.filterField) {
    const needle = params.filterValue.toLowerCase();
    filtered = all.filter((item) => {
      const v = String(item[params.filterField] ?? "").toLowerCase();
      return v.includes(needle);
    });
  }

  const sorted = [...filtered].sort((a, b) => {
    const aVal = String(a[params.sortField] ?? "");
    const bVal = String(b[params.sortField] ?? "");
    return params.sortOrder === "asc"
      ? aVal.localeCompare(bVal, "pt-BR", { numeric: true })
      : bVal.localeCompare(aVal, "pt-BR", { numeric: true });
  });

  const start = (params.page - 1) * params.pageSize;
  return { items: sorted.slice(start, start + params.pageSize) as T[], total: filtered.length };
}

// ── Aba Kits ─────────────────────────────────────────────────────────────────

function KitTab({ canWrite }: { canWrite: boolean }) {
  const { showNotification } = useNotification();
  const allRef = useRef<FlatKitItem[]>([]);
  const [display, setDisplay] = useState<CrudItemType[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado do modal de confirmação
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmItem, setConfirmItem] = useState<FlatKitItem | null>(null);
  const [saving, setSaving] = useState(false);

  const applyQuery = useCallback((params: CrudQueryParams) => {
    const { items, total } = applyClientQuery(
      allRef.current as unknown as Record<string, unknown>[],
      params,
    );
    setDisplay(items as unknown as CrudItemType[]);
    setTotal(total);
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await deliveriesAPI.getKitDeliveries();
      allRef.current = flattenKitItems(response.sales ?? []);
      const { items, total } = applyClientQuery(
        allRef.current as unknown as Record<string, unknown>[],
        { page: 1, pageSize: 10, sortField: "user_name", sortOrder: "asc", filterField: "user_name", filterValue: "" },
      );
      setDisplay(items as unknown as CrudItemType[]);
      setTotal(total);
    } catch {
      setError("Erro ao carregar itens de kit");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleEditClick = useCallback((item: CrudItemType) => {
    setConfirmItem(item as unknown as FlatKitItem);
    setConfirmOpen(true);
  }, []);

  const handleConfirm = async () => {
    if (!confirmItem) return;
    setSaving(true);
    try {
      const newValue = !confirmItem.is_picked_up;
      const { item: updated } = await deliveriesAPI.updateItemPickup(String(confirmItem.itemId), newValue);
      // atualiza no array mestre
      allRef.current = allRef.current.map((i) =>
        i.itemId === confirmItem.itemId
          ? { ...i, is_picked_up: updated.is_picked_up, status: updated.is_picked_up ? "Retirado" : "Pendente" }
          : i,
      );
      // reflecte na visualização atual
      setDisplay((prev) =>
        prev.map((i) =>
          (i as unknown as FlatKitItem).itemId === confirmItem.itemId
            ? { ...i, is_picked_up: updated.is_picked_up, status: updated.is_picked_up ? "Retirado" : "Pendente" }
            : i,
        ),
      );
      showNotification(
        updated.is_picked_up ? "Kit marcado como retirado!" : "Retirada desmarcada",
        "success",
      );
      setConfirmOpen(false);
    } catch {
      showNotification("Erro ao atualizar status do kit", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-400">Carregando kits...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-900/20 border border-red-700 p-4 text-red-200">{error}</div>
    );
  }

  const pending = allRef.current.filter((i) => !i.is_picked_up).length;
  const delivered = allRef.current.filter((i) => i.is_picked_up).length;

  return (
    <>
      <div className="flex gap-4 mb-4 text-sm text-slate-400">
        <span>Total: <strong className="text-slate-200">{allRef.current.length}</strong></span>
        <span>Pendentes: <strong className="text-amber-300">{pending}</strong></span>
        <span>Retirados: <strong className="text-emerald-300">{delivered}</strong></span>
      </div>

      <CrudTable
        data={display}
        fields={KIT_FIELDS}
        onEdit={() => {}}
        onEditClick={canWrite ? handleEditClick : undefined}
        editIcon={<PackageCheck className="w-3.5 h-3.5" />}
        getItemKey={(item) => (item as unknown as FlatKitItem).id}
        entityLabel="kit"
        totalRecords={total}
        onQueryChange={applyQuery}
        canWrite={canWrite}
      />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="bg-card border-border text-foreground w-[95vw] sm:max-w-106.25 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {confirmItem?.is_picked_up ? "Desfazer retirada?" : "Confirmar retirada?"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-3 space-y-1 text-sm text-muted-foreground">
            <p>
              <span className="text-foreground font-medium">{confirmItem?.user_name}</span>
              {" "}— Nº {confirmItem?.user_number_formatted}
            </p>
            <p>
              <span className="text-foreground">{confirmItem?.kit_name}</span>
              {confirmItem?.kit_details && (
                <span className="ml-1 text-amber-300/90">({confirmItem.kit_details})</span>
              )}
            </p>
            <p className="pt-1 text-slate-400">
              {confirmItem?.is_picked_up
                ? "Isso vai marcar o kit como não retirado."
                : "Isso vai marcar o kit como retirado pelo participante."}
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} className="text-muted-foreground">
              Cancelar
            </Button>
            <Button
              className={
                confirmItem?.is_picked_up
                  ? "bg-slate-600 hover:bg-slate-500 text-white"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white"
              }
              disabled={saving}
              onClick={handleConfirm}
            >
              {saving
                ? "Salvando..."
                : confirmItem?.is_picked_up
                  ? "Desfazer retirada"
                  : "Confirmar retirada"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Aba Crachás ───────────────────────────────────────────────────────────────

type BadgeRow = BadgeDeliveryUser & { id: string; status: string };

function BadgeTab({ canWrite }: { canWrite: boolean }) {
  const { showNotification } = useNotification();
  const allRef = useRef<BadgeRow[]>([]);
  const [display, setDisplay] = useState<CrudItemType[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmUser, setConfirmUser] = useState<BadgeRow | null>(null);
  const [saving, setSaving] = useState(false);

  const applyQuery = useCallback((params: CrudQueryParams) => {
    const { items, total } = applyClientQuery(
      allRef.current as unknown as Record<string, unknown>[],
      params,
    );
    setDisplay(items as unknown as CrudItemType[]);
    setTotal(total);
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await deliveriesAPI.getBadgeDeliveries(1, 1000, "name", "asc");
      allRef.current = (response.users ?? []).map((u) => ({
        ...u,
        id: u.user_number,
        status: u.delivered ? "Entregue" : "Pendente",
      }));
      const { items, total } = applyClientQuery(
        allRef.current as unknown as Record<string, unknown>[],
        { page: 1, pageSize: 10, sortField: "name", sortOrder: "asc", filterField: "name", filterValue: "" },
      );
      setDisplay(items as unknown as CrudItemType[]);
      setTotal(total);
    } catch {
      setError("Erro ao carregar lista de crachás");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleEditClick = useCallback((item: CrudItemType) => {
    setConfirmUser(item as unknown as BadgeRow);
    setConfirmOpen(true);
  }, []);

  const handleConfirm = async () => {
    if (!confirmUser) return;
    setSaving(true);
    const willDeliver = !confirmUser.delivered;
    try {
      if (willDeliver) {
        await deliveriesAPI.markDelivered(confirmUser.user_number);
      } else {
        await deliveriesAPI.unmarkDelivered(confirmUser.user_number);
      }

      const update = (row: BadgeRow): BadgeRow =>
        row.user_number === confirmUser.user_number
          ? { ...row, delivered: willDeliver, status: willDeliver ? "Entregue" : "Pendente" }
          : row;

      allRef.current = allRef.current.map(update);
      setDisplay((prev) => prev.map((i) => update(i as unknown as BadgeRow) as unknown as CrudItemType));

      showNotification(
        willDeliver ? "Crachá marcado como entregue!" : "Entrega de crachá desmarcada",
        "success",
      );
      setConfirmOpen(false);
    } catch {
      showNotification("Erro ao atualizar entrega de crachá", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-400">Carregando crachás...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-900/20 border border-red-700 p-4 text-red-200">{error}</div>
    );
  }

  if (allRef.current.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <p className="text-slate-400">Nenhum participante solicitou crachá.</p>
        <p className="text-xs text-slate-500">
          A lista será preenchida quando o prazo de solicitação de crachá reabrir.
        </p>
      </div>
    );
  }

  const pending = allRef.current.filter((u) => !u.delivered).length;
  const delivered = allRef.current.filter((u) => u.delivered).length;

  return (
    <>
      <div className="flex gap-4 mb-4 text-sm text-slate-400">
        <span>Total: <strong className="text-slate-200">{allRef.current.length}</strong></span>
        <span>Pendentes: <strong className="text-amber-300">{pending}</strong></span>
        <span>Entregues: <strong className="text-emerald-300">{delivered}</strong></span>
      </div>

      <CrudTable
        data={display}
        fields={BADGE_FIELDS}
        onEdit={() => {}}
        onEditClick={canWrite ? handleEditClick : undefined}
        editIcon={<PackageCheck className="w-3.5 h-3.5" />}
        getItemKey={(item) => (item as unknown as BadgeRow).id}
        entityLabel="crachá"
        totalRecords={total}
        onQueryChange={applyQuery}
        canWrite={canWrite}
      />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="bg-card border-border text-foreground w-[95vw] sm:max-w-106.25 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {confirmUser?.delivered ? "Desfazer entrega?" : "Confirmar entrega de crachá?"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-3 space-y-1 text-sm text-muted-foreground">
            <p>
              <span className="text-foreground font-medium">{confirmUser?.name}</span>
              {" "}— Nº {confirmUser?.user_number}
            </p>
            <p className="pt-1 text-slate-400">
              {confirmUser?.delivered
                ? "Isso vai marcar o crachá como não entregue."
                : "Isso vai registrar a entrega do crachá para este participante."}
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} className="text-muted-foreground">
              Cancelar
            </Button>
            <Button
              className={
                confirmUser?.delivered
                  ? "bg-slate-600 hover:bg-slate-500 text-white"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white"
              }
              disabled={saving}
              onClick={handleConfirm}
            >
              {saving
                ? "Salvando..."
                : confirmUser?.delivered
                  ? "Desfazer entrega"
                  : "Confirmar entrega"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function DeliveriesPage() {
  const canWrite = useHasPermission("Entregas", "RW");
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DeliveryTab>("KIT");

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6">
      <BannerCard
        icon={Tabs.find((t) => t.key === "deliveries")?.icon}
        iconClassName="text-violet-400"
        label="Entregas"
        title="Controle de Entregas"
        description="Gerencie a entrega de kits e crachás para os participantes da Semcomp."
        onBack={() => navigate("/home")}
        cardClassName="border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-violet-950/30 overflow-hidden relative"
        labelClassName="text-xs uppercase tracking-[0.3em] text-violet-400 font-medium"
        titleClassName="text-2xl md:text-3xl text-white font-semibold"
        descriptionClassName="text-slate-400 mt-1"
      />

      <div className="inline-flex gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1">
        {DELIVERY_TABS.map((tab) => (
          <button
            key={tab.type}
            onClick={() => setActiveTab(tab.type)}
            className={`flex items-center justify-center gap-2 rounded-lg px-5 py-2 text-sm font-medium border transition-all ${
              activeTab === tab.type
                ? tab.activeClass + " shadow-sm"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card/80 p-5">
        {activeTab === "KIT" && <KitTab canWrite={canWrite} />}
        {activeTab === "CRACHA" && <BadgeTab canWrite={canWrite} />}
      </div>
    </section>
  );
}
