import { type CrudField } from "@/components/CrudTable";

export const fields: CrudField[] = [
  { value: "email", label: "Email", type: "text" },
  { value: "section", label: "Seção", type: "text" },
  {
    value: "type",
    label: "Permissões",
    type: "multivalue",
    multiValueOptions: ["read", "write"],
  },
];