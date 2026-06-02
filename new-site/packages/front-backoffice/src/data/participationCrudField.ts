import { type CrudField } from "@/components/CrudTable";

export const fields: CrudField[] = [
  { value: "userNumber", label: "Número do Participante", type: "text" },
  { value: "nameEvent", label: "Nome do Evento", type: "text" },
  { value: "dateEvent", label: "Data do Evento", type: "date" },
  { value: "userBackoffice", label: "Admin Responsável", type: "text" },
];

export const API_FIELD_MAP: Record<string, string> = {
  userNumber: "user_number",
  dateEvent: "event_init_date",
  nameEvent :"event_name",
  userBackoffice: "email_admin"
};