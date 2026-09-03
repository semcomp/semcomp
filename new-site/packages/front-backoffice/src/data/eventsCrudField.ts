import { type CrudField } from "@/components/CrudTable";
import type { PresenceTypeWeight } from "@/api/presenceSettings";

<<<<<<< HEAD
export const buildFields = (weights: PresenceTypeWeight[]): CrudField[] => {
  const typeVariants: Record<string, string> = { "__none__": "" };
  const typeLabels: Record<string, string> = { "__none__": "Nenhum" };

  for (const w of weights) {
    const idStr = String(w.id);
    typeVariants[idStr] = "";
    typeLabels[idStr] = w.type_name;
  }

  return [
    { value: "nameEvent", label: "Nome do Evento", type: "text" },
    { value: "dateInit", label: "Data/Hora Início", type: "date" },
    { value: "dateEnd", label: "Data/Hora Fim", type: "date" },
    { value: "local", label: "Local", type: "text" },
    { value: "presence_type_weight_id", label: "Tipo", type: "select", selectVariants: typeVariants, selectLabels: typeLabels },
    { value: "description", label: "Descrição", type: "textarea" },
    { value: "hasPresence", label: "Presença", type: "select", selectVariants: {
      true: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
      false: "bg-slate-600/40 text-slate-400 border border-slate-600/30",
    }},
  ];
};
=======
export const fields: CrudField[] = [
  { value: "nameEvent", label: "Nome do Evento", type: "text" },
  { value: "dateInit", label: "Data/Hora Início", type: "date" },
  { value: "dateEnd", label: "Data/Hora Fim", type: "date" },
  { value: "local", label: "Local", type: "text" },
  { value: "type", label: "Tipo", type: "text" },
  { value: "description", label: "Descrição", type: "textarea" },
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
>>>>>>> dev
