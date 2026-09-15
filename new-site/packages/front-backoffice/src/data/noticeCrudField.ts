import type { CrudField } from "@/components/CrudTable";

export const fields: CrudField[] = [
  {
    value: "title",
    label: "Título",
    type: "text",
  },
  {
    value: "description",
    label: "Descrição",
    type: "text",
  },
  {
    value: "dateTime",
    label: "Data e Hora",
    type: "date",
  },
];
