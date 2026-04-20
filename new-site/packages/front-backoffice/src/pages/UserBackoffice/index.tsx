import { CrudTable } from "@/components/CrudTable";
import type { CrudItemType } from "@/types/CrudItem";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BannerCard } from "@/components/BannerCard";
import { UserCog } from "lucide-react";
import { sampleBackofficeUsers } from "@/mock/user-backoffice";
import { fields } from "@/data/userBackofficeCrudField";
import { Tabs } from "@/constants/Tabs";

export default function BackofficeUsersCRUD() {
  const navigate = useNavigate();
  const [data, setData] = useState<CrudItemType[]>(sampleBackofficeUsers);

  // TODO: Integrar com backend para persistência real dos dados no BD
  const handleEdit = (item: CrudItemType) => {
    setData(prev => prev.map(i => i.id === item.id ? item : i));
  };
  const handleDelete = (id: string) => setData(prev => prev.filter(i => i.id !== id));
  const handleCreate = (item: CrudItemType) => setData(prev => [...prev, { ...item, id: String(Date.now()) }]);


  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6 overflow-x-auto scrollbar-hide">
      {/* Header card situando a página */}
      <BannerCard
        icon={Tabs.find(tab => tab.key === "backoffice-users")?.icon}
        iconClassName="text-violet-400"
        label="Usuários Backoffice"
        title="Gestão de Usuários para Acesso ao Backoffice da Semcomp"
        description="Cadastre e busque usuários do Backoffice, acesse e edite informações, mantenha controle sobre quem possui acesso ao painel Backoffice da Semana da Computação."
        onBack={() => navigate('/home')}
        cardClassName="border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-violet-950/30 overflow-hidden relative"
        labelClassName="text-xs uppercase tracking-[0.3em] text-violet-400 font-medium"
        titleClassName="text-2xl md:text-3xl text-white font-semibold"
        descriptionClassName="text-slate-400 mt-1"
      />

      {/* Tabela com os usuários do Backoffice */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
        <CrudTable
          data={data}
          fields={fields}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          entityLabel="usuário do backoffice"
        />
      </div>
    </section>
  );
}