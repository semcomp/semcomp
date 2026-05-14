import { CrudTable } from "@/components/CrudTable";
import { useState, useEffect } from "react";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (error !== null) {
      // Verifica se o erro realmente existe para gerar a notificação
      showNotification(error as string, "warning");
    }
  }, [error]);

  const resolvePresenceKey = (item: CrudItemType) => {
    const presence = item as ParticipationType;

    return `${presence.userNumber}__${presence.nameEvent}__${presence.dateEvent}`;
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

      const createdPresence = await presenceAPI.create(
        typedItem
      );

      setData((prev) => [...prev, createdPresence]);

      showNotification("Presença criada com sucesso", "success");
    } catch (err) {
      console.error("Erro ao criar presença:", err);
      setError("Erro ao criar presença");
    }
  };

  // Buscar presenças ao montar o componente
    useEffect(() => {
      fetchPresences();
    }, []);

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
    }
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6 overflow-x-auto scrollbar-hide">
      {/* Header card situando a página */}
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

      {/* Tabela de participações */}
      <div className="rounded-xl border border-border bg-card/80 p-5">
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
      </div>
    </section>
  );
}