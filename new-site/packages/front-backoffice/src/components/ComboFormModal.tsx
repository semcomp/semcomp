import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { productsAPI } from "@/api/products";
import type { ProductType } from "@/types/ProductType";
import { useNotification } from "@/contexts/NotificationContext";
import { isNightCoffee } from "@/utils/coffeeRules";
import { Coffee, Minus, Package, Plus, Search } from "lucide-react";

interface ComboFormModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: ProductType | null;
  onSuccess: (product: ProductType, isEdit: boolean) => void;
}

function getDisplayName(product: ProductType): string {
  if (product.kitName) {
    const base = [product.kitName, product.kitSize, product.kitColor].filter(Boolean).join(" — ");
    return product.kitIsBabydoll === "true" ? `${base} (Babydoll)` : base;
  }
  if (product.coffeeName) {
    if (!product.coffeeDateTime) return product.coffeeName;
    const date = new Date(product.coffeeDateTime).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${product.coffeeName} — ${date}`;
  }
  return `Produto #${product.productId}`;
}

export function ComboFormModal({ open, onClose, initialData, onSuccess }: ComboFormModalProps) {
  const { showNotification } = useNotification();
  const isEdit = !!initialData;

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [isSelling, setIsSelling] = useState(false);
  const [pictureUrl, setPictureUrl] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [kits, setKits] = useState<ProductType[]>([]);
  const [coffees, setCoffees] = useState<ProductType[]>([]);
  const [selections, setSelections] = useState<Map<number, number>>(new Map());
  const [fetching, setFetching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setSearch("");
    setFetchError(null);
    setName(initialData?.name ?? "");
    setPrice(initialData?.price ?? "");
    setIsSelling(initialData?.isSelling === "true");
    setPictureUrl(initialData?.pictureUrl ?? "");
    setDescription(initialData?.description ?? "");

    const init = new Map<number, number>();
    initialData?.comboItemDetails?.forEach((ci) => init.set(ci.itemId, ci.quantity));
    setSelections(init);

    setFetching(true);
    Promise.all([
      productsAPI.getAll(1, 1000, "id", "asc", undefined, undefined, "KIT"),
      productsAPI.getAll(1, 1000, "id", "asc", undefined, undefined, "COFFEE"),
    ])
      .then(([kitsRes, coffeesRes]) => {
        setKits(kitsRes.products);
        setCoffees(coffeesRes.products);
      })
      .catch(() => setFetchError("Erro ao carregar produtos disponíveis."))
      .finally(() => setFetching(false));
  }, [open, initialData]);

  const toggleItem = (id: number) => {
    setSelections((prev) => {
      const next = new Map(prev);
      if (next.has(id)) next.delete(id);
      else next.set(id, 1);
      return next;
    });
  };

  const adjustQty = (id: number, delta: number) => {
    setSelections((prev) => {
      const next = new Map(prev);
      const qty = (next.get(id) ?? 1) + delta;
      if (qty <= 0) next.delete(id);
      else next.set(id, qty);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      showNotification("Informe um nome para o combo.", "warning");
      return;
    }
    if (selections.size === 0) {
      showNotification("Selecione pelo menos um item para o combo.", "warning");
      return;
    }
    const parsedPrice = parseFloat(price.replace(",", "."));
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      showNotification("Informe um preço válido maior que zero.", "warning");
      return;
    }

    const allProducts = [...kits, ...coffees];
    const items = Array.from(selections.entries())
      .filter(([itemId]) => {
        const product = allProducts.find((p) => p.productId === itemId);
        // Coffee noturno é venda individual — nunca entra no combo.
        return !(product?.type === "COFFEE" && isNightCoffee(product.coffeeDateTime));
      })
      .map(([item_id, quantity]) => ({
        item_id,
        quantity,
      }));
    if (items.length === 0) {
      showNotification("Selecione pelo menos um item permitido para o combo.", "warning");
      return;
    }
    if (items.length !== selections.size) {
      showNotification(
        "Coffees noturnos foram removidos do combo (são vendidos individualmente).",
        "warning"
      );
    }

    setSubmitting(true);
    try {
      let product: ProductType;
      if (isEdit && initialData) {
        product = await productsAPI.updateCombo(initialData.productId, name.trim(), isSelling, parsedPrice, items, pictureUrl, description);
      } else {
        product = await productsAPI.createCombo(name.trim(), isSelling, parsedPrice, items, pictureUrl, description);
      }
      onSuccess(product, isEdit);
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Erro ao salvar combo.";
      showNotification(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filterList = (list: ProductType[]) => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((p) => getDisplayName(p).toLowerCase().includes(q));
  };

  const renderItem = (product: ProductType) => {
    const id = product.productId;
    const selected = selections.has(id);
    const qty = selections.get(id) ?? 1;
    // Regra de negócio: coffee noturno é vendido individualmente, não entra em combo.
    const isIndividualCoffee = product.type === "COFFEE" && isNightCoffee(product.coffeeDateTime);

    return (
      <div
        key={id}
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors cursor-pointer select-none ${
          isIndividualCoffee
            ? "opacity-40 cursor-not-allowed"
            : selected
              ? "bg-violet-500/10 border border-violet-500/30"
              : "hover:bg-slate-800/60 border border-transparent"
        }`}
        onClick={() => {
          if (isIndividualCoffee) return;
          toggleItem(id);
        }}
      >
        <div
          className={`w-4 h-4 rounded shrink-0 border-2 flex items-center justify-center transition-colors ${
            selected ? "bg-violet-600 border-violet-600" : "border-slate-600"
          }`}
        >
          {selected && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
              <path
                d="M1 4l3 3 5-6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        <span className="flex-1 text-sm text-slate-200 truncate">{getDisplayName(product)}</span>
        {isIndividualCoffee && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/80 shrink-0">
            venda individual
          </span>
        )}
        <span className="text-xs text-slate-500 shrink-0">#{id}</span>

        {selected && (
          <div className="flex items-center gap-1 ml-1" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => adjustQty(id, -1)}
              className="w-6 h-6 rounded flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-5 text-center text-sm tabular-nums text-slate-200">{qty}</span>
            <button
              type="button"
              onClick={() => adjustQty(id, 1)}
              className="w-6 h-6 rounded flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const filteredKits = filterList(kits);
  const filteredCoffees = filterList(coffees);
  const totalSelected = selections.size;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      {/* style garante largura sem depender de twMerge resolver sm:max-w conflicts */}
      <DialogContent
        className="bg-slate-900 border-slate-800 text-slate-100 overflow-hidden gap-0 p-0"
        style={{ maxWidth: "min(32rem, calc(100% - 2rem))" }}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-800">
          <DialogTitle className="text-slate-100">
            {isEdit ? "Editar Combo" : "Novo Combo"}
          </DialogTitle>
        </DialogHeader>

        {/* Nome + Preço + À Venda */}
        <div className="px-6 pt-5 pb-4 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">Nome do Combo</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Kit + Coffee Manhã"
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
            />
          </div>
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-1.5">
              <Label className="text-slate-300 text-sm">Preço (R$)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                placeholder="0.00"
              />
            </div>
            <div className="flex items-center gap-2 pb-2">
              <Switch
                checked={isSelling}
                onCheckedChange={setIsSelling}
                id="combo-isSelling"
              />
              <Label htmlFor="combo-isSelling" className="text-slate-300 text-sm cursor-pointer">
                À Venda
              </Label>
            </div>
          </div>

          {/* Imagem */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">URL da Imagem</Label>
            <Input
              value={pictureUrl}
              onChange={(e) => setPictureUrl(e.target.value)}
              placeholder="https://..."
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">Descrição</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o combo..."
              rows={3}
              className="w-full rounded-md bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome..."
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 pl-9"
            />
          </div>
        </div>

        {/* Lista de itens — altura fixa para rolar independente */}
        <div className="overflow-y-auto px-6 pb-4 space-y-4" style={{ maxHeight: "40vh" }}>
          {fetchError && (
            <div className="rounded-lg bg-red-900/20 border border-red-700 p-3 text-red-200 text-sm">
              {fetchError}
            </div>
          )}

          {fetching ? (
            <p className="text-center text-slate-400 py-8 text-sm">Carregando produtos...</p>
          ) : (
            <div className="space-y-4">
              {filteredKits.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                      Kits
                    </span>
                  </div>
                  {filteredKits.map(renderItem)}
                </div>
              )}

              {filteredCoffees.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Coffee className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                      Coffees
                    </span>
                  </div>
                  {filteredCoffees.map(renderItem)}
                </div>
              )}

              {filteredKits.length === 0 && filteredCoffees.length === 0 && (
                <p className="text-center text-slate-400 py-8 text-sm">
                  {search
                    ? "Nenhum produto encontrado para essa busca."
                    : "Nenhum produto disponível."}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer como div plain — evita -mx-4 -mb-4 do DialogFooter com p-0 no pai */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-800">
          <span className="text-sm text-slate-400 flex-1">
            {totalSelected === 0
              ? "Nenhum tipo selecionado"
              : `${totalSelected} tipo${totalSelected !== 1 ? "s" : ""} selecionado${totalSelected !== 1 ? "s" : ""}`}
          </span>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || fetching}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            {submitting ? "Salvando..." : isEdit ? "Salvar" : "Criar Combo"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
