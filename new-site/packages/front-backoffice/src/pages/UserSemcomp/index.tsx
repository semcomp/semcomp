import { CrudTable } from "@/components/CrudTable";
import type { CrudItemType } from "@/types/CrudItem";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BannerCard } from "@/components/BannerCard";
import { fields } from "@/data/userSemcompCrudField";
import { Tabs } from "@/constants/Tabs";
import { userSemcompAPI } from "@/api/users";
import type { SemcompUserType } from "@/types/SemcompUserType";

export default function UsersCRUD() {
  const navigate = useNavigate();
  const [data, setData] = useState<SemcompUserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar usuários ao montar o componente
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userSemcompAPI.getAll();
      setData(response.users || []);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
      setError("Erro ao carregar usuários");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (item: CrudItemType) => {
    try {
      const typedItem = item as SemcompUserType;
      await userSemcompAPI.update(typedItem.id, {
        name: typedItem.name,
        email: typedItem.email,
        ...(typedItem.password && { password: typedItem.password }),
        presence_rate: typedItem.presence_rate,
      });

      // Atualizar estado local
      setData(prev => prev.map(i => i.id === item.id ? typedItem : i));
    } catch (err) {
      console.error("Erro ao editar usuário:", err);
      setError("Erro ao editar usuário");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await userSemcompAPI.delete(id);
      setData(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error("Erro ao deletar usuário:", err);
      setError("Erro ao deletar usuário");
    }
  };

  const handleCreate = async (item: CrudItemType) => {
    try {
      // A API não tem rota de criar usuário regular, apenas de registrar
      // Mostrar erro ao usuário
      setError("Usuários devem ser registrados pelo portal de registro");
    } catch (err) {
      console.error("Erro ao criar usuário:", err);
      setError("Erro ao criar usuário");
    }
  };


  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6 overflow-x-auto scrollbar-hide">
      {/* Header card com situando a página */}
      <BannerCard
        icon={Tabs.find(tab => tab.key === "users-semcomp")?.icon}
        iconClassName="text-violet-400"
        label="Usuários"
        title="Controle dos Usuários da Semcomp"
        description="Busque participantes, acesse e edite informações, mantenha controle sobre os usuários inscritos para a Semana da Computação."
        onBack={() => navigate('/home')}
        cardClassName="border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-violet-950/30 overflow-hidden relative"
        labelClassName="text-xs uppercase tracking-[0.3em] text-violet-400 font-medium"
        titleClassName="text-2xl md:text-3xl text-white font-semibold"
        descriptionClassName="text-slate-400 mt-1"
      />

      {/* Tabela com os usuários */}
      <div className="rounded-xl border border-border bg-card/80 p-5">
        {error && (
          <div className="mb-4 rounded-lg bg-red-900/20 border border-red-700 p-4 text-red-200">
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-400">Carregando usuários...</p>
          </div>
        ) : (
          <CrudTable
            data={data}
            fields={fields}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreate={handleCreate}
            entityLabel="usuário"
          />
        )}
      </div>
    </section>
  );
}