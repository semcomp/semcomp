import { type CrudField } from "@/components/CrudTable";

const PRESET_SIZES = ["PP", "P", "M", "G", "GG", "XG"];

const productId: CrudField = { value: "productId", label: "ID", type: "number", readOnly: true };

const isSelling: CrudField = {
  value: "isSelling",
  label: "À Venda",
  type: "boolean",
};

const price: CrudField = { value: "price", label: "Preço", type: "number" };
const pictureUrl: CrudField = { value: "pictureUrl", label: "URL da Imagem", type: "url" };
const description: CrudField = { value: "description", label: "Descrição", type: "textarea" };

const kitSize: CrudField = {
  value: "kitSize",
  label: "Tamanho",
  type: "select",
  selectVariants: Object.fromEntries(
    PRESET_SIZES.map((size) => [size, "bg-blue-500/20 text-blue-300 border border-blue-500/30"]),
  ),
};

export const kitFields: CrudField[] = [
  productId,
  isSelling,
  price,
  { value: "kitName", label: "Nome", type: "text" },
  kitSize,
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
  pictureUrl,
  description,
];

export const coffeeFields: CrudField[] = [
  productId,
  isSelling,
  price,
  { value: "coffeeName", label: "Nome", type: "text" },
  { value: "coffeeDateTime", label: "Data/Hora", type: "date" },
  pictureUrl,
  description,
];

export const comboFields: CrudField[] = [
  productId,
  { value: "name", label: "Nome", type: "text", readOnly: true },
  isSelling,
  price,
  { value: "comboItems", label: "Itens", type: "text", readOnly: true },
  pictureUrl,
  description,
];

export const API_FIELD_MAP: Record<string, string> = {
  productId: "id",
  type: "type",
  isSelling: "is_selling",
  price: "price",
};
