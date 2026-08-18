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
import { isNightCoffee } from "@/utils/coffeeRules";
import { Plus, Trash2 } from "lucide-react";

interface CoffeeBulkModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (products: ProductType[]) => void;
}

export function CoffeeBulkModal({ open, onClose, onSuccess }: CoffeeBulkModalProps) {
  const { showNotification } = useNotification();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [isSelling, setIsSelling] = useState(false);
  const [pictureUrl, setPictureUrl] = useState("");
  const [description, setDescription] = useState("");
  const [dateTimes, setDateTimes] = useState<string[]>([""]);
  const [submitting, setSubmitting] = useState(false);

  const validDateTimes = dateTimes.filter((dt) => dt.trim() !== "");

  const addDateTime = () => setDateTimes((prev) => [...prev, ""]);

  const updateDateTime = (index: number, value: string) =>
    setDateTimes((prev) => prev.map((dt, i) => (i === index ? value : dt)));

  const removeDateTime = (index: number) =>
    setDateTimes((prev) => prev.filter((_, i) => i !== index));

  const reset = () => {
    setName("");
    setPrice("");
    setIsSelling(false);
    setPictureUrl("");
    setDescription("");
    setDateTimes([""]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      showNotification("Informe o nome do coffee.", "warning");
      return;
    }
    if (validDateTimes.length === 0) {
      showNotification("Adicione pelo menos um horário.", "warning");
      return;
    }
    const parsedPrice = parseFloat(price.replace(",", "."));
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      showNotification("Informe um preço válido maior que zero.", "warning");
      return;
    }
    // Aviso: coffee de dia (antes das 18h) vendido individualmente é permitido,
    // mas merece atenção — normalmente esse coffee entra em combos.
    if (isSelling && validDateTimes.some((dt) => !isNightCoffee(dt))) {
      showNotification(
        "Atenção: você está criando coffee(s) de manhã/dia vendidos individualmente.",
        "warning"
      );
    }

    const coffeeName = name.trim();
    const products = validDateTimes.map((dt) => ({
      type: "COFFEE",
      name: coffeeName,
      is_selling: isSelling,
      price: parsedPrice,
      picture_url: pictureUrl.trim(),
      description: description.trim(),
      coffee: { name: coffeeName, date_time: new Date(dt).toISOString() },
    }));

    setSubmitting(true);
    try {
      const created = await productsAPI.bulkCreate(products);
      onSuccess(created);
      handleClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Erro ao criar coffees.";
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
          <DialogTitle className="text-slate-100">Criar Coffees em Lote</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 space-y-5 overflow-y-auto" style={{ maxHeight: "70vh" }}>
          {/* Nome */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">Nome do Coffee</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Coffee da Manhã"
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
              <Switch checked={isSelling} onCheckedChange={setIsSelling} id="coffee-bulk-selling" />
              <Label htmlFor="coffee-bulk-selling" className="text-slate-300 text-sm cursor-pointer">
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
              placeholder="Descreva o coffee..."
              rows={3}
              className="w-full rounded-md bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Horários */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 text-sm">Horários</Label>
              <Button
                type="button"
                variant="outline"
                onClick={addDateTime}
                className="h-7 px-2 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100 text-xs gap-1"
              >
                <Plus className="w-3 h-3" />
                Adicionar
              </Button>
            </div>
            <div className="space-y-2">
              {dateTimes.map((dt, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    type="datetime-local"
                    value={dt}
                    onChange={(e) => updateDateTime(index, e.target.value)}
                    className="bg-slate-800 border-slate-700 text-slate-100 flex-1"
                  />
                  {dateTimes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDateTime(index)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-800">
          <span className="text-sm text-slate-400 flex-1">
            {validDateTimes.length === 0
              ? "Nenhum coffee será criado"
              : `${validDateTimes.length} coffee${validDateTimes.length !== 1 ? "s" : ""} serão criados`}
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
            disabled={submitting || validDateTimes.length === 0}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {submitting
              ? "Criando..."
              : `Criar ${validDateTimes.length > 0 ? validDateTimes.length + " " : ""}Coffee${validDateTimes.length !== 1 ? "s" : ""}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
