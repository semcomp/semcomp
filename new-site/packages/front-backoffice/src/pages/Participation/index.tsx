import { CrudTable } from "@/components/CrudTable";
import type { CrudQueryParams } from "@/types/CrudItem";
import type { CrudItemType } from "@/types/CrudItem";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BannerCard } from "@/components/BannerCard";
import type { ParticipationType } from "@/types/ParticipationType";
import { fields } from "@/data/participationCrudField";
import { Tabs } from "@/constants/Tabs";
import { participationAPI } from "@/api/participation";
import { useNotification } from "@/contexts/NotificationContext";

export default function ParticipationCRUD() {
  const navigate = useNavigate();
  const [data, setData] = useState<ParticipationType[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  // Helper para gerar a chave única da linha (identificador composto)
  const resolvePresenceKey = useCallback((item: CrudItemType) => {
    const presence = item as ParticipationType;
    // Usando userNumber conforme solicitado
    return `${presence.userNumber}__${presence.nameEvent}__${presence.dateEvent}`;
  }, []);

  // Busca de dados (Server-side)
  const fetchPresences = useCallback(async (params?: CrudQueryParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await participationAPI.getAll(
        params?.page ?? 1,
        params?.pageSize ?? 10,
        params?.sortField ?? "event_init_date",
        params?.sortOrder ?? "asc",
        params?.filterField && params?.filterValue ? params.filterField : undefined,
        params?.filterValue || undefined
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

  // Efeito inicial para carregar dados
  useEffect(() => {
    fetchPresences();
  }, [fetchPresences]);


  const handleQueryChange = (params: CrudQueryParams) => {
    fetchPresences(params);
  };

  const handleCreate = async (item: CrudItemType) => {
    try {
      const typedItem = item as ParticipationType;
      const createdPresence = await participationAPI.create(typedItem);

      setData((prev) => [...prev, createdPresence]);
      setTotalRecords((prev) => prev + 1);
      showNotification("Presença criada com sucesso", "success");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Erro ao criar presença";
      showNotification(msg, "error");
    }
  };

  const handleEdit = async (item: CrudItemType, itemKey: string) => {
    try {
      const typedItem = item as ParticipationType;
      const originalPresence = data.find((p) => resolvePresenceKey(p) === itemKey);

      if (!originalPresence) return;

      await participationAPI.update(
        originalPresence.userNumber, // Identificador original
        originalPresence.nameEvent,
        originalPresence.dateEvent,
        typedItem
      );

      setData((prev) =>
        prev.map((p) => (resolvePresenceKey(p) === itemKey ? typedItem : p))
      );

      showNotification("Presença editada com sucesso", "success");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Erro ao editar presença";
      showNotification(msg, "error");
    }
  };

  const handleDelete = async (itemKey: string) => {
    try {
      const presence = data.find((p) => resolvePresenceKey(p) === itemKey);
      if (!presence) return;

      await participationAPI.delete(
        presence.userNumber, 
        presence.nameEvent,
        presence.dateEvent
      );

      setData((prev) => prev.filter((p) => resolvePresenceKey(p) !== itemKey));
      setTotalRecords((prev) => prev - 1);
      showNotification("Presença deletada com sucesso", "success");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Erro ao deletar presença";
      showNotification(msg, "error");
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
          getItemKey={resolvePresenceKey}
          entityLabel="participação"
          serverSide
          totalRecords={totalRecords}
          onQueryChange={handleQueryChange}
        />
      </div>
    </section>
  );
}