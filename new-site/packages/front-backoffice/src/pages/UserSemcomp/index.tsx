import { CrudTable } from "@/components/CrudTable";
import type { CrudQueryParams } from "@/components/CrudTable";
import type { CrudItemType } from "@/types/CrudItem";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BannerCard } from "@/components/BannerCard";
import { fields } from "@/data/userSemcompCrudField";
import { Tabs } from "@/constants/Tabs";
import { userSemcompAPI } from "@/api/users";
import type { SemcompUserType } from "@/types/SemcompUserType";
import { useNotification } from "@/contexts/NotificationContext";
import { useHasPermission } from "@/contexts/AuthContext";

export default function UsersCRUD() {
  const canWrite = useHasPermission("Usuários Semcomp", "RW");
  const navigate = useNavigate();
  const [data, setData] = useState<SemcompUserType[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const fetchUsers = useCallback(async (params?: CrudQueryParams) => {
    try {
      setLoading(true);
      setError(null);

      if (params?.filterField === "password" || params?.sortField === "password") {
        showNotification(`Campo de operação inválido: ${params.filterField}`, "error");
        return;
      }

      const response = await userSemcompAPI.getAll(
        params?.page ?? 1,
        params?.pageSize ?? 10,
        params?.sortField ?? "name",
        params?.sortOrder ?? "asc",
        params?.filterField && params?.filterValue ? params.filterField : undefined,
        params?.filterValue || undefined
      );
      setData(response.users || []);
      setTotalRecords(response.filtered_records ?? response.total_records ?? 0);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
      setError("Erro ao carregar usuários");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleQueryChange = (params: CrudQueryParams) => {
    fetchUsers(params);
  };

  const handleEdit = async (item: CrudItemType) => {
    try {
      const typedItem = item as SemcompUserType;
      const presenceRate = Number(typedItem.presence_rate);
      if (Number.isNaN(presenceRate)) {
        setError("Taxa de presença inválida");
        return;
      }

      if (typedItem.password && typedItem.password.length < 8) {
        setError("A senha deve conter no mínimo 8 caracteres");
        return;
      }

      if (typedItem.age && Number(typedItem.age) <= 0) {
        setError("Informe uma idade válida");
        return;
      }

      await userSemcompAPI.update(typedItem.user_number, {
        name: typedItem.name,
        email: typedItem.email,
        ...(typedItem.password && { password: typedItem.password }),
        presence_rate: presenceRate,
        age: typedItem.age ? Number(typedItem.age) : undefined,
        gender: typedItem.gender,
        city: typedItem.city,
        education: typedItem.education,
        hasPapfe: typedItem.hasPapfe,
        disabilities: Array.isArray(typedItem.disabilities) ? typedItem.disabilities : [],
        profession: typedItem.profession,
        linkedin: typedItem.linkedin,
        telegram: typedItem.telegram,
        quer_cracha: typedItem.quer_cracha,
      });

      setData((prev) => prev.map((i) => (i.id === item.id ? typedItem : i)));
      showNotification("Usuário atualizado com sucesso!", "success");
    } catch (err) {
      console.error("Erro ao editar usuário:", err);
      setError("Erro ao editar usuário");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await userSemcompAPI.delete(id);
      setData((prev) => prev.filter((i) => i.id !== id));
      showNotification("Usuário removido com sucesso!", "success");
    } catch (err) {
      console.error("Erro ao deletar usuário:", err);
      setError("Erro ao deletar usuário");
    }
  };

  const handleCreate = async (item: CrudItemType) => {
    try {
      const typedItem = item as SemcompUserType;
      if (!typedItem.password || typedItem.password.length < 8) {
        setError("A senha deve conter no mínimo 8 caracteres");
        return;
      }

      if (typedItem.age && Number(typedItem.age) <= 0) {
        setError("Informe uma idade válida");
        return;
      }

      const newUser = await userSemcompAPI.create({
        name: typedItem.name,
        email: typedItem.email,
        password: typedItem.password,
        age: typedItem.age ? Number(typedItem.age) : undefined,
        gender: typedItem.gender,
        city: typedItem.city,
        education: typedItem.education,
        hasPapfe: typedItem.hasPapfe ?? false,
        disabilities: Array.isArray(typedItem.disabilities) ? typedItem.disabilities : [],
        profession: typedItem.profession,
        linkedin: typedItem.linkedin,
        telegram: typedItem.telegram,
        quer_cracha: typedItem.quer_cracha ?? false,
        papfe_document: typedItem.papfe_document,
      });

      setData((prev) => [...prev, { ...newUser, password: "" }]);
      setTotalRecords((prev) => prev + 1);
      showNotification("Usuário criado com sucesso!", "success");
    } catch (err) {
      console.error("Erro ao criar usuário:", err);
      setError("Erro ao criar usuário");
    }
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6 overflow-x-auto scrollbar-hide">
      <BannerCard
        icon={Tabs.find((tab) => tab.key === "users-semcomp")?.icon}
        iconClassName="text-violet-400"
        label="Usuários"
        title="Controle dos Usuários da Semcomp"
        description="Busque participantes, acesse e edite informações, mantenha controle sobre os usuários inscritos para a Semana da Computação."
        onBack={() => navigate("/home")}
        cardClassName="border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-violet-950/30 overflow-hidden relative"
        labelClassName="text-xs uppercase tracking-[0.3em] text-violet-400 font-medium"
        titleClassName="text-2xl md:text-3xl text-white font-semibold"
        descriptionClassName="text-slate-400 mt-1"
      />

      <div className="rounded-xl border border-border bg-card/80 p-5">
        {error && (
          <div className="mb-4 rounded-lg bg-red-900/20 border border-red-700 p-4 text-red-200">
            {error}
          </div>
        )}
        {loading && data.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-400">Carregando usuários...</p>
          </div>
        )}
        <CrudTable
          data={data}
          fields={fields}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          entityLabel="usuário"
          serverSide
          totalRecords={totalRecords}
          onQueryChange={handleQueryChange}
          canWrite={canWrite}
        />
      </div>
    </section>
  );
}