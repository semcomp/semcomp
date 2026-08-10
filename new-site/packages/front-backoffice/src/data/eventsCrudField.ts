import { type CrudField } from "@/components/CrudTable";

export const fields: CrudField[] = [
  { value: "nameEvent", label: "Nome do Evento", type: "text" },
  { value: "dateInit", label: "Data/Hora Início", type: "date" },
  { value: "dateEnd", label: "Data/Hora Fim", type: "date" },
  { value: "local", label: "Local", type: "text" },
  { value: "type", label: "Tipo", type: "text" },
  { value: "description", label: "Descrição", type: "text" },
  { value: "hasPresence", label: "Presença", type: "select", selectVariants: {
    true: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    false: "bg-slate-600/40 text-slate-400 border border-slate-600/30",
  }},
  { value: "hasSignin", label: "Inscrição", type: "select", selectVariants: {
    true: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    false: "bg-slate-600/40 text-slate-400 border border-slate-600/30",
  }},
  { value: "maxParticipants", label: "Vagas (0 = ilimitado)", type: "number" },
];