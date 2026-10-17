import { type CrudField } from "@/components/CrudTable";

// Definição dos campos para a tabela baseada na interface de Sales
export const fields: CrudField[] = [
  { value: "id", label: "ID", type: "number", searchable: false },
  { value: "user_name", label: "Comprador", type: "text", searchable: false },
  { value: "total_amount_formatted", label: "Total", type: "text", sortValue: "total_amount", searchable: false },
  { value: "status", label: "Status", type: "text" },
  { value: "payment_method", label: "Método", type: "text" },
  { value: "created_at", label: "Data do Pedido", type: "text", searchable: false },
];