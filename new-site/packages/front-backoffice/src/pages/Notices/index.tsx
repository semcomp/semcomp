import { CrudTable } from "@/components/CrudTable";
import type { CrudQueryParams } from "@/components/CrudTable";
import type { CrudItemType } from "@/types/CrudItem";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BannerCard } from "@/components/BannerCard";
import { fields } from "@/data/noticeCrudField";
import { Tabs } from "@/constants/Tabs";
import { noticesAPI } from "@/api/notices";
import type { NoticeType } from "@/types/NoticeType";
import { useNotification } from "@/contexts/NotificationContext";
import { useHasPermission } from "@/contexts/AuthContext";

export default function NoticesCRUD() {
  const canWrite = useHasPermission("Avisos", "RW");
  const navigate = useNavigate();
  const [data, setData] = useState<NoticeType[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const fetchNotices = useCallback(async (params?: CrudQueryParams) => {
    try {
      setLoading(true);
      setError(null);

      const response = await noticesAPI.getAll(
        params?.page ?? 1,
        params?.pageSize ?? 10,
        params?.sortField ?? "date_time",
        params?.sortOrder ?? "desc",
        params?.filterField && params?.filterValue
          ? params.filterField
          : undefined,
        params?.filterValue || undefined
      );

      setData(response.notices || []);
      setTotalRecords(response.filtered_records ?? response.total_records ?? 0);
    } catch (err) {
      console.error("Erro ao buscar avisos:", err);
      setError("Erro ao carregar avisos");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleQueryChange = (params: CrudQueryParams) => {
    fetchNotices(params);
  };

  const handleCreate = async (item: CrudItemType) => {
    try {
      const typedItem = item as NoticeType;

      if (!typedItem.title?.trim()) {
        setError("O título é obrigatório");
        return;
      }

      if (!typedItem.description?.trim()) {
        setError("A descrição é obrigatória");
        return;
      }

      if (!typedItem.dateTime) {
        setError("A data e hora são obrigatórias");
        return;
      }

      const newNotice = await noticesAPI.create({
        title: typedItem.title,
        description: typedItem.description,
        dateTime: typedItem.dateTime,
      });

      setData((prev) => [newNotice, ...prev]);
      setTotalRecords((prev) => prev + 1);
      showNotification("Aviso criado com sucesso!", "success");
    } catch (err) {
      console.error("Erro ao criar aviso:", err);
      setError("Erro ao criar aviso");
    }
  };

  const handleEdit = async (item: CrudItemType) => {
    try {
      const typedItem = item as NoticeType;

      if (!typedItem.id) {
        setError("ID do aviso é inválido");
        return;
      }

      if (!typedItem.title?.trim()) {
        setError("O título é obrigatório");
        return;
      }

      const formattedDate = typedItem.dateTime
        ? new Date(typedItem.dateTime).toISOString()
        : "";

      const updatedNotice = await noticesAPI.update(typedItem.id, {
        title: typedItem.title,
        description: typedItem.description,
        dateTime: formattedDate,
      });

      setData((prev) =>
        prev.map((i) => (i.id === item.id ? updatedNotice : i))
      );
      showNotification("Aviso atualizado com sucesso!", "success");
    } catch (err) {
      console.error("Erro ao editar aviso:", err);
      setError("Erro ao editar aviso");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await noticesAPI.delete(id);
      setData((prev) => prev.filter((i) => i.id !== id));
      setTotalRecords((prev) => prev - 1);
      showNotification("Aviso removido com sucesso!", "success");
    } catch (err) {
      console.error("Erro ao deletar aviso:", err);
      setError("Erro ao deletar aviso");
    }
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6 overflow-x-auto scrollbar-hide">
      <BannerCard
        icon={Tabs.find((tab) => tab.key === "notices")?.icon}
        iconClassName="text-violet-400"
        label="Mural"
        title="Mural de Avisos"
        description="Crie, edite e gerencie os avisos que serão exibidos no mural da plataforma."
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
            <p className="text-slate-400">Carregando avisos...</p>
          </div>
        )}
        <CrudTable
          data={data}
          fields={fields}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          entityLabel="aviso"
          totalRecords={totalRecords}
          onQueryChange={handleQueryChange}
          canWrite={canWrite}
        />
      </div>
    </section>
  );
}
