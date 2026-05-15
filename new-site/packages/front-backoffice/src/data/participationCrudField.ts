import { type CrudField } from "@/components/CrudTable";

export const fields: CrudField[] = [
  { value: "user_number", label: "Numero do Participante", type: "text" },
  { value: "event_name", label: "Nome do Evento", type: "text" },
  { value: "event_init_date", label: "Data do Evento", type: "date" },
  { value: "email_admin", label: "Usuário do Backoffice", type: "text" },
];