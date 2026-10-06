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

// "Itens" é um resumo montado no front a partir de combo_items, então não existe
// como coluna no backend para ordenar nem para filtrar.
const comboItems: CrudField = {
  value: "comboItems",
  label: "Itens",
  type: "text",
  readOnly: true,
  sortable: false,
  searchable: false,
};

export const kitFields: CrudField[] = [
  productId,
  isSelling,
  price,
  { value: "kitName", label: "Nome", type: "text" },
  kitSize,
  { value: "kitColor", label: "Cor", type: "text" },
  {
    value: "kitIsBabylook",
    label: "Babylook",
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
  comboItems,
  pictureUrl,
  description,
];

// Fonte única do mapeamento coluna da tabela -> campo esperado pelo backend.
// Vale para ordenação (sort_by) e busca (search_by); campos ausentes aqui são
// repassados ao backend com o nome cru.
export const API_FIELD_MAP: Record<string, string> = {
  productId: "id",
  type: "type",
  isSelling: "is_selling",
  price: "price",
  name: "name",
  kitName: "kit.name",
  kitSize: "kit.size",
  kitColor: "kit.color",
  kitIsBabylook: "kit.is_babylook",
  coffeeName: "coffee.name",
  coffeeDateTime: "coffee.date_time",
  pictureUrl: "picture_url",
  description: "description",
};
