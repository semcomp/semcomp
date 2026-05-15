import { CrudTable } from "@/components/CrudTable";
import type { CrudQueryParams } from "@/components/CrudTable";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BannerCard } from "@/components/BannerCard";
import type { ParticipationType } from "@/types/ParticipationType";
import { fields } from "@/data/participationCrudField";
import type { CrudItemType } from "@/types/CrudItem";
import { Tabs } from "@/constants/Tabs";
import { participationsAPI } from "@/api/participations";
import { useNotification } from "@/contexts/NotificationContext";

export default function ParticipationCRUD() {
  const navigate = useNavigate();
  const [data, setData] = useState<ParticipationType[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (error !== null) {
      showNotification(error as string, "warning");
    }
  }, [error, showNotification]);

  const fetchParticipations = useCallback(async (params?: CrudQueryParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await participationsAPI.getAll(
        params?.page ?? 1,
        params?.pageSize ?? 50,
        params?.sortField ?? "event_init_date",
        params?.sortOrder ?? "asc",
        params?.filterField && params?.filterValue ? params.filterField : undefined,
        params?.filterValue || undefined,
      );
      setData(response.presences || []);
      setTotalRecords(response.filtered_records ?? response.total_records ?? 0);
    } catch (err) {
      console.error("Erro ao buscar participações:", err);
      setError("Erro ao carregar participações");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParticipations();
  }, [fetchParticipations]);

  const handleQueryChange = (params: CrudQueryParams) => {
    fetchParticipations(params);
  };

  const resolveParticipationKey = (participation: CrudItemType) => {
    const typed = participation as ParticipationType;
    return `${typed.nameUser}__${typed.nameEvent}__${typed.dateEvent}`;
  };

  const handleCreate = async (item: CrudItemType) => {
    try {
      const typedItem = item as ParticipationType;
      const newParticipation = await participationsAPI.create({
        nameUser: typedItem.nameUser,
        nameEvent: typedItem.nameEvent,
        dateEvent: typedItem.dateEvent,
        userBackoffice: typedItem.userBackoffice,
      });
      setData((prev) => [...prev, newParticipation]);
      setTotalRecords(prev => prev + 1);
      showNotification("Participação criada com sucesso!", "success");
    } catch (err: any) {
      console.error("Erro ao criar participação:", err);
      const errorMessage =
        err.message ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Erro ao criar participação";
      setError(errorMessage);
      showNotification(errorMessage, "error");
    }
  };

  const handleEdit = async (item: CrudItemType, itemKey: string) => {
    try {
      const typedItem = item as ParticipationType;
      const originalParticipation = data.find((p) => resolveParticipationKey(p) === itemKey);
      if (!originalParticipation) {
        throw new Error("Participação original não encontrada");
      }

      await participationsAPI.update(
        originalParticipation.nameUser,
        originalParticipation.nameEvent,
        originalParticipation.dateEvent,
        typedItem
      );

      await fetchParticipations();
      showNotification("Participação atualizada com sucesso!", "success");
    } catch (err: any) {
      console.error("Erro ao editar participação:", err);
      const errorMessage =
        err.message ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Erro ao editar participação";
      setError(errorMessage);
      showNotification(errorMessage, "error");
    }
  };

  const handleDelete = async (itemKey: string) => {
    try {
      const participation = data.find((p) => resolveParticipationKey(p) === itemKey);
      if (!participation) return;

      await participationsAPI.delete(
        participation.nameUser,
        participation.nameEvent,
        participation.dateEvent
      );
      setData((prev) => prev.filter((p) => resolveParticipationKey(p) !== itemKey));
      setTotalRecords(prev => prev - 1);
      showNotification("Participação deletada com sucesso!", "success");
    } catch (err: any) {
      console.error("Erro ao deletar participação:", err);
      const errorMessage =
        err.message ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Erro ao deletar participação";
      setError(errorMessage);
      showNotification(errorMessage, "error");
    }
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6 overflow-x-auto scrollbar-hide">
      <BannerCard
        icon={Tabs.find((tab) => tab.key === "participation")?.icon}
        iconClassName="text-violet-400"
        label="Participações"
        title="Gestão de Participações em Eventos da Semcomp"
        description="Cadastre e busque participações em eventos, acesse e edite informações, mantenha controle sobre as participações da Semana da Computação."
        onBack={() => navigate("/home")}
        cardClassName="border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-violet-950/30 overflow-hidden relative"
        labelClassName="text-xs uppercase tracking-[0.3em] text-violet-400 font-medium"
        titleClassName="text-2xl md:text-3xl text-white font-semibold"
        descriptionClassName="text-slate-400 mt-1"
      />

      <div className="rounded-xl border border-border bg-card/80 p-5">
        <CrudTable
          data={data}
          fields={fields}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          getItemKey={resolveParticipationKey}
          entityLabel="participação"
          serverSide
          totalRecords={totalRecords}
          onQueryChange={handleQueryChange}
        />
      </div>
    </section>
  );
}