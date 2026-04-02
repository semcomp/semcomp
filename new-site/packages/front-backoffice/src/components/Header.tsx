import { useLayoutEffect, useEffect, useState } from "react";
import { IoMenu, IoClose } from "react-icons/io5";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Home, CalendarDays, Users } from "lucide-react";
import SemcompLogo from "@/assets/img/semcomp/logo.webp";

type TabKey = "home" | "events" | "semcompusers" | "backofficeusers";

const tabs: Array<{ key: TabKey; label: string; path: string; icon: React.ReactNode; description: string }> = [
  { key: "home", label: "Home", path: "/home", icon: <Home className="w-4 h-4" />, description: "Painel principal" },
  { key: "events", label: "Eventos", path: "/events", icon: <CalendarDays className="w-4 h-4" />, description: "Eventos e atividades da semana" },
  { key: "semcompusers", label: "Usuários Semcomp", path: "/semcompusers", icon: <Users className="w-4 h-4" />, description: "Gestão dos participantes da Semcomp" },
  { key: "backofficeusers", label: "Usuários Backoffice", path: "/backofficeusers", icon: <Users className="w-4 h-4" />, description: "Gestão de usuários do Backoffice" },
  // { key: "settings", label: "Configurações", path: "/settings", icon: <LogOut className="w-4 h-4" />, description: "Preferências e ajustes" },
  // { key: "support", label: "Suporte", path: "/support", icon: <LogOut className="w-4 h-4" />, description: "Ajuda e contato" },
  // { key: "reports", label: "Relatórios", path: "/reports", icon: <LogOut className="w-4 h-4" />, description: "Análises e métricas" },
  // { key: "analytics", label: "Analytics", path: "/analytics", icon: <LogOut className="w-4 h-4" />, description: "Dados e insights" },
  // { key: "billing", label: "Faturamento", path: "/billing", icon: <LogOut className="w-4 h-4" />, description: "Pagamentos e assinaturas" },
  // { key: "integrations", label: "Integrações", path: "/integrations", icon: <LogOut className="w-4 h-4" />, description: "Conexões e APIs" },
  // { key: "feedback", label: "Feedback", path: "/feedback", icon: <LogOut className="w-4 h-4" />, description: "Comentários e sugestões" },
  // { key: "announcements", label: "Anúncios", path: "/announcements", icon: <LogOut className="w-4 h-4" />, description: "Novidades e comunicados" },
  // { key: "users", label: "Usuários", path: "/users", icon: <Users className="w-4 h-4" />, description: "Gerenciamento de usuários" },
  // { key: "events", label: "Eventos", path: "/events", icon: <CalendarDays className="w-4 h-4" />, description: "Gerenciamento de eventos" },
  // { key: "home", label: "Home", path: "/home", icon: <Home className="w-4 h-4" />, description: "Visão geral e estatísticas" },
];

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useLayoutEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()
    : "";

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          
          {/* Menu + Logo [Lado esquerdo da página] */}
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-9 w-9 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                onClick={() => setIsMenuOpen(v => !v)}
              >
                {isMenuOpen ? <IoClose size={24} /> : <IoMenu size={24} />}
              </Button>
            )}

            <Link to="/home" className="flex items-center gap-3 group">
              <img src={SemcompLogo} alt="Semcomp Logo" className="w-8 h-8 rounded-full group-hover:brightness-110 transition" />
              <div className="hidden sm:block">
                <p className="text-[10px] tracking-[0.35em] text-slate-500 uppercase leading-none">Backoffice</p>
                <h1 className="text-sm font-comfortaa text-white leading-tight tracking-wide">semcomp</h1>
              </div>
            </Link>
          </div>

          {/* User Info + Logout [Lado direito] */}
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-sky-500/20">
                    {initials}
                  </div>
                  <div className="hidden md:flex flex-col">
                    <span className="text-xs font-medium text-slate-200 leading-none">{user?.name ?? "Admin"}</span>
                    <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider italic">{user?.email}</span>
                  </div>
                </div>

                <div className="h-4 w-px bg-slate-800 mx-1 hidden md:block" />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 gap-2 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm hidden sm:inline">Sair</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsMenuOpen(false)}
          />

          <aside
            className="fixed left-0 top-0 z-50 h-full w-70 bg-slate-950 border-r border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300"
          >
            {/* Links do Menu de Navegação */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-hide">
              {tabs.map(tab => (
                <NavLink
                  key={tab.key}
                  to={tab.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-start gap-4 px-4 py-4 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-sky-500/10 text-sky-300 border border-sky-500/20"
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={`p-2 rounded-lg ${isActive ? "bg-sky-500/20 text-sky-400" : "bg-slate-800 text-slate-500"}`}>
                        {tab.icon}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{tab.label}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{tab.description}</p>
                      </div>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Footer do Drawer */}
            <div className="p-6 text-[10px] text-slate-600 border-t border-slate-900 uppercase tracking-widest text-center shrink-0">
                Semcomp ICMC - Backoffice
            </div>
          </aside>
        </>
      )}
    </>
  );
}