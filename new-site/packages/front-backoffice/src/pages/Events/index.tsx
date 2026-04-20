import { CrudTable } from "@/components/CrudTable";
import type { CrudItemType } from "@/types/CrudItem";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs } from "@/constants/Tabs";
import { sampleEvents } from "@/mock/events";
import { fields } from "@/data/eventsCrudField";
import { BannerCard } from "@/components/BannerCard";
import type { EventType } from "@/types/EventType";

export default function Events() {
  const navigate = useNavigate();
  const [data, setData] = useState<EventType[]>(sampleEvents);

  const handleEdit = (item: CrudItemType) => {
    setData(prev => prev.map(i => i.id === item.id ? ({ ...i, ...item } as EventType) : i));
  };
  const handleDelete = (id: string) => setData(data => data.filter(i => i.id !== id));
  const handleCreate = (item: CrudItemType) => setData(data => [...data, { ...item, id: String(Date.now()) } as EventType]);
  const handleAction = (item: CrudItemType) => {
    const event = item as EventType;
    navigate(
      `/events/${encodeURIComponent(event.nameEvent)}/${encodeURIComponent(event.datetime)}/qrcode-reader`,
      {
      state: {
        eventName: event.nameEvent,
        datetime: event.datetime,
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
        <CrudTable
          data={data}
          fields={fields}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          onAction={handleAction}
          entityLabel="evento"
        />
      </div>
    </section>
  );
}