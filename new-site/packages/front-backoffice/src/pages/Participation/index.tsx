import { CrudTable } from "@/components/CrudTable";
import type { CrudQueryParams } from "@/components/CrudTable";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BannerCard } from "@/components/BannerCard";
import type { ParticipationType } from "@/types/ParticipationType";
import { fields } from "@/data/participationCrudField";
import type { CrudItemType } from "@/types/CrudItem";
import { Tabs } from "@/constants/Tabs";
import { presenceAPI } from "@/api/presence.ts"
import { useNotification } from "@/contexts/NotificationContext";


export default function ParticipationCRUD() {
  const navigate = useNavigate();
  const [data, setData] = useState<ParticipationType[]>([]);
<<<<<<< HEAD
  const [totalRecords, setTotalRecords] = useState(0);
  const [, setLoading] = useState(true);
=======
  const [loading, setLoading] = useState(true);
>>>>>>> 8efb3b65dd044e2d92bf5b036cc457accbe8aa28
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (error !== null) {
      // Verifica se o erro realmente existe para gerar a notificação
      showNotification(error as string, "warning");
    }
  }, [error]);

<<<<<<< HEAD
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
=======
  const resolvePresenceKey = (item: CrudItemType) => {
    const presence = item as ParticipationType;

    return `${presence.userNumber}__${presence.nameEvent}__${presence.dateEvent}`;
>>>>>>> 8efb3b65dd044e2d92bf5b036cc457accbe8aa28
  };

  const handleEdit = async (
    item: CrudItemType,
    itemKey: string
  ) => {
    try {
      const typedItem = item as ParticipationType;

      const originalPresence = data.find(
        (p) => resolvePresenceKey(p) === itemKey
      );

      if (!originalPresence) return;

      await presenceAPI.update(
        originalPresence.userNumber,
        originalPresence.nameEvent,
        originalPresence.dateEvent,
        typedItem
      );

      setData((prev) =>
        prev.map((presence) =>
          resolvePresenceKey(presence) === itemKey
            ? typedItem
            : presence
        )
      );

      showNotification("Presença editada realizada com sucesso", "success");
    } catch (err) {
      console.error("Erro ao editar presença:", err);
      setError("Erro ao editar presença");
    }
  };
  
  const handleDelete = async (itemKey: string) => {
    try {
      const presence = data.find(
        (p) => resolvePresenceKey(p) === itemKey
      );

      if (!presence) return;

      await presenceAPI.delete(
        presence.userNumber,
        presence.nameEvent,
        presence.dateEvent
      );

      setData((prev) =>
        prev.filter(
          (presence) =>
            resolvePresenceKey(presence) !== itemKey
        )
      );
      
      showNotification("Presença deletada com sucesso", "success");
    } catch (err) {
      console.error("Erro ao deletar presença:", err);
      setError("Erro ao deletar presença");
    }
  };

  const handleCreate = async (item: CrudItemType) => {
    try {
      const typedItem = item as ParticipationType;
<<<<<<< HEAD
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
=======
>>>>>>> 8efb3b65dd044e2d92bf5b036cc457accbe8aa28

      const createdPresence = await presenceAPI.create(
        typedItem
      );

<<<<<<< HEAD
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
=======
      setData((prev) => [...prev, createdPresence]);

      showNotification("Presença criada com sucesso", "success");
    } catch (err) {
      console.error("Erro ao criar presença:", err);
      setError("Erro ao criar presença");
>>>>>>> 8efb3b65dd044e2d92bf5b036cc457accbe8aa28
    }
  };

  // Buscar presenças ao montar o componente
    useEffect(() => {
      fetchPresences();
    }, []);

<<<<<<< HEAD
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
=======
  const fetchPresences = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await presenceAPI.getAll();

      setData(response.presences || []);
    } catch (err) {
      console.error("Erro ao buscar presenças:", err);
      setError("Erro ao carregar presenças");
      setData([]);
    } finally {
      setLoading(false);
>>>>>>> 8efb3b65dd044e2d92bf5b036cc457accbe8aa28
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
<<<<<<< HEAD
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
=======
        {error && (
          <div className="mb-4 rounded-lg bg-red-900/20 border border-red-700 p-4 text-red-200">
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-400">Carregando presenças...</p>
          </div>
        ) : (
          <CrudTable
            data={data}
            fields={fields}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreate={handleCreate}
            getItemKey={resolvePresenceKey}
            entityLabel="participação"
          />
        )}
>>>>>>> 8efb3b65dd044e2d92bf5b036cc457accbe8aa28
      </div>
    </section>
  );
}