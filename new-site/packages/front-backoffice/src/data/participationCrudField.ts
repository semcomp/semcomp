import { type CrudField } from "@/components/CrudTable";

export const fields: CrudField[] = [
  { value: "userNumber", label: "Número do Participante", type: "number" },
  { value: "nameEvent", label: "Nome do Evento", type: "text" },
  { value: "dateEvent", label: "Data do Evento", type: "date" },
  { value: "userBackoffice", label: "Usuário do Backoffice", type: "text" },
];