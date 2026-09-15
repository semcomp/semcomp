import { CrudTable } from "@/components/CrudTable";
import type { CrudQueryParams } from "@/components/CrudTable";
import type { CrudItemType } from "@/types/CrudItem";
import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BannerCard } from "@/components/BannerCard";
import { signinEventsAPI, type SigninableEvent } from "@/api/signinEvent.ts";
import type { SigninEventType } from "@/types/SigninEventType";
import { fields, fieldsForEvent, API_FIELD_MAP } from "@/data/eventRegistrationCrudField";
import { Tabs } from "@/constants/Tabs";
import { useHasPermission } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, Calendar, MapPin, Users } from "lucide-react";

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

export default function EventRegistration() {
  const canWrite = useHasPermission("Inscrições", "RW");
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [signinableEvents, setSigninableEvents] = useState<SigninableEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SigninableEvent | null>(null);

  const [data, setData] = useState<SigninEventType[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastParamsRef = useRef<CrudQueryParams | undefined>(undefined);

  useEffect(() => {
    signinEventsAPI.getSigninableEvents().then(setSigninableEvents).catch(() => {});
  }, []);

  const fetchSignins = useCallback(
    async (params?: CrudQueryParams, event?: SigninableEvent | null) => {
      const activeEvent = event !== undefined ? event : selectedEvent;

      try {
        setLoading(true);
        setError(null);

        const filterField = activeEvent ? "event_name" : params?.filterField
          ? API_FIELD_MAP[params.filterField] || params.filterField
          : undefined;
        const filterValue = activeEvent ? activeEvent.name : params?.filterValue || undefined;

        const response = await signinEventsAPI.getAll(
          params?.page ?? 1,
          params?.pageSize ?? 10,
          API_FIELD_MAP[params?.sortField ?? ""] || "user_wait_list_position",
          params?.sortOrder ?? "asc",
          filterField,
          filterValue
        );

        setData(response.signins);
        setTotalRecords(response.filtered_records ?? response.total_records ?? 0);
      } catch (err: any) {
        const msg = err.response?.data?.message || "Erro ao carregar inscrições";
        setError(msg);
        showNotification(msg, "error");
      } finally {
        setLoading(false);
      }
    },
    [selectedEvent, showNotification]
  );

  const handleEventChange = (value: string) => {
    if (value === "__all__") {
      setSelectedEvent(null);
      setData([]);
      setTotalRecords(0);
      lastParamsRef.current = undefined;
      fetchSignins(undefined, null);
      return;
    }
    const event =
      signinableEvents.find((e) => `${e.name}__${e.init_date}` === value) ?? null;
    setSelectedEvent(event);
    setData([]);
    setTotalRecords(0);
    lastParamsRef.current = undefined;
    if (event) fetchSignins(undefined, event);
  };

  const handleQueryChange = useCallback(
    (params: CrudQueryParams) => {
      lastParamsRef.current = params;
      fetchSignins(params);
    },
    [fetchSignins]
  );

  const handleRotate = async () => {
    if (!selectedEvent) return;
    try {
      setRotating(true);
      await signinEventsAPI.rotate(selectedEvent.name, selectedEvent.init_date);
      showNotification("Fila rotacionada com sucesso", "success");
      await fetchSignins(lastParamsRef.current);
    } catch (err: any) {
      showNotification(err.response?.data?.message || "Erro ao rodar fila", "error");
    } finally {
      setRotating(false);
    }
  };

  const resolveSigninKey = useCallback((item: CrudItemType) => {
    const s = item as SigninEventType;
    return `${s.userNumber}__${s.eventName}__${s.eventInitDate}`;
  }, []);

  const handleDelete = async (itemKey: string) => {
    try {
      const signin = data.find((item) => resolveSigninKey(item) === itemKey);
      if (!signin) return;
      await signinEventsAPI.delete(signin.userNumber, signin.eventName, signin.eventInitDate);
      setData((prev) => prev.filter((item) => resolveSigninKey(item) !== itemKey));
      setTotalRecords((prev) => prev - 1);
      showNotification("Inscrição deletada com sucesso", "success");
    } catch (err: any) {
      showNotification(err.response?.data?.message || "Erro ao deletar inscrição", "error");
    }
  };

  const handleCreate = async (item: CrudItemType) => {
    try {
      const typedItem = item as SigninEventType;
      if (selectedEvent) {
        typedItem.eventName = selectedEvent.name;
        typedItem.eventInitDate = selectedEvent.init_date;
      }
      const created = await signinEventsAPI.create(typedItem);
      setData((prev) => [...prev, created]);
      setTotalRecords((prev) => prev + 1);
      showNotification("Inscrição criada com sucesso", "success");
    } catch (err: any) {
      showNotification(err.response?.data?.message || "Erro ao criar inscrição", "error");
    }
  };

  const handleEdit = async (item: CrudItemType, itemKey: string) => {
    try {
      const typedItem = item as SigninEventType;
      const original = data.find((s) => resolveSigninKey(s) === itemKey);
      if (!original) return;
      const updated = await signinEventsAPI.update(
        original.userNumber,
        original.eventName,
        original.eventInitDate,
        typedItem
      );
      setData((prev) =>
        prev.map((s) => (resolveSigninKey(s) === itemKey ? updated : s))
      );
      showNotification("Inscrição editada com sucesso", "success");
    } catch (err: any) {
      showNotification(err.response?.data?.message || "Erro ao editar inscrição", "error");
    }
  };

  const counts = {
    inscrito: data.filter((s) => s.status === "Inscrito").length,
    espera: data.filter((s) => s.status === "Lista de Espera").length,
    aguardando: data.filter((s) => s.status === "Aguardando Aprovação").length,
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6 overflow-x-auto scrollbar-hide">
      <BannerCard
        icon={Tabs.find((tab) => tab.key === "event-registration")?.icon}
        iconClassName="text-violet-400"
        label="Inscrições"
        title="Inscrições em Eventos"
        description="Selecione um evento para gerenciar inscrições e rodar a fila de espera."
        onBack={() => navigate("/home")}
        cardClassName="border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-violet-950/30 overflow-hidden relative"
        labelClassName="text-xs uppercase tracking-[0.3em] text-violet-400 font-medium"
        titleClassName="text-2xl md:text-3xl text-white font-semibold"
        descriptionClassName="text-slate-400 mt-1"
      />

      {/* Event selector */}
      <div className="rounded-xl border border-border bg-card/80 p-5 space-y-2">
        <p className="text-sm text-slate-400">Evento</p>
        <Select
          value={selectedEvent ? `${selectedEvent.name}__${selectedEvent.init_date}` : "__all__"}
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

      {selectedEvent && (
        <>
          {/* Event info + rotate */}
          <div className="rounded-xl border border-slate-700 bg-card/80 p-5 flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-1 space-y-2">
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
              <div className="flex flex-wrap gap-4 text-sm pt-1">
                <span className="text-emerald-400 font-medium">{counts.inscrito} inscritos</span>
                <span className="text-amber-400 font-medium">{counts.espera} em espera</span>
                {counts.aguardando > 0 && (
                  <span className="text-blue-400 font-medium">
                    {counts.aguardando} aguardando doação
                  </span>
                )}
              </div>
            </div>

            {canWrite && (
              <Button
                onClick={handleRotate}
                disabled={rotating || !selectedEvent.max_participants}
                title={!selectedEvent.max_participants ? "Evento com vagas ilimitadas" : undefined}
                variant="outline"
                className="shrink-0 border-violet-500/50 text-violet-300 hover:bg-violet-500/10 hover:text-violet-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${rotating ? "animate-spin" : ""}`} />
                {rotating ? "Rodando..." : "Rodar fila"}
              </Button>
            )}
          </div>

          {/* Sign-ups table */}
          <div className="rounded-xl border border-border bg-card/80 p-5">
            {error && (
              <div className="mb-4 rounded-lg bg-red-900/20 border border-red-700 p-4 text-red-200">
                {error}
              </div>
            )}
            {loading && data.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <p className="text-slate-400">Carregando inscrições...</p>
              </div>
            )}
            <CrudTable
              data={data}
              fields={fieldsForEvent}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCreate={handleCreate}
              getItemKey={resolveSigninKey}
              entityLabel="inscrição"
              totalRecords={totalRecords}
              onQueryChange={handleQueryChange}
              canWrite={canWrite}
            />
          </div>
        </>
      )}

      {!selectedEvent && (
        <div className="rounded-xl border border-border bg-card/80 p-5">
          <CrudTable
            data={data}
            fields={fields}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreate={handleCreate}
            getItemKey={resolveSigninKey}
            entityLabel="inscrição"
            totalRecords={totalRecords}
            onQueryChange={handleQueryChange}
            canWrite={canWrite}
          />
        </div>
      )}
    </section>
  );
}
