import { type CrudField } from "@/components/CrudTable";

export const fields: CrudField[] = [
  { value: "productId", label: "ID", type: "number", readOnly: true },
  { value: "type", label: "Tipo", type: "select", selectVariants: {
    KIT: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    COFFEE: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    COMBO: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
  }},
  { value: "isSelling", label: "À Venda", type: "select", selectVariants: {
    true: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    false: "bg-slate-600/40 text-slate-400 border border-slate-600/30",
  }},
  { value: "price", label: "Preço", type: "number" },
  { value: "kitName", label: "Nome (Kit)", type: "text" },
  { value: "kitSize", label: "Tamanho (Kit)", type: "text" },
  { value: "kitColor", label: "Cor (Kit)", type: "text" },
  { value: "kitIsBabydoll", label: "Babydoll (Kit)", type: "select", selectVariants: {
    true: "bg-pink-500/20 text-pink-300 border border-pink-500/30",
    false: "bg-slate-600/40 text-slate-400 border border-slate-600/30",
  }},
  { value: "coffeeName", label: "Nome (Coffee)", type: "text" },
  { value: "coffeeDateTime", label: "Data/Hora (Coffee)", type: "date" },
  { value: "comboItems", label: "Itens (Combo)", type: "text" },
];

export const API_FIELD_MAP: Record<string, string> = {
  productId: "id",
  type: "type",
  isSelling: "is_selling",
  price: "price",
};