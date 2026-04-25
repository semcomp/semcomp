import type { BackofficePermissionType } from "@/types/BackofficePermissionType";

export const samplePermissions: BackofficePermissionType[] = [
  {
    id: "1",
    email: "joao.silva@example.com",
    section: "Usuários",
    type: ["read", "write"]
  },
  {
    id: "2",
    email: "maria.souza@example.com",
    section: "Eventos",
    type: ["read", "write"]
  },
  {
    id: "3",
    email: "pedro.oliveira@example.com",
    section: "Permissões",
    type: ["read"]
  },
  {
    id: "4",
    email: "ana.costa@example.com",
    section: "Relatórios",
    type: ["read"]
  },
  {
    id: "5",
    email: "lucas.pereira@example.com",
    section: "Configurações",
    type: ["write"]
  },
  {
    id: "6",
    email: "mariana.almeida@example.com",
    section: "Dashboard",
    type: ["read", "write"]
  },
  {
    id: "7",
    email: "sofia.rodrigues@example.com",
    section: "Analytics",
    type: []
  }
];
