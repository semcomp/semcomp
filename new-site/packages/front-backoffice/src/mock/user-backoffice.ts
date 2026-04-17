import type { CrudItemType } from "@/types/CrudItem";

interface BackofficeUserItem extends CrudItemType {
  email: string;
}

export const sampleBackofficeUsers: BackofficeUserItem[] = [
  { id: "1", name: "Ana Beatriz Santos", email: "ana@gmail.com" },
  { id: "2", name: "Carlos Eduardo Lima", email: "carlos@gmail.com" },
  { id: "3", name: "Fernanda Oliveira", email: "fernanda@gmail.com" },
  { id: "4", name: "Gabriel Costa", email: "gabriel@gmail.com" },
  { id: "5", name: "Helena Martins", email: "helena@gmail.com" },
  { id: "6", name: "Igor Ferreira", email: "igor@gmail.com" },
  { id: "7", name: "Juliana Ramos", email: "juliana@gmail.com" },
  { id: "8", name: "Lucas Almeida", email: "lucas@gmail.com" },
  { id: "9", name: "Marina Pereira", email: "marina@gmail.com" },
  { id: "10", name: "Nicolas Barbosa", email: "nicolas@gmail.com" },
  { id: "11", name: "Olívia Souza", email: "olivia@gmail.com" },
  { id: "12", name: "Pedro Henrique Nunes", email: "pedro@gmail.com" },
];
