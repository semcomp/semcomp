import { useState } from "react";
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

interface KitBulkModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (products: ProductType[]) => void;
}

const PRESET_SIZES = ["PP", "P", "M", "G", "GG", "XG"];

export function KitBulkModal({ open, onClose, onSuccess }: KitBulkModalProps) {
  const { showNotification } = useNotification();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [isSelling, setIsSelling] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(new Set());
  const [color, setColor] = useState("");
  const [pictureURL, setPictureURL] = useState("");
  const [description, setDescription] = useState("");
  const [withBabydoll, setWithBabydoll] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const totalCombinations = selectedSizes.size * (withBabydoll ? 2 : 1);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) => {
      const next = new Set(prev);
      next.has(size) ? next.delete(size) : next.add(size);
      return next;
    });
  };

  const reset = () => {
    setName("");
    setPrice("");
    setIsSelling(false);
    setSelectedSizes(new Set());
    setColor("");
    setPictureURL("");
    setDescription("");
    setWithBabydoll(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      showNotification("Informe o nome do kit.", "warning");
      return;
    }
    if (selectedSizes.size === 0) {
      showNotification("Selecione pelo menos um tamanho.", "warning");
      return;
    }
    if (!color.trim()) {
      showNotification("Informe a cor do kit.", "warning");
      return;
    }
    const parsedPrice = parseFloat(price.replace(",", "."));
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      showNotification("Informe um preço válido maior que zero.", "warning");
      return;
    }

    const kitName = name.trim();
    const trimmedColor = color.trim();
    const products: object[] = [];
    for (const size of selectedSizes) {
      const base = {
        type: "KIT",
        name: kitName,
        is_selling: isSelling,
        price: parsedPrice,
        picture_url: pictureURL.trim(),
        description: description.trim(),
        kit: { name: kitName, size, color: trimmedColor, is_babydoll: false },
      };
      products.push(base);
      if (withBabydoll) {
        products.push({ ...base, kit: { name: kitName, size, color: trimmedColor, is_babydoll: true } });
      }
    }

    setSubmitting(true);
    try {
      const created = await productsAPI.bulkCreate(products);
      onSuccess(created);
      handleClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Erro ao criar kits.";
      showNotification(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        className="bg-slate-900 border-slate-800 text-slate-100 overflow-hidden gap-0 p-0"
        style={{ maxWidth: "min(32rem, calc(100% - 2rem))" }}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-800">
          <DialogTitle className="text-slate-100">Criar Kits em Lote</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 space-y-5 overflow-y-auto" style={{ maxHeight: "70vh" }}>
          {/* Nome */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">Nome do Kit</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Kit Semcomp 2025"
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
            />
          </div>

          {/* Preço + À Venda */}
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-1.5">
              <Label className="text-slate-300 text-sm">Preço (R$)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <div className="flex items-center gap-2 pb-2">
              <Switch checked={isSelling} onCheckedChange={setIsSelling} id="kit-bulk-selling" />
              <Label htmlFor="kit-bulk-selling" className="text-slate-300 text-sm cursor-pointer">
                À Venda
              </Label>
            </div>
          </div>

          {/* Tamanhos */}
          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">Tamanhos</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_SIZES.map((size) => {
                const active = selectedSizes.has(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-3 py-1 rounded-md text-sm font-medium border transition-colors ${
                      active
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cor */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">Cor</Label>
            <Input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="Ex: Branca"
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
            />
          </div>

          {/* Imagem */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">URL da Imagem</Label>
            <Input
              value={pictureURL}
              onChange={(e) => setPictureURL(e.target.value)}
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
              placeholder="Descreva o kit..."
              rows={3}
              className="w-full rounded-md bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Babydoll */}
          <div className="flex items-center gap-2">
            <Switch checked={withBabydoll} onCheckedChange={setWithBabydoll} id="kit-babydoll" />
            <Label htmlFor="kit-babydoll" className="text-slate-300 text-sm cursor-pointer">
              Incluir variante Babydoll
            </Label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-800">
          <span className="text-sm text-slate-400 flex-1">
            {totalCombinations === 0
              ? "Nenhum kit será criado"
              : `${totalCombinations} kit${totalCombinations !== 1 ? "s" : ""} serão criados`}
          </span>
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || totalCombinations === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {submitting
              ? "Criando..."
              : `Criar ${totalCombinations > 0 ? totalCombinations + " " : ""}Kit${totalCombinations !== 1 ? "s" : ""}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
