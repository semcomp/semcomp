import { type CrudField } from "@/components/CrudTable";

export const fields: CrudField[] = [
  { value: "nameUser", label: "Nome do Participante", type: "text" },
  { value: "nameEvent", label: "Nome do Evento", type: "text" },
  { value: "dateEvent", label: "Data do Evento", type: "date" },
  { value: "userBackoffice", label: "Usuário do Backoffice", type: "text" },
];