import { CrudTable } from "@/components/CrudTable";
import type { CrudItemType } from "@/types/CrudItem";
import type { CrudQueryParams } from "@/components/CrudTable";
import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs } from "@/constants/Tabs";
import { fields } from "@/data/riddlesCrudField";
import { BannerCard } from "@/components/BannerCard";
import { Button } from "@/components/ui/button";
import { Upload, Eye } from "lucide-react";
import type { RiddleType } from "@/types/RiddleType";
import { riddlesAPI } from "@/api/riddles";
import { useNotification } from "@/contexts/NotificationContext";
import { useHasPermission } from "@/contexts/AuthContext";

export default function Riddles() {
  const canWrite = useHasPermission("Riddles", "RW");
  const navigate = useNavigate();
  const [data, setData] = useState<RiddleType[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastQueryRef = useRef<CrudQueryParams | undefined>(undefined);

  const fetchRiddles = useCallback(async (params?: CrudQueryParams) => {
    try {
      setLoading(true);
      setError(null);
      lastQueryRef.current = params;

      const response = await riddlesAPI.getAll(
        params?.page ?? 1,
        params?.pageSize ?? 10,
        params?.sortField ?? "id",
        params?.sortOrder ?? "asc",
        params?.filterField && params?.filterValue ? params.filterField : undefined,
        params?.filterValue || undefined,
      );
      setData(response.riddles || []);
      setTotalRecords(response.filtered_records ?? response.total_records ?? 0);
    } catch (err) {
      console.error("Erro ao buscar riddles:", err);
      setError("Erro ao carregar riddles");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = useCallback((params: CrudQueryParams) => {
    fetchRiddles(params);
  }, [fetchRiddles]);

  const resolveRiddleKey = (riddle: CrudItemType) => {
    return String((riddle as RiddleType).riddleId);
  };

  const handleEdit = async (item: CrudItemType, itemKey: string) => {
    try {
      const typedItem = item as RiddleType;
      const original = data.find((r) => resolveRiddleKey(r) === itemKey);
      if (!original) return;

      const updated = await riddlesAPI.update(original.riddleId, typedItem);

      setData((prev) =>
        prev.map((riddle) => (resolveRiddleKey(riddle) === itemKey ? updated : riddle))
      );
      showNotification("Riddle editado com sucesso", "success");
    } catch (err) {
      console.error("Erro ao editar riddle:", err);
      setError("Erro ao editar riddle");
    }
  };

  // Switch dedicado de "Ativo" na tabela: efeito imediato, com confirmação
  // (mesmo padrão de window.confirm usado no upload de CSV) só ao desativar
  // (true -> false). Reativar (false -> true) não precisa de confirmação.
  // Se o usuário cancelar, `data` não é tocado, então o Switch simplesmente
  // permanece no estado atual (controlado por `data`), sem chamar a API.
  const handleToggleActive = async (item: CrudItemType, field: string, checked: boolean) => {
    if (field !== "isActive") return;
    const riddle = item as RiddleType;

    if (!checked) {
      const confirmed = window.confirm(
        `Tem certeza que deseja desativar o riddle "${riddle.hint1}"? Ele deixará de aparecer para os participantes. Você pode reativá-lo depois.`
      );
      if (!confirmed) return;
    }

    try {
      const updated = await riddlesAPI.update(riddle.riddleId, { ...riddle, isActive: checked });
      setData((prev) =>
        prev.map((r) => (resolveRiddleKey(r) === resolveRiddleKey(riddle) ? updated : r))
      );
      showNotification(checked ? "Riddle reativado com sucesso" : "Riddle desativado com sucesso", "success");
    } catch (err: any) {
      console.error("Erro ao atualizar riddle:", err);
      showNotification(err.response?.data?.message || "Erro ao atualizar riddle", "error");
    }
  };

  const handleCreate = async (item: CrudItemType) => {
    try {
      const typedItem = item as RiddleType;
      const createdRiddle = await riddlesAPI.create(typedItem);
      setData((prev) => [...prev, createdRiddle]);
      setTotalRecords((prev) => prev + 1);
      showNotification("Riddle criado com sucesso", "success");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Erro ao criar riddle");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const confirmed = window.confirm(
      "Importar este CSV vai APAGAR PERMANENTEMENTE todos os riddles atuais e substituí-los pelos do arquivo. Esta ação não pode ser desfeita. Deseja continuar?"
    );
    if (!confirmed) return;

    try {
      setUploading(true);
      await riddlesAPI.uploadCsv(file);
      showNotification("Riddles importados com sucesso", "success");
      await fetchRiddles(lastQueryRef.current);
    } catch (err: any) {
      console.error("Erro ao importar CSV:", err);
      showNotification(err.response?.data?.message || "Erro ao importar CSV", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6">
      <BannerCard
        icon={Tabs.find((tab) => tab.key === "riddles")?.icon}
        iconClassName="text-violet-400"
        label="Riddles"
        title="Gerenciamento de Riddles"
        description="Cadastre, busque, edite e desative os enigmas do jogo de sequência."
        onBack={() => navigate("/home")}
        cardClassName="border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-violet-950/30 overflow-hidden relative"
        labelClassName="text-xs uppercase tracking-[0.3em] text-violet-400 font-medium"
        titleClassName="text-2xl md:text-3xl text-white font-semibold"
        descriptionClassName="text-slate-400 mt-1"
      />

      <div className="rounded-xl border border-border bg-card/80 p-5 space-y-4">
        {error && (
          <div className="mb-4 rounded-lg bg-red-900/20 border border-red-700 p-4 text-red-200">
            {error}
          </div>
        )}

        {canWrite && (
          <div className="flex items-center justify-end">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              hidden
              onChange={handleFileSelected}
            />
            <Button
              variant="outline"
              onClick={handleUploadClick}
              disabled={uploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? "Importando..." : "Importar CSV (substitui tudo)"}
            </Button>
          </div>
        )}

        {loading && data.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-400">Carregando riddles...</p>
          </div>
        )}
        <CrudTable
          data={data}
          fields={fields}
          onEdit={handleEdit}
          onCreate={handleCreate}
          onToggleField={handleToggleActive}
          editIcon={<Eye className="w-3.5 h-3.5" />}
          getItemKey={resolveRiddleKey}
          entityLabel="riddle"
          totalRecords={totalRecords}
          onQueryChange={handleQueryChange}
          canWrite={canWrite}
        />
      </div>
    </section>
  );
}
