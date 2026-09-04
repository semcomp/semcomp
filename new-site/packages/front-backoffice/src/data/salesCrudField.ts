import { type CrudField } from "@/components/CrudTable";

// Definição dos campos para a tabela baseada na interface de Sales
export const fields: CrudField[] = [
  { value: "id", label: "ID", type: "number" },
  { value: "user_name", label: "Comprador", type: "text" },
  { value: "total_amount_formatted", label: "Total", type: "text", sortValue: "total_amount" },
  { value: "status", label: "Status", type: "text" },
  { value: "payment_method", label: "Método", type: "text" },
  { value: "created_at", label: "Data do Pedido", type: "text" },
];