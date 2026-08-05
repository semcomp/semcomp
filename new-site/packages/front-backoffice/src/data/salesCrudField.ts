import { type CrudField } from "@/components/CrudTable";

// Definição dos campos para a tabela baseada na interface de Sales
export const fields: CrudField[] = [
  { value: "id", label: "ID da Venda", type: "number" },
  { value: "user_number", label: "Número do Usuário", type: "number" },
  { value: "total_amount_formatted", label: "Total", type: "text" },
  { value: "status", label: "Status", type: "text" },
  { value: "payment_method", label: "Método", type: "text" },
];