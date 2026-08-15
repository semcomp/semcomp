import { CrudTable } from "@/components/CrudTable";
import type { CrudItemType } from "@/types/CrudItem";
import type { CrudQueryParams } from "@/components/CrudTable";
import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs } from "@/constants/Tabs";
import { API_FIELD_MAP, kitFields, coffeeFields, comboFields } from "@/data/productsCrudField";
import { BannerCard } from "@/components/BannerCard";
import type { ProductKind, ProductType } from "@/types/ProductType";
import { productsAPI } from "@/api/products";
import { useNotification } from "@/contexts/NotificationContext";
import { useHasPermission } from "@/contexts/AuthContext";
import { Coffee, Layers, Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComboFormModal } from "@/components/ComboFormModal";

const TYPE_TABS: {
  type: ProductKind;
  label: string;
  icon: React.ReactNode;
  activeClass: string;
}[] = [
  {
    type: "KIT",
    label: "Kit",
    icon: <Package className="w-4 h-4" />,
    activeClass: "bg-blue-600 text-white border-blue-600",
  },
  {
    type: "COFFEE",
    label: "Coffee",
    icon: <Coffee className="w-4 h-4" />,
    activeClass: "bg-amber-600 text-white border-amber-600",
  },
  {
    type: "COMBO",
    label: "Combo",
    icon: <Layers className="w-4 h-4" />,
    activeClass: "bg-purple-600 text-white border-purple-600",
  },
];

const FIELDS_BY_TYPE = {
  KIT: kitFields,
  COFFEE: coffeeFields,
  COMBO: comboFields,
};

export default function ProductsCRUD() {
  const canWrite = useHasPermission("Produtos", "RW");
  const navigate = useNavigate();
  const [activeType, setActiveType] = useState<ProductKind>("KIT");
  const [data, setData] = useState<ProductType[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const lastParamsRef = useRef<CrudQueryParams | undefined>(undefined);

  // Combo modal state
  const [comboModalOpen, setComboModalOpen] = useState(false);
  const [comboEditTarget, setComboEditTarget] = useState<ProductType | null>(null);

  const fetchProducts = useCallback(async (type: ProductKind, params?: CrudQueryParams) => {
    try {
      setLoading(true);
      setError(null);

      const sortFieldApi = API_FIELD_MAP[params?.sortField ?? ""] || params?.sortField || "id";

      const response = await productsAPI.getAll(
        params?.page ?? 1,
        params?.pageSize ?? 10,
        sortFieldApi,
        params?.sortOrder ?? "asc",
        "type",
        type,
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

  const handleQueryChange = useCallback(
    (params: CrudQueryParams) => {
      lastParamsRef.current = params;
      fetchProducts(activeType, params);
    },
    [activeType, fetchProducts],
  );

  const handleTabChange = (type: ProductKind) => {
    lastParamsRef.current = undefined;
    setActiveType(type);
  };

  const resolveProductKey = useCallback((item: CrudItemType) => {
    return String((item as ProductType).productId);
  }, []);

  // Kit / Coffee create and edit
  const handleCreate = async (item: CrudItemType) => {
    try {
      const typedItem = { ...(item as ProductType), type: activeType };
      const createdProduct = await productsAPI.create(typedItem);
      setData((prev) => [...prev, createdProduct]);
      setTotalRecords((prev) => prev + 1);
      showNotification("Produto criado com sucesso", "success");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Erro ao criar produto";
      showNotification(msg, "error");
    }
  };

  const handleEdit = async (item: CrudItemType, itemKey: string) => {
    try {
      const typedItem = item as ProductType;
      const originalProduct = data.find((p) => resolveProductKey(p) === itemKey);
      if (!originalProduct) return;

      const updated = await productsAPI.update(originalProduct.productId, {
        ...typedItem,
        type: originalProduct.type,
      });
      setData((prev) =>
        prev.map((p) => (resolveProductKey(p) === itemKey ? updated : p)),
      );
      showNotification("Produto editado com sucesso", "success");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Erro ao editar produto";
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
      const msg = err.response?.data?.message || err.message || "Erro ao remover produto";
      showNotification(msg, "error");
    }
  };

  // Combo-specific handlers
  const handleComboEditClick = useCallback((item: CrudItemType) => {
    setComboEditTarget(item as ProductType);
    setComboModalOpen(true);
  }, []);

  const handleComboSuccess = useCallback(
    (product: ProductType, isEdit: boolean) => {
      if (isEdit) {
        setData((prev) =>
          prev.map((p) => (p.productId === product.productId ? product : p)),
        );
      } else {
        setData((prev) => [...prev, product]);
        setTotalRecords((prev) => prev + 1);
      }
      showNotification(
        isEdit ? "Combo atualizado com sucesso" : "Combo criado com sucesso",
        "success",
      );
    },
    [showNotification],
  );

  const isCombo = activeType === "COMBO";

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

      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 p-1.5">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.type}
              onClick={() => handleTabChange(tab.type)}
              className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium border transition-all ${
                activeType === tab.type
                  ? tab.activeClass + " shadow-sm"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {isCombo && canWrite && (
          <Button
            onClick={() => {
              setComboEditTarget(null);
              setComboModalOpen(true);
            }}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4" />
            Novo Combo
          </Button>
        )}
      </div>

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
          key={activeType}
          data={data}
          fields={FIELDS_BY_TYPE[activeType]}
          onEdit={isCombo ? () => {} : handleEdit}
          onEditClick={isCombo ? handleComboEditClick : () => {}}
          onDelete={handleDelete}
          onCreate={isCombo ? undefined : handleCreate}
          getItemKey={resolveProductKey}
          entityLabel="produto"
          serverSide
          totalRecords={totalRecords}
          onQueryChange={handleQueryChange}
          canWrite={canWrite}
        />
      </div>

      <ComboFormModal
        open={comboModalOpen}
        onClose={() => setComboModalOpen(false)}
        initialData={comboEditTarget}
        onSuccess={handleComboSuccess}
      />
    </section>
  );
}
