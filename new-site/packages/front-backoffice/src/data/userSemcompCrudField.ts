import { type CrudField } from "@/components/CrudTable";

export const fields: CrudField[] = [
  { value: "name", label: "Nome", type: "text" },
  { value: "email", label: "Email", type: "text" },
  { value: "password", label: "Senha", type: "text" },
  { value: "presence_rate", label: "Taxa de Presença", type: "number" },
];