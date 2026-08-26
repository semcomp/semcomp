import { Calendar, UserCog, User, Key, Hand, ToggleLeft, ShoppingBag, Handshake, DollarSign, FileCheck, Puzzle } from "lucide-react";

// section deve coincidir com KnownSections em backend/internal/permission/model.go
export const Tabs: {
  key: string;
  section: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  pageNavigate: string;
  bg: string;
  hoverBg: string;
}[] = [
  {
    key: "events",
    section: "Eventos",
    label: "Eventos",
    description: "Gerencie os eventos da Semcomp.",
    pageNavigate: "/events",
    icon: <Calendar className="w-5 h-5" />,
    bg: "bg-primary/15",
    hoverBg: "bg-primary/25",
  },
  {
    key: "backoffice-users",
    section: "Usuários Backoffice",
    label: "Usuários Backoffice",
    description: "Gerencie os usuários com acesso ao sistema de backoffice.",
    pageNavigate: "/backoffice-users",
    icon: <UserCog className="w-5 h-5" />,
    bg: "bg-primary/15",
    hoverBg: "bg-primary/25",
  },
  {
    key: "users-semcomp",
    section: "Usuários Semcomp",
    label: "Usuários Semcomp",
    description: "Gerencie os usuários participantes da Semcomp.",
    pageNavigate: "/semcomp-users",
    icon: <User className="w-5 h-5" />,
    bg: "bg-primary/15",
    hoverBg: "bg-primary/25",
  },
  {
    key: "participation",
    section: "Participações",
    label: "Participações",
    description: "Gerencie as participações dos usuários nos eventos da Semcomp.",
    pageNavigate: "/participation",
    icon: <Hand className="w-5 h-5" />,
    bg: "bg-primary/15",
    hoverBg: "bg-primary/25",
  },
  {
    key: "permissions",
    section: "Permissões",
    label: "Permissões",
    description: "Gerencie as permissões de acesso dos usuários ao sistema.",
    pageNavigate: "/permissions",
    icon: <Key className="w-5 h-5" />,
    bg: "bg-primary/15",
    hoverBg: "bg-primary/25",
  },
  {
    key: "products",
    section: "Produtos",
    label: "Produtos",
    description: "Gerencie os produtos da Semcomp.",
    pageNavigate: "/products",
    icon: <ShoppingBag className="w-5 h-5" />,
    bg: "bg-primary/15",
    hoverBg: "bg-primary/25",
  },
  {
    key: "pages-availability",
    section: "Páginas",
    label: "Páginas",
    description: "Habilite ou desabilite páginas do site.",
    pageNavigate: "/pages-availability",
    icon: <ToggleLeft className="w-5 h-5" />,
    bg: "bg-primary/15",
    hoverBg: "bg-primary/25",
  },
  {
    key: "sponsors",
    section: "Patrocinadores",
    label: "Patrocinadores",
    description: "Gerencie os patrocinadores da SEMCOMP e seus pacotes por ano.",
    pageNavigate: "/sponsors",
    icon: <Handshake className="w-5 h-5" />,
    bg: "bg-primary/15",
    hoverBg: "bg-primary/25",
  },
  {
    key: "sales",
    section: "Vendas",
    label: "Vendas",
    description: "Gerencie as vendas realizadas para a SEMCOMP.",
    pageNavigate: "/sales",
    icon: <DollarSign className="w-5 h-5" />,
    bg: "bg-primary/15",
    hoverBg: "bg-primary/25",
  },
  {
    key: "riddles",
    section: "Riddles",
    label: "Riddles",
    description: "Gerencie os enigmas do jogo de sequência.",
    pageNavigate: "/riddles",
    icon: <Puzzle className="w-5 h-5" />,
    bg: "bg-primary/15",
    hoverBg: "bg-primary/25",
  },
  {
    key: "papfe",
    section: "PAPFE",
    label: "PAPFE",
    description: "Revise e aprove comprovantes PAPFE dos participantes.",
    pageNavigate: "/papfe-documents",
    icon: <FileCheck className="w-5 h-5" />,
    bg: "bg-primary/15",
    hoverBg: "bg-primary/25",
  },
];
