import { type CrudField } from "@/components/CrudTable";

export const fields: CrudField[] = [
  // { value: "user_number", label: "Número do Participante", type: "text" },
  { value: "name", label: "Nome", type: "text" },
  { value: "email", label: "Email", type: "text" },
  { value: "password", label: "Senha", type: "text" },
  // { value: "presence_rate", label: "Taxa de Presença", type: "number" },
  { value: "age", label: "Idade", type: "number" },
  { value: "gender", label: "Gênero", type: "select", selectVariants: {
    "Masculino": "bg-blue-500/10 text-blue-600 border-blue-500/20",
    "Feminino": "bg-pink-500/10 text-pink-600 border-pink-500/20",
    "Outro": "bg-purple-500/10 text-purple-600 border-purple-500/20",
    "Prefiro não informar": "bg-slate-500/10 text-slate-600 border-slate-500/20",
  },},
  { value: "city", label: "Cidade", type: "text" },
  { value: "education", label: "Formação", type: "select", selectVariants: {
    "Ensino Médio": "bg-muted text-foreground",
    "Graduação em Andamento": "bg-amber-500/10 text-amber-600 border-amber-500/20",
    "Graduação Concluída": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    "Pós-Graduação": "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  }, },
  { value: "profession", label: "Profissão / Curso", type: "text" },
  { 
    value: "hasPapfe", 
    label: "Possui PAPFE?", 
    type: "boolean"
  },
  { 
    value: "papfe_document", 
    label: "Comprovante PAPFE", 
    type: "file",
    accept: "application/pdf,image/jpeg,image/png,image/webp" 
  },
  { value: "disabilities", label: "Deficiências (PCD)", type: "multivalue" },
  { value: "linkedin", label: "LinkedIn", type: "text" },
  { value: "telegram", label: "Telegram", type: "text" },
];