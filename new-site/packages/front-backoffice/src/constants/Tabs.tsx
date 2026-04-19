import { Calendar, Users } from "lucide-react";

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
    icon: <Calendar className="w-5 h-5" />,
    bg: "bg-[color-mix(in_oklab,var(--primary)_16%,transparent)]",
    hoverBg: "bg-[color-mix(in_oklab,var(--primary)_24%,transparent)]",
  },
  {
    key: "events",
    label: "Eventos",
    description: "Gerencie os eventos da Semcomp.",
    pageNavigate: "/events",
    icon: <Calendar className="w-5 h-5" />,
    bg: "bg-[color-mix(in_oklab,var(--primary)_16%,transparent)]",
    hoverBg: "bg-[color-mix(in_oklab,var(--primary)_24%,transparent)]",
  },
  {
    key: "backoffice-users",
    label: "Usuários Backoffice",
    description: "Gerencie os usuários com acesso ao sistema de backoffice.",
    pageNavigate: "/backoffice-users",
    icon: <Users className="w-5 h-5" />,
    bg: "bg-[color-mix(in_oklab,var(--secondary)_16%,transparent)]",
    hoverBg: "bg-[color-mix(in_oklab,var(--secondary)_24%,transparent)]",
  },
  {
    key: "users-semcomp",
    label: "Usuários Semcomp",
    description: "Gerencie os usuários participantes da Semcomp.",
    pageNavigate: "/semcomp-users",
    icon: <Users className="w-5 h-5" />,
    bg: "bg-[color-mix(in_oklab,var(--secondary)_16%,transparent)]",
    hoverBg: "bg-[color-mix(in_oklab,var(--secondary)_24%,transparent)]",
  },
  {
    key: "participation",
    label: "Participações",
    description: "Gerencie as participações dos usuários nos eventos da Semcomp.",
    pageNavigate: "/participation",
    icon: <Users className="w-5 h-5" />,
    bg: "bg-[color-mix(in_oklab,var(--secondary)_16%,transparent)]",
    hoverBg: "bg-[color-mix(in_oklab,var(--secondary)_24%,transparent)]",
  },
  {
    key: "permissions",
    label: "Permissões",
    description: "Gerencie as permissões de acesso dos usuários ao sistema.",
    pageNavigate: "/permissions",
    icon: <Users className="w-5 h-5" />,
    bg: "bg-[color-mix(in_oklab,var(--secondary)_16%,transparent)]",
    hoverBg: "bg-[color-mix(in_oklab,var(--secondary)_24%,transparent)]",
  }
];