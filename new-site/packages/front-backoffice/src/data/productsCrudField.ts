import { type CrudField } from "@/components/CrudTable";

const productId: CrudField = { value: "productId", label: "ID", type: "number", readOnly: true };

const isSelling: CrudField = {
  value: "isSelling",
  label: "À Venda",
  type: "select",
  selectVariants: {
    true: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    false: "bg-slate-600/40 text-slate-400 border border-slate-600/30",
  },
};

const price: CrudField = { value: "price", label: "Preço", type: "number" };

export const kitFields: CrudField[] = [
  productId,
  isSelling,
  price,
  { value: "kitName", label: "Nome", type: "text" },
  { value: "kitSize", label: "Tamanho", type: "text" },
  { value: "kitColor", label: "Cor", type: "text" },
  {
    value: "kitIsBabydoll",
    label: "Babydoll",
    type: "select",
    selectVariants: {
      true: "bg-pink-500/20 text-pink-300 border border-pink-500/30",
      false: "bg-slate-600/40 text-slate-400 border border-slate-600/30",
    },
  },
];

export const coffeeFields: CrudField[] = [
  productId,
  isSelling,
  price,
  { value: "coffeeName", label: "Nome", type: "text" },
  { value: "coffeeDateTime", label: "Data/Hora", type: "date" },
];

export const comboFields: CrudField[] = [
  productId,
  { value: "name", label: "Nome", type: "text", readOnly: true },
  isSelling,
  price,
  { value: "comboItems", label: "Itens", type: "text", readOnly: true },
];

export const API_FIELD_MAP: Record<string, string> = {
  productId: "id",
  type: "type",
  isSelling: "is_selling",
  price: "price",
};
