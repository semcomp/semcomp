import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CrudTable } from "@/components/CrudTable";
import type { CrudField } from "@/components/CrudTable";
import type { CrudItemType } from "@/types/CrudItem";
import { BannerCard } from "@/components/BannerCard";
import { confirmationsAPI, type SigninableEvent } from "@/api/signinEvent";
import type { SigninEventType } from "@/types/SigninEventType";
import { Tabs } from "@/constants/Tabs";
import { useHasPermission } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, MapPin, Users, CheckCircle2 } from "lucide-react";

const STATUS_VARIANT: Record<string, string> = {
  "Aguardando Aprovação": "bg-blue-500/20 text-blue-300 border border-blue-500/30",
};

const globalFields: CrudField[] = [
  { value: "userNumber", label: "Nº Participante", type: "text", readonly: true },
  { value: "userName", label: "Nome", type: "text", readonly: true },
  { value: "eventName", label: "Evento", type: "text", readonly: true },
  { value: "eventInitDate", label: "Data", type: "date", readonly: true },
  { value: "status", label: "Status", type: "select", selectVariants: STATUS_VARIANT, readonly: true },
];

const eventFields: CrudField[] = [
  { value: "userNumber", label: "Nº Participante", type: "text", readonly: true },
  { value: "userName", label: "Nome", type: "text", readonly: true },
  { value: "userWaitListPosition", label: "Posição na Fila", type: "number", readonly: true },
  { value: "status", label: "Status", type: "select", selectVariants: STATUS_VARIANT, readonly: true },
];

const formatDate = (iso: string) => {
  if (!iso) return "";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ConfirmRegistrations() {
  const canWrite = useHasPermission("Confirmações de Inscrição", "RW");
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [signinableEvents, setSigninableEvents] = useState<SigninableEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SigninableEvent | null>(null);

  const [data, setData] = useState<SigninEventType[]>([]);
  const [loading, setLoading] = useState(false);

  const [confirmItem, setConfirmItem] = useState<SigninEventType | null>(null);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    confirmationsAPI.getSigninableEvents().then(setSigninableEvents).catch(() => {});
  }, []);

  const fetchPending = useCallback(
    async (event?: SigninableEvent | null) => {
      const activeEvent = event !== undefined ? event : selectedEvent;
      try {
        setLoading(true);
        const response = await confirmationsAPI.getAll(
          1,
          500,
          "user_wait_list_position",
          "asc",
          activeEvent ? "event_name" : "status",
          activeEvent ? activeEvent.name : "Aguardando Aprovação"
        );
        const pending = activeEvent
          ? response.signins.filter((s) => s.status === "Aguardando Aprovação")
          : response.signins;
        setData(pending);
      } catch {
        showNotification("Erro ao carregar inscrições pendentes", "error");
      } finally {
        setLoading(false);
      }
    },
    [selectedEvent, showNotification]
  );

  useEffect(() => {
    fetchPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEventChange = (value: string) => {
    if (value === "__all__") {
      setSelectedEvent(null);
      fetchPending(null);
      return;
    }
    const event =
      signinableEvents.find((e) => `${e.name}__${e.init_date}` === value) ?? null;
    setSelectedEvent(event);
    if (event) fetchPending(event);
  };

  const resolveKey = useCallback((item: CrudItemType) => {
    const s = item as SigninEventType;
    return `${s.userNumber}__${s.eventName}__${s.eventInitDate}`;
  }, []);

  const handleApproveClick = useCallback((item: CrudItemType) => {
    setConfirmItem(item as SigninEventType);
  }, []);

  const handleConfirmApprove = async () => {
    if (!confirmItem) return;
    try {
      setApproving(true);
      await confirmationsAPI.approve(
        confirmItem.userNumber,
        confirmItem.eventName,
        confirmItem.eventInitDate
      );
      const key = resolveKey(confirmItem);
      setData((prev) => prev.filter((s) => resolveKey(s) !== key));
      showNotification("Inscrição aprovada com sucesso", "success");
      setConfirmItem(null);
    } catch (err: any) {
      showNotification(
        err.response?.data?.message || "Erro ao aprovar inscrição",
        "error"
      );
    } finally {
      setApproving(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6 overflow-x-auto scrollbar-hide">
      <BannerCard
        icon={Tabs.find((t) => t.key === "confirm-registrations")?.icon}
        iconClassName="text-emerald-400"
        label="Inscrições"
        title="Confirmações de Inscrição"
        description="Aprove inscrições que aguardam confirmação presencial no Fernão."
        onBack={() => navigate("/home")}
        cardClassName="border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-emerald-950/30 overflow-hidden relative"
        labelClassName="text-xs uppercase tracking-[0.3em] text-emerald-400 font-medium"
        titleClassName="text-2xl md:text-3xl text-white font-semibold"
        descriptionClassName="text-slate-400 mt-1"
      />

      {/* Event selector */}
      <div className="rounded-xl border border-border bg-card/80 p-5 space-y-2">
        <p className="text-sm text-slate-400">Filtrar por evento</p>
        <Select
          value={
            selectedEvent
              ? `${selectedEvent.name}__${selectedEvent.init_date}`
              : "__all__"
          }
          onValueChange={handleEventChange}
        >
          <SelectTrigger className="w-full bg-slate-900 border-slate-700 text-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
            <SelectItem value="__all__">Todos os eventos</SelectItem>
            {signinableEvents.map((event) => (
              <SelectItem
                key={`${event.name}__${event.init_date}`}
                value={`${event.name}__${event.init_date}`}
              >
                {event.name} — {formatDate(event.init_date)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Event info */}
      {selectedEvent && (
        <div className="rounded-xl border border-slate-700 bg-card/80 p-5 space-y-2">
          <h2 className="text-lg font-semibold text-white">{selectedEvent.name}</h2>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(selectedEvent.init_date)} → {formatDate(selectedEvent.end_date)}
            </span>
            {selectedEvent.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {selectedEvent.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {selectedEvent.max_participants
                ? `${selectedEvent.max_participants} vagas`
                : "Vagas ilimitadas"}
            </span>
          </div>
          <p className="text-sm font-medium text-blue-400 pt-1">
            {data.length}{" "}
            {data.length === 1 ? "inscrição aguardando" : "inscrições aguardando"} aprovação
          </p>
        </div>
      )}

      {!selectedEvent && !loading && (
        <p className="text-sm text-slate-400 px-1">
          {data.length}{" "}
          {data.length === 1
            ? "inscrição aguardando aprovação em todos os eventos"
            : "inscrições aguardando aprovação em todos os eventos"}
        </p>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border bg-card/80 p-5">
        {loading && data.length === 0 && (
          <p className="text-center text-slate-400 py-12">Carregando...</p>
        )}
        <CrudTable
          data={data}
          fields={selectedEvent ? eventFields : globalFields}
          onEdit={() => {}}
          onDelete={() => {}}
          getItemKey={resolveKey}
          entityLabel="inscrição pendente"
          totalRecords={data.length}
          canWrite={false}
          onAction={canWrite ? handleApproveClick : undefined}
          actionIcon={<CheckCircle2 className="w-4 h-4" />}
          actionTitle="Aprovar inscrição"
        />
      </div>

      {/* Confirmation modal */}
      <Dialog
        open={!!confirmItem}
        onOpenChange={(open) => {
          if (!open) setConfirmItem(null);
        }}
      >
        <DialogContent
          className="bg-slate-900 border-slate-700 text-slate-100"
          style={{ maxWidth: "min(36rem, calc(100% - 2rem))" }}
        >
          <DialogHeader>
            <DialogTitle className="text-white">Confirmar aprovação</DialogTitle>
          </DialogHeader>

          {confirmItem && (
            <div className="space-y-3 py-2">
              <p className="text-slate-300 text-sm">
                Deseja aprovar a inscrição abaixo? O status será alterado para{" "}
                <span className="text-emerald-400 font-medium">Inscrito</span>.
              </p>
              <div className="rounded-lg bg-slate-800 border border-slate-700 p-4 space-y-1.5 text-sm">
                <p>
                  <span className="text-slate-400">Participante:</span>{" "}
                  <span className="text-white font-medium">
                    #{confirmItem.userNumber}
                    {confirmItem.userName ? ` — ${confirmItem.userName}` : ""}
                  </span>
                </p>
                <p>
                  <span className="text-slate-400">Evento:</span>{" "}
                  <span className="text-white font-medium">{confirmItem.eventName}</span>
                </p>
                <p>
                  <span className="text-slate-400">Data:</span>{" "}
                  <span className="text-white font-medium">
                    {formatDate(confirmItem.eventInitDate)}
                  </span>
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmItem(null)}
              disabled={approving}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmApprove}
              disabled={approving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {approving ? "Aprovando..." : "Confirmar aprovação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
