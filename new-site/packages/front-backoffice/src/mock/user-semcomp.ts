import type { CrudItemType } from "@/types/CrudItem";

interface SemcompUserItem extends CrudItemType {
  email: string;
  cargo: string;
  permissao: string;
  status: string;
  departamento: string;
}

export const sampleSemcompUsers: SemcompUserItem[] = [
  { id: "1", name: "Ana Beatriz Santos", email: "ana@semcomp.com", cargo: "Diretora Geral", permissao: "Admin", departamento: "Diretoria", status: "Ativo" },
  { id: "2", name: "Carlos Eduardo Lima", email: "carlos@semcomp.com", cargo: "Dev Backend", permissao: "Moderador", departamento: "TI", status: "Ativo" },
  { id: "3", name: "Fernanda Oliveira", email: "fernanda@semcomp.com", cargo: "Coord. Eventos", permissao: "Editor", departamento: "Eventos", status: "Ativo" },
  { id: "4", name: "Gabriel Costa", email: "gabriel@semcomp.com", cargo: "Designer", permissao: "Editor", departamento: "Marketing", status: "Ativo" },
  { id: "5", name: "Helena Martins", email: "helena@semcomp.com", cargo: "Relações Públicas", permissao: "Visualizador", departamento: "Comunicação", status: "Ativo" },
  { id: "6", name: "Igor Ferreira", email: "igor@semcomp.com", cargo: "Dev Frontend", permissao: "Moderador", departamento: "TI", status: "Ativo" },
  { id: "7", name: "Juliana Ramos", email: "juliana@semcomp.com", cargo: "Coord. Patrocínio", permissao: "Editor", departamento: "Financeiro", status: "Inativo" },
  { id: "8", name: "Lucas Almeida", email: "lucas@semcomp.com", cargo: "Suporte TI", permissao: "Visualizador", departamento: "TI", status: "Ativo" },
  { id: "9", name: "Marina Pereira", email: "marina@semcomp.com", cargo: "Coord. Inscrições", permissao: "Editor", departamento: "Eventos", status: "Ativo" },
  { id: "10", name: "Nicolas Barbosa", email: "nicolas@semcomp.com", cargo: "Segurança", permissao: "Visualizador", departamento: "Operações", status: "Ativo" },
  { id: "11", name: "Samuel Rodrigues", email: "samuel@semcomp.com", cargo: "Analista de Dados", permissao: "Visualizador", departamento: "TI", status: "Ativo" },
  { id: "12", name: "Vanessa Lima", email: "vanessa@semcomp.com", cargo: "Coord. Recursos Humanos", permissao: "Editor", departamento: "Recursos Humanos", status: "Ativo" },
  { id: "13", name: "William Costa", email: "william@semcomp.com", cargo: "Consultor", permissao: "Visualizador", departamento: "Consultoria", status: "Ativo" },
  { id: "14", name: "Yasmin Fernandes", email: "yasmin@semcomp.com", cargo: "Coord. Marketing", permissao: "Editor", departamento: "Marketing", status: "Ativo" },
  { id: "15", name: "Zoe Almeida", email: "zoe@semcomp.com", cargo: "Coord. Recursos Humanos", permissao: "Editor", departamento: "Recursos Humanos", status: "Ativo" },
  { id: "16", name: "Bruno Silva", email: "bruno@semcomp.com", cargo: "Coord. TI", permissao: "Editor", departamento: "TI", status: "Ativo" },
  { id: "17", name: "Carla Mendes", email: "carla@semcomp.com", cargo: "Coord. Financeiro", permissao: "Editor", departamento: "Financeiro", status: "null" },
];
