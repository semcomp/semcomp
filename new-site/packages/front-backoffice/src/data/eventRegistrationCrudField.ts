import { type CrudField } from "@/components/CrudTable";

export const fields: CrudField[] = [
  { value: "userNumber", label: "Número do Participante", type: "text" },
  { value: "eventName", label: "Nome do Evento", type: "text" },
  { value: "eventInitDate", label: "Data do Evento", type: "date" },
  { value: "status", label: "Status", type: "text" },
  { value: "userWaitListPosition", label: "Posição na Lista de Espera", type: "number" },
];
