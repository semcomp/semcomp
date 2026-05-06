import { CrudTable } from "@/components/CrudTable";
import type { CrudItemType } from "@/types/CrudItem";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs } from "@/constants/Tabs";
import { fields } from "@/data/eventsCrudField";
import { BannerCard } from "@/components/BannerCard";
import type { EventType } from "@/types/EventType";
import { eventsAPI } from "@/api/events";
import { useNotification } from "@/contexts/NotificationContext";

export default function Events() {
  const navigate = useNavigate();
  const [data, setData] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {showNotification} = useNotification();

  useEffect(() => {
    showNotification(error as string, "warning");
  }, [error]);

  // Buscar eventos ao montar o componente
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventsAPI.getAll();
      setData(response.events || []);
    } catch (err) {
      console.error("Erro ao buscar eventos:", err);
      setError("Erro ao carregar eventos");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const resolveEventKey = (event: CrudItemType) => {
    const typedEvent = event as EventType;
    return `${typedEvent.nameEvent}__${typedEvent.dateInit}`;
  };

  const handleEdit = async (item: CrudItemType, itemKey: string) => {
    try {
      const typedItem = item as EventType;
      const originalEvent = data.find(e => resolveEventKey(e) === itemKey);
      if (!originalEvent) return;

      await eventsAPI.update(originalEvent.nameEvent, originalEvent.dateInit, typedItem);

      // Atualizar estado local
      setData((prev) =>
        prev.map((event) => (resolveEventKey(event) === itemKey ? typedItem : event))
      );
    } catch (err) {
      console.error("Erro ao editar evento:", err);
      setError("Erro ao editar evento");
    }
  };

  const handleDelete = async (itemKey: string) => {
    try {
      const event = data.find(e => resolveEventKey(e) === itemKey);
      if (!event) return;

      await eventsAPI.delete(event.nameEvent, event.dateInit);
      setData((prev) => prev.filter((event) => resolveEventKey(event) !== itemKey));
    } catch (err) {
      console.error("Erro ao deletar evento:", err);
      setError("Erro ao deletar evento");
    }
  };

  const handleCreate = async (item: CrudItemType) => {
    try {
      const typedItem = item as EventType;
      const createdEvent = await eventsAPI.create(typedItem);
      setData((prev) => [...prev, createdEvent]);
    } catch (err:any) {
      console.log(err);
      setError(err.response?.data?.message || "Erro ao criar evento");
    }
  };

  const handleAction = (item: CrudItemType) => {
    const event = item as EventType;
    navigate(
      `/events/${encodeURIComponent(event.nameEvent)}/${encodeURIComponent(event.dateInit)}/qrcode-reader`,
      {
        state: {
          eventName: event.nameEvent,
          datetime: event.dateInit,
        },
      }
    );
  };


  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6">
      {/* Header card situando a página em que está */}
      <BannerCard
        icon={Tabs.find(tab => tab.key === "events")?.icon}
        iconClassName="text-violet-400"
        label="Eventos"
        title="Gerenciamento de Eventos da Semcomp"
        description="Cadastre, busque, edite e remova palestras, oficinas, workshops e cronograma da Semcomp."
        onBack={() => navigate('/home')}
        cardClassName="border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-violet-950/30 overflow-hidden relative"
        labelClassName="text-xs uppercase tracking-[0.3em] text-violet-400 font-medium"
        titleClassName="text-2xl md:text-3xl text-white font-semibold"
        descriptionClassName="text-slate-400 mt-1"
      />

      {/* Tabela de Eventos */}
      <div className="rounded-xl border border-border bg-card/80 p-5">
        {error && (
          <div className="mb-4 rounded-lg bg-red-900/20 border border-red-700 p-4 text-red-200">
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-400">Carregando eventos...</p>
          </div>
        ) : (
          <CrudTable
            data={data}
            fields={fields}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreate={handleCreate}
            onAction={handleAction}
            getItemKey={resolveEventKey}
            entityLabel="evento"
          />
        )}
      </div>
    </section>
  );
}