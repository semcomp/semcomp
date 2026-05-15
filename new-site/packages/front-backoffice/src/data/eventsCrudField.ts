import { type CrudField } from "@/components/CrudTable";

export const fields: CrudField[] = [
  { value: "name", label: "Nome do Evento", type: "text" },
  { value: "init_date", label: "Data/Hora Início", type: "date" },
  { value: "end_date", label: "Data/Hora Fim", type: "date" },
  { value: "local", label: "Local", type: "text" },
  { value: "type", label: "Tipo", type: "text" },
  { value: "description", label: "Descrição", type: "text" },
  { value: "has_presence", label: "Presença", type: "select", selectVariants: {
    true: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    false: "bg-slate-600/40 text-slate-400 border border-slate-600/30",
  }},
];