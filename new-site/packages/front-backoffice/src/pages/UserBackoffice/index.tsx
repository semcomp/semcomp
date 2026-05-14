import { CrudTable } from "@/components/CrudTable";
import type { CrudItemType } from "@/types/CrudItem";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BannerCard } from "@/components/BannerCard";
import { fields } from "@/data/userBackofficeCrudField";
import { Tabs } from "@/constants/Tabs";
import { userBackofficeAPI } from "@/api/userBackoffice";
import type { BackofficeUserType } from "@/types/BackofficeUserType";
import { DEBUGMODE } from "@/constants/DebugMode";
import { sampleBackofficeUsers } from "@/mock/user-backoffice";

export default function BackofficeUsersCRUD() {
  const navigate = useNavigate();
  const [data, setData] = useState<BackofficeUserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar usuários ao montar o componente
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    if (DEBUGMODE) { // Debug local
      setData(sampleBackofficeUsers);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await userBackofficeAPI.getAll();
      setData(response.users || []);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
      setError("Erro ao carregar usuários do backoffice");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (item: CrudItemType) => {
    try {
      const typedItem = item as BackofficeUserType;
      // Encontrar o usuário original para ter o email anterior
      const originalUser = data.find(u => u.id === item.id);
      if (!originalUser) return;

      if (!typedItem.password || typedItem.password.length < 8) {
        setError("A senha deve conter no mínimo 8 caracteres");
        return;
      }

      await userBackofficeAPI.update(originalUser.email, {
        email: typedItem.email,
        password: typedItem.password,
      });

      // Atualizar estado local
      setData(prev => prev.map(i => i.id === item.id ? { ...typedItem, id: typedItem.email } : i));
    } catch (err) {
      console.error("Erro ao editar usuário:", err);
      setError("Erro ao editar usuário");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const user = data.find(u => u.id === id);
      if (!user) return;

      await userBackofficeAPI.delete(user.email);
      setData(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error("Erro ao deletar usuário:", err);
      setError("Erro ao deletar usuário");
    }
  };

  const handleCreate = async (item: CrudItemType) => {
    try {
      const typedItem = item as BackofficeUserType;
      if (!typedItem.password || typedItem.password.length < 8) {
        setError("A senha deve conter no mínimo 8 caracteres");
        return;
      }

      const newUser = await userBackofficeAPI.create({
        email: typedItem.email,
        password: typedItem.password,
      });

      // Atualizar estado local
      setData(prev => [...prev, { ...typedItem, id: newUser.id || typedItem.email }]);
    } catch (err) {
      console.error("Erro ao criar usuário:", err);
      setError("Erro ao criar usuário");
    }
  };


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
        {error && (
          <div className="mb-4 rounded-lg bg-red-900/20 border border-red-700 p-4 text-red-200">
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-400">Carregando usuários do backoffice...</p>
          </div>
        ) : (
          <CrudTable
            data={data}
            fields={fields}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreate={handleCreate}
            entityLabel="usuário do backoffice"
          />
        )}
      </div>
    </section>
  );
}