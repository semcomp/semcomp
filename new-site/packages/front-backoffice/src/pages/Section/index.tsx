import { useNavigate } from "react-router-dom";
import { CrudTable } from "@/components/CrudTable";
import type { CrudItemType } from "@/types/CrudItem";
import { useState, useEffect } from "react";
import { BannerCard } from "@/components/BannerCard";
import type { SectionType } from "@/types/SectionType";
import { sectionsAPI } from "@/api/sections";
import { useNotification } from "@/contexts/NotificationContext";
import { fields } from "@/data/sectionsCrudField";

export default function Sections() {
  const navigate = useNavigate();
  const [data, setData] = useState<SectionType[]>([]);
  const [, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  // Mostrar notificação de erro quando houver
  useEffect(() => {
    if (error !== null) {
      showNotification(error as string, "warning");
    }
  }, [error, showNotification]);

  // Buscar seções ao montar o componente
  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await sectionsAPI.getAll();
      setData(response.sections || []);
    } catch (err) {
      console.error("Erro ao buscar seções:", err);
      setError("Erro ao carregar seções");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (item: CrudItemType) => {
    try {
      const typedItem = item as SectionType;
      const newSection = await sectionsAPI.create({
        name: typedItem.name,
        description: typedItem.description,
      });
      setData((prev) => [...prev, newSection]);
      showNotification("Seção criada com sucesso!", "success");
    } catch (err: any) {
      console.error("Erro ao criar seção:", err);
      setError(err.response?.data?.message || "Erro ao criar seção");
    }
  };

  const handleEdit = async (item: CrudItemType, itemKey: string) => {
    try {
      const typedItem = item as SectionType;
      const originalSection = data.find((s) => s.name === itemKey);
      if (!originalSection) return;

      await sectionsAPI.update(itemKey, typedItem);
      setData((prev) =>
        prev.map((section) =>
          section.name === itemKey ? typedItem : section
        )
      );
      showNotification("Seção atualizada com sucesso!", "success");
    } catch (err: any) {
      console.error("Erro ao editar seção:", err);
      setError(err.response?.data?.message || "Erro ao editar seção");
    }
  };

  const handleDelete = async (itemKey: string) => {
    try {
      await sectionsAPI.delete(itemKey);
      setData((prev) => prev.filter((section) => section.name !== itemKey));
      showNotification("Seção deletada com sucesso!", "success");
    } catch (err: any) {
      console.error("Erro ao deletar seção:", err);
      setError(err.response?.data?.message || "Erro ao deletar seção");
    }
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8">
      <BannerCard
        label="Seções"
        title="Gerenciar Seções"
        description="Crie, edite e delete as seções do backoffice"
        onBack={() => navigate("/home")}
      />

      <CrudTable
        data={data}
        fields={fields}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        getItemKey={(item) => (item as SectionType).name}
        entityLabel="seção"
      />
    </section>
  );
}