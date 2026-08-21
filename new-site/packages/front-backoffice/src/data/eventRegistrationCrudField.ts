import { type CrudField } from "@/components/CrudTable";

export const fields: CrudField[] = [
  { value: "userNumber", label: "Número do Participante", type: "text" },
  { value: "eventName", label: "Nome do Evento", type: "text" },
  { value: "eventInitDate", label: "Data do Evento", type: "date" },
  { value: "status", label: "Status", type: "select", selectVariants: {
    Inscrito: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    "Lista de Espera": "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    Cancelado: "bg-red-500/20 text-red-300 border border-red-500/30",
  },
  },
  { value: "userWaitListPosition", label: "Posição na Lista de Espera", type: "number", readonly: true, },
];

export const API_FIELD_MAP: Record<string, string> = {
  userNumber: "user_number",
  eventName: "event_name",
  eventInitDate: "event_init_date",
  userWaitListPosition: "user_wait_list_position",
  status: "status",
};