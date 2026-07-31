import { CrudTable } from "@/components/CrudTable";
import type { CrudItemType } from "@/types/CrudItem";
import type { CrudQueryParams } from "@/components/CrudTable";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs } from "@/constants/Tabs";
import { API_FIELD_MAP, fields } from "@/data/productsCrudField";
import { BannerCard } from "@/components/BannerCard";
import type { ProductType } from "@/types/ProductType";
import { productsAPI } from "@/api/products";
import { useNotification } from "@/contexts/NotificationContext";
import { useHasPermission } from "@/contexts/AuthContext";

export default function ProductsCRUD() {
  const canWrite = useHasPermission("Produtos", "RW");
  const navigate = useNavigate();
  const [data, setData] = useState<ProductType[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const fetchProducts = useCallback(async (params?: CrudQueryParams) => {
    try {
      setLoading(true);
      setError(null);

      const sortFieldApi = API_FIELD_MAP[params?.sortField ?? ""] || params?.sortField || "id";
      const filterFieldApi = params?.filterField ? (API_FIELD_MAP[params.filterField] || params.filterField) : undefined;

      const response = await productsAPI.getAll(
        params?.page ?? 1,
        params?.pageSize ?? 10,
        sortFieldApi,
        params?.sortOrder ?? "asc",
        filterFieldApi,
        params?.filterValue || undefined,
      );

      setData(response.products || []);
      setTotalRecords(response.filtered_records ?? response.total_records ?? 0);
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
      setError("Erro ao carregar produtos");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = useCallback((params: CrudQueryParams) => {
    fetchProducts(params);
  }, [fetchProducts]);

  const resolveProductKey = useCallback((item: CrudItemType) => {
    const product = item as ProductType;
    return String(product.productId);
  }, []);

  const handleCreate = async (item: CrudItemType) => {
    try {
      const typedItem = item as ProductType;
      const createdProduct = await productsAPI.create(typedItem);
      setData((prev) => [...prev, createdProduct]);
      setTotalRecords((prev) => prev + 1);
      showNotification("Produto criado com sucesso", "success");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Erro ao criar produto";
      showNotification(msg, "error");
    }
  };

  const handleEdit = async (item: CrudItemType, itemKey: string) => {
    try {
      const typedItem = item as ProductType;
      const originalProduct = data.find((p) => resolveProductKey(p) === itemKey);
      if (!originalProduct) return;

      const updated = await productsAPI.update(originalProduct.productId, typedItem);
      setData((prev) =>
        prev.map((p) => (resolveProductKey(p) === itemKey ? updated : p))
      );
      showNotification("Produto editado com sucesso", "success");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Erro ao editar produto";
      showNotification(msg, "error");
    }
  };

  const handleDelete = async (itemKey: string) => {
    try {
      const product = data.find((p) => resolveProductKey(p) === itemKey);
      if (!product) return;

      await productsAPI.delete(product.productId);
      setData((prev) => prev.filter((p) => resolveProductKey(p) !== itemKey));
      setTotalRecords((prev) => prev - 1);
      showNotification("Produto removido com sucesso", "success");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Erro ao remover produto";
      showNotification(msg, "error");
    }
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6">
      <BannerCard
        icon={Tabs.find((tab) => tab.key === "products")?.icon}
        iconClassName="text-violet-400"
        label="Produtos"
        title="Gerenciamento de Produtos da Semcomp"
        description="Cadastre, busque, edite e remova kits, coffees e combos disponíveis para venda na Semcomp."
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
            <p className="text-slate-400">Carregando produtos...</p>
          </div>
        )}
        <CrudTable
          data={data}
          fields={fields}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          getItemKey={resolveProductKey}
          entityLabel="produto"
          serverSide
          totalRecords={totalRecords}
          onQueryChange={handleQueryChange}
          canWrite={canWrite}
        />
      </div>
    </section>
  );
}
