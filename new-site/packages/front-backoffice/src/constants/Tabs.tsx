import { Calendar, UserCog, User, Key, Search, Hand } from "lucide-react";

export const Tabs: {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  pageNavigate: string;
  bg: string;
  hoverBg: string;
} [] = [
  {
    key: "sections",
    label: "Seções",
    description: "Observe as seções dos eventos da Semcomp.",
    pageNavigate: "/sections",
    icon: <Search className="w-5 h-5" />,
    bg: "bg-primary/15",
    hoverBg: "bg-primary/25",
  },
  {
    key: "events",
    label: "Eventos",
    description: "Gerencie os eventos da Semcomp.",
    pageNavigate: "/events",
    icon: <Calendar className="w-5 h-5" />,
    bg: "bg-primary/15",
    hoverBg: "bg-primary/25",
  },
  {
    key: "backoffice-users",
    label: "Usuários Backoffice",
    description: "Gerencie os usuários com acesso ao sistema de backoffice.",
    pageNavigate: "/backoffice-users",
    icon: <UserCog className="w-5 h-5" />,
    bg: "bg-primary/15",
    hoverBg: "bg-primary/25",
  },
  {
    key: "users-semcomp",
    label: "Usuários Semcomp",
    description: "Gerencie os usuários participantes da Semcomp.",
    pageNavigate: "/semcomp-users",
    icon: <User className="w-5 h-5" />,
    bg: "bg-primary/15",
    hoverBg: "bg-primary/25",
  },
  {
    key: "participation",
    label: "Participações",
    description: "Gerencie as participações dos usuários nos eventos da Semcomp.",
    pageNavigate: "/participation",
    icon: <Hand className="w-5 h-5" />,
    bg: "bg-primary/15",
    hoverBg: "bg-primary/25",
  },
  {
    key: "permissions",
    label: "Permissões",
    description: "Gerencie as permissões de acesso dos usuários ao sistema.",
    pageNavigate: "/permissions",
    icon: <Key className="w-5 h-5" />,
    bg: "bg-primary/15",
    hoverBg: "bg-primary/25",
  }
];