import { type CrudField } from "@/components/CrudTable";

const statusVariants: Record<string, string> = {
  PENDENTE:    "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  PAGO:        "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  CANCELADO:   "bg-red-500/20 text-red-300 border border-red-500/30",
  REEMBOLSADO: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  REJEITADO:   "bg-orange-500/20 text-orange-300 border border-orange-500/30",
  EXPIRADO:    "bg-slate-500/20 text-slate-400 border border-slate-500/30",
};

// Definição dos campos para a tabela baseada na interface de Sales
export const fields: CrudField[] = [
  { value: "id", label: "ID", type: "number", searchable: false },
  { value: "user_name", label: "Comprador", type: "text" },
  { value: "total_amount_formatted", label: "Total", type: "text", sortValue: "total_amount", searchValue: "total_amount" },
  { value: "status", label: "Status", type: "select", selectVariants: statusVariants },
  { value: "payment_method", label: "Método", type: "text" },
  { value: "created_at", label: "Data do Pedido", type: "date" },
];