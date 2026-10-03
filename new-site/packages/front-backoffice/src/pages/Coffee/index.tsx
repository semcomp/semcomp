import { CrudTable } from "@/components/CrudTable";
import type { CrudItemType } from "@/types/CrudItem";
import type { CrudQueryParams } from "@/components/CrudTable";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fields } from "@/data/coffeeCrudField";
import { BannerCard } from "@/components/BannerCard";
import type { CoffeeType } from "@/types/CoffeeType";
import { coffeeAPI } from "@/api/coffee";
import { useNotification } from "@/contexts/NotificationContext";
import { useHasPermission } from "@/contexts/AuthContext";
import { Coffee } from "lucide-react";

export default function CoffeePage() {
  const canWrite = useHasPermission("Coffee", "RW");
  const navigate = useNavigate();
  const [data, setData] = useState<CoffeeType[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const fetchCoffees = useCallback(async (params?: CrudQueryParams) => {
    try {
      setLoading(true);
      setError(null);

      const response = await coffeeAPI.getAll(
        params?.page ?? 1,
        params?.pageSize ?? 10,
        params?.sortField ?? "name",
        params?.sortOrder ?? "asc",
        params?.filterField && params?.filterValue
          ? params.filterField
          : undefined,
        params?.filterValue || undefined
      );

      setData(response.coffees || []);
      setTotalRecords(response.filtered_records ?? response.total_records ?? 0);
    } catch (err) {
      console.error("Erro ao buscar coffees:", err);
      setError("Erro ao carregar lista de coffees");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = useCallback(
    (params: CrudQueryParams) => {
      fetchCoffees(params);
    },
    [fetchCoffees]
  );

  const resolveCoffeeKey = (item: CrudItemType) => {
    const typed = item as CoffeeType;
    return typed.id;
  };

  const handleEdit = async (item: CrudItemType, itemKey: string) => {
    try {
      const typedItem = item as CoffeeType;
      await coffeeAPI.update(itemKey, typedItem);

      setData((prev) =>
        prev.map((c) => (resolveCoffeeKey(c) === itemKey ? typedItem : c))
      );
      showNotification("Coffee editado com sucesso", "success");
    } catch (err) {
      console.error("Erro ao editar coffee:", err);
      setError("Erro ao editar coffee");
    }
  };

  const handleDelete = async (itemKey: string) => {
    try {
      await coffeeAPI.delete(itemKey);
      setData((prev) => prev.filter((c) => resolveCoffeeKey(c) !== itemKey));
      setTotalRecords((prev) => prev - 1);
      showNotification("Coffee removido com sucesso", "success");
    } catch (err) {
      console.error("Erro ao deletar coffee:", err);
      setError("Erro ao deletar coffee");
    }
  };

  const handleCreate = async (item: CrudItemType) => {
    try {
      const typedItem = item as CoffeeType;
      const created = await coffeeAPI.create(typedItem);
      setData((prev) => [...prev, created]);
      setTotalRecords((prev) => prev + 1);
      showNotification("Coffee criado com sucesso", "success");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Erro ao criar coffee");
    }
  };

  // Ação ao clicar no botão da linha -> Navega para a leitura do QR especificando qual coffee é
  const handleAction = (item: CrudItemType) => {
    const coffee = item as CoffeeType;
    navigate(`/coffee/${encodeURIComponent(coffee.id)}/qrcode-reader`, {
      state: {
        coffeeName: coffee.name,
        coffeeId: coffee.id,
      },
    });
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6">
      <BannerCard
        icon={<Coffee />}
        iconClassName="text-amber-400"
        label="Coffee Break"
        title="Gerenciamento de Coffees"
        description="Cadastre os tipos/dias de Coffee Break e acesse o leitor de QR Code para validar as credenciais."
        onBack={() => navigate("/home")}
        cardClassName="border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-amber-950/30 overflow-hidden relative"
        labelClassName="text-xs uppercase tracking-[0.3em] text-amber-400 font-medium"
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
            <p className="text-slate-400">Carregando coffees...</p>
          </div>
        )}
        <CrudTable
          data={data}
          fields={fields}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          onAction={handleAction}
          getItemKey={resolveCoffeeKey}
          entityLabel="coffee"
          totalRecords={totalRecords}
          onQueryChange={handleQueryChange}
          canWrite={canWrite}
        />
      </div>
    </section>
  );
}
