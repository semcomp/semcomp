import { type CrudField } from "@/components/CrudTable";

export const fields: CrudField[] = [
  { value: "email", label: "Email", type: "text" },
  {
    value: "section",
    label: "Seção",
    type: "select",
    selectVariants: {
      "Seções": "bg-muted/50 text-foreground",
      "Eventos": "bg-muted/50 text-foreground",
      "Usuários Backoffice": "bg-muted/50 text-foreground",
      "Usuários Semcomp": "bg-muted/50 text-foreground",
      "Participações": "bg-muted/50 text-foreground",
      "Permissões": "bg-muted/50 text-foreground",
      "PAPFE": "bg-muted/50 text-foreground",
      "Coffee": "bg-muted/50 text-foreground",
    },
  },
  {
    value: "type",
    label: "Permissões",
    type: "multivalue",
    multiValueOptions: ["read", "write"],
  },
];