import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Award, PackageCheck } from "lucide-react";
import { Tabs } from "@/constants/Tabs";
import { BannerCard } from "@/components/BannerCard";
import { useNotification } from "@/contexts/NotificationContext";
import { useHasPermission } from "@/contexts/AuthContext";
import { deliveriesAPI } from "@/api/deliveries";
import type { BadgeDeliveryUser, KitDeliveryItem } from "@/api/deliveries";
import { CrudTable } from "@/components/CrudTable";
import type { CrudItemType } from "@/types/CrudItem";
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
    selectVariants: {
      Entregue: "bg-emerald-900/40 text-emerald-300 border border-emerald-700/30",
      Pendente: "bg-slate-800 text-slate-300 border border-slate-600/30",
    },
  },
];

// ── Aba Kits ─────────────────────────────────────────────────────────────────

interface KitDisplayRow extends CrudItemType {
  itemId: number;
  user_number_formatted: string;
  user_name: string;
  kit_name: string;
  kit_details: string;
  quantity: number;
  status: string;
  is_picked_up: boolean;
}

function fromApiKitItem(item: KitDeliveryItem): KitDisplayRow {
  const parts = [`Tam. ${item.kit_size}`];
  if (item.kit_color) parts.push(item.kit_color);
  if (item.kit_is_babylook) parts.push("Babylook");
  return {
    id: String(item.item_id),
    itemId: item.item_id,
    user_number_formatted: item.user_number,
    user_name: item.user_name,
    kit_name: item.kit_name,
    kit_details: parts.join(" · "),
    quantity: item.quantity,
    status: item.is_picked_up ? "Retirado" : "Pendente",
    is_picked_up: item.is_picked_up,
  };
}

function KitTab({ canWrite }: { canWrite: boolean }) {
  const { showNotification } = useNotification();
  const [rows, setRows] = useState<KitDisplayRow[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmItem, setConfirmItem] = useState<KitDisplayRow | null>(null);
  const [saving, setSaving] = useState(false);

  const handleQueryChange = useCallback(async (params: CrudQueryParams) => {
    setLoading(true);
    try {
      const kitFieldMap: Record<string, string> = {
        user_number_formatted: "user_number",
        status: "is_picked_up",
      };
      const backendSortBy = kitFieldMap[params.sortField] ?? params.sortField;
      const backendSearchBy = kitFieldMap[params.filterField] ?? params.filterField;

      const result = await deliveriesAPI.getKitDeliveries(
        params.page,
        params.pageSize,
        backendSortBy || "user_name",
        params.sortOrder || "asc",
        backendSearchBy || undefined,
        params.filterValue || undefined
      );
      setRows((result.kit_deliveries ?? []).map(fromApiKitItem));
      setTotalRecords(result.filtered_records);
    } catch {
      showNotification("Erro ao carregar itens de kit", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const handleEditClick = useCallback((item: CrudItemType) => {
    setConfirmItem(item as unknown as KitDisplayRow);
    setConfirmOpen(true);
  }, []);

  const handleConfirm = async () => {
    if (!confirmItem) return;
    setSaving(true);
    try {
      const newValue = !confirmItem.is_picked_up;
      const { item: updated } = await deliveriesAPI.updateItemPickup(String(confirmItem.itemId), newValue);
      setRows((prev) =>
        prev.map((i) =>
          i.itemId === confirmItem.itemId
            ? { ...i, is_picked_up: updated.is_picked_up, status: updated.is_picked_up ? "Retirado" : "Pendente" }
            : i
        )
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

  if (loading && rows.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-400">Carregando kits...</p>
      </div>
    );
  }

  return (
    <>
      <CrudTable
        data={rows as unknown as CrudItemType[]}
        fields={KIT_FIELDS}
        defaultSortField="user_name"
        onEdit={() => {}}
        onEditClick={canWrite ? handleEditClick : undefined}
        editIcon={<PackageCheck className="w-3.5 h-3.5" />}
        getItemKey={(item) => (item as unknown as KitDisplayRow).id!}
        entityLabel="kit"
        totalRecords={totalRecords}
        onQueryChange={handleQueryChange}
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
  const [rows, setRows] = useState<BadgeRow[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmUser, setConfirmUser] = useState<BadgeRow | null>(null);
  const [saving, setSaving] = useState(false);

  const handleQueryChange = useCallback(async (params: CrudQueryParams) => {
    setLoading(true);
    try {
      const fieldMap: Record<string, string> = {
        name: "name",
        user_number: "user_number",
        status: "delivered",
      };
      const backendSortBy = fieldMap[params.sortField] ?? params.sortField;
      const backendSearchBy = fieldMap[params.filterField] ?? params.filterField;

      const result = await deliveriesAPI.getBadgeDeliveries(
        params.page,
        params.pageSize,
        backendSortBy || "name",
        params.sortOrder || "asc",
        backendSearchBy || undefined,
        params.filterValue || undefined
      );
      setRows(
        (result.users ?? []).map((u) => ({
          ...u,
          id: u.user_number,
          status: u.delivered ? "Entregue" : "Pendente",
        }))
      );
      setTotalRecords(result.filtered_records);
    } catch {
      showNotification("Erro ao carregar lista de crachás", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

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

      setRows((prev) => prev.map(update));

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

  if (loading && rows.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-400">Carregando crachás...</p>
      </div>
    );
  }

  return (
    <>
      <CrudTable
        data={rows as unknown as CrudItemType[]}
        fields={BADGE_FIELDS}
        onEdit={() => {}}
        onEditClick={canWrite ? handleEditClick : undefined}
        editIcon={<PackageCheck className="w-3.5 h-3.5" />}
        getItemKey={(item) => (item as unknown as BadgeRow).id}
        entityLabel="crachá"
        totalRecords={totalRecords}
        onQueryChange={handleQueryChange}
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
