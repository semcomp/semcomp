import { CrudTable } from "@/components/CrudTable";
import type { CrudQueryParams } from "@/components/CrudTable";
import type { CrudItemType } from "@/types/CrudItem";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fields } from "@/data/coffeeCrudField";
import { BannerCard } from "@/components/BannerCard";
import type { CoffeeType } from "@/types/CoffeeType";
import { coffeeAPI } from "@/api/coffee";
import { Coffee } from "lucide-react";

export default function CoffeePage() {
  const navigate = useNavigate();
  const [allCoffees, setAllCoffees] = useState<CoffeeType[]>([]);
  const [query, setQuery] = useState<CrudQueryParams | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Busca única: o backend devolve todos os coffees à venda
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await coffeeAPI.getAll();
        setAllCoffees(response.coffees);
      } catch (err) {
        console.error("Erro ao buscar coffees:", err);
        setError("Erro ao carregar lista de coffees");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // O CrudTable avisa aqui quando página/ordem/filtro mudam
  const handleQueryChange = useCallback((params: CrudQueryParams) => {
    setQuery(params);
  }, []);

  // Filtro + ordenação no cliente
  const filtered = useMemo(() => {
    let list = [...allCoffees];

    if (query?.filterField && query.filterValue) {
      const term = query.filterValue.toLowerCase();
      list = list.filter((c) =>
        String((c as unknown as Record<string, unknown>)[query.filterField] ?? "")
          .toLowerCase()
          .includes(term)
      );
    }

    if (query?.sortField) {
      const dir = query.sortOrder === "desc" ? -1 : 1;
      list.sort((a, b) => {
        const av = (a as unknown as Record<string, unknown>)[query.sortField] ?? "";
        const bv = (b as unknown as Record<string, unknown>)[query.sortField] ?? "";
        if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
        return String(av).localeCompare(String(bv), "pt-BR") * dir;
      });
    }

    return list;
  }, [allCoffees, query]);

  // Paginação no cliente
  const pageData = useMemo(() => {
    const page = query?.page ?? 1;
    const size = query?.pageSize ?? 10;
    return filtered.slice((page - 1) * size, page * size);
  }, [filtered, query]);

  const resolveCoffeeKey = (item: CrudItemType) => (item as CoffeeType).id;

  // Abre o leitor de QR para o coffee escolhido (identificado pelo horário)
  const handleAction = (item: CrudItemType) => {
    const coffee = item as CoffeeType;
    if (!coffee.date) {
      setError("Este coffee não possui data/horário cadastrado.");
      return;
    }
    navigate(`/coffee/${encodeURIComponent(coffee.date)}/qrcode-reader`, {
      state: { coffeeName: coffee.name },
    });
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6">
      <BannerCard
        icon={<Coffee />}
        iconClassName="text-amber-400"
        label="Coffee Break"
        title="Validação de Coffees"
        description="Escolha o coffee e acesse o leitor de QR Code para verificar se o participante tem direito a ele."
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
        {loading && allCoffees.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-400">Carregando coffees...</p>
          </div>
        )}
        <CrudTable
          data={pageData}
          fields={fields}
          onEdit={() => {}} /* obrigatório no tipo; nunca é chamado com canWrite={false} */
          onAction={handleAction}
          actionTitle="Validar QR Code"
          getItemKey={resolveCoffeeKey}
          entityLabel="coffee"
          totalRecords={filtered.length}
          onQueryChange={handleQueryChange}
          canWrite={false}
        />
      </div>
    </section>
  );
}