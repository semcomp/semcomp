import { CrudTable } from "@/components/CrudTable";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BannerCard } from "@/components/BannerCard";
import type { ParticipationType } from "@/types/ParticipationType";
import { sampleParticipations } from "@/mock/participation";
import { fields } from "@/data/participationCrudField";
import type { CrudItemType } from "@/types/CrudItem";
import { Tabs } from "@/constants/Tabs";


export default function ParticipationCRUD() {
  const navigate = useNavigate();
  const [data, setData] = useState<ParticipationType[]>(sampleParticipations);

  const handleEdit = (item: CrudItemType) => {
    const participation = item as ParticipationType;
    setData(prev => prev.map(i => i.nameEvent === participation.nameEvent && i.nameUser === participation.nameUser ? participation : i));
  };
  const handleDelete = (id: string) => setData(prev => prev.filter(i => i.id !== id));
  const handleCreate = (item: CrudItemType) => setData(prev => [...prev, { ...(item as ParticipationType) }]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6 overflow-x-auto scrollbar-hide">
      {/* Header card situando a página */}
      <BannerCard
        icon={Tabs.find(tab => tab.key === "participation")?.icon}
        iconClassName="text-violet-400"
        label="Participações"
        title="Gestão de Participações em Eventos da Semcomp"
        description="Cadastre e busque participações em eventos, acesse e edite informações, mantenha controle sobre as participações da Semana da Computação."
        onBack={() => navigate('/home')}
        cardClassName="border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-violet-950/30 overflow-hidden relative"
        labelClassName="text-xs uppercase tracking-[0.3em] text-violet-400 font-medium"
        titleClassName="text-2xl md:text-3xl text-white font-semibold"
        descriptionClassName="text-slate-400 mt-1"
      />

      {/* Tabela de participações */}
      <div className="rounded-xl border border-border bg-card/80 p-5">
        <CrudTable
          data={data}
          fields={fields}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          entityLabel="participação"
        />
      </div>
    </section>
  );
}