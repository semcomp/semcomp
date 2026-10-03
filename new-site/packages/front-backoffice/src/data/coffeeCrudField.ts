import { type CrudField } from "@/components/CrudTable";

export const fields: CrudField[] = [
  {
    value: "name",
    label: "Nome do Coffee",
    type: "text",
  },
  {
    value: "date",
    label: "Data / Horário",
    type: "text",
  },
  {
    value: "price",
    label: "Preço (R$)",
    type: "number",
  },
  {
    value: "description",
    label: "Descrição",
    type: "text",
  },
];