import { useLayoutEffect, useRef, useState, useEffect } from "react";
import { IoMenu } from "react-icons/io5";
import { ChevronRight } from "lucide-react";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { useTheme } from "@/contexts/useTheme";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";

type TabKey = "home" | "cronograma" | "perfil";

const allTabs: Array<{ key: TabKey; label: string; path: string }> = [
  { key: "home", label: "HOME", path: "/" },
  { key: "cronograma", label: "CRONOGRAMA", path: "/cronograma" },
  { key: "perfil", label: "PERFIL", path: "/perfil" },
];

export default function Header() {
  const { isDarkMode } = useTheme();
  const { width } = useWindowDimensions();
  const location = useLocation();
  
  //Simulação de Login
  const { isAuthenticated } = useAuth(); 

  //Filtro de abas
  const visibleTabs = allTabs.filter((tab) => {// ajustar isso depois para mostrar o perfil apenas para autenticados
    if (tab.key === "perfil") return true; // Sempre mostrar "Perfil", mesmo para não autenticados
    return true;
  });

  //Achar a ativa
  const activeTabObj = visibleTabs.find((t) => t.path === location.pathname);
  const active = activeTabObj ? activeTabObj.key : "home";

  const btnRefs = useRef<Record<TabKey, HTMLAnchorElement | null>>({
    home: null,
    cronograma: null,
    perfil: null,
  });

  const navRef = useRef<HTMLElement | null>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useLayoutEffect(() => {
    const el = btnRefs.current[active];
    const navEl = navRef.current;

    if (el && navEl) {
      const elRect = el.getBoundingClientRect();
      const navRect = navEl.getBoundingClientRect();
      const newLeft = elRect.left - navRect.left;
      const newWidth = elRect.width;

      setIndicator((prev) => {
        if (prev.left === newLeft && prev.width === newWidth) {
          return prev;
        }
        return { left: newLeft, width: newWidth };
      });
    }
  }, [active, width, visibleTabs.length]); // Adicionado dependências específicas

  const isMobile = width < 768;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      hasScrolled ? "bg-semcompDarkBlue/90 backdrop-blur-sm shadow-lg" : "bg-transparent"
    }`}>
      <div className="mx-auto flex w-full items-center justify-end px-4 py-4 md:px-12 md:py-6">

        {isMobile ? (
          <div className="relative">
            <button
              className="text-semcompOffWhite text-2xl"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <IoMenu />
            </button>
            {isMenuOpen && (
              <nav className="absolute top-full right-0 mt-3 w-48 bg-semcompDarkBlue/80 backdrop-blur-sm border border-white/10 shadow-xl flex flex-col items-center gap-1 p-4 rounded-xl">
                {visibleTabs.map((tab) => (
                  <Link
                    key={tab.key}
                    to={tab.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-3 py-2 text-sm font-bold transition-all flex items-center gap-2 ${
                      active === tab.key ? "text-semcompOffWhite" : "text-white/60"
                    }`}
                  >
                    {tab.label}
                    {tab.key === "perfil" && <ChevronRight size={16} />}
                  </Link>
                ))}
              </nav>
            )}
          </div>
        ) : (
          <nav ref={navRef} className="relative flex items-center gap-2 p-1">
            {/* Barrinha indicadora */}
            <span
              className="absolute bottom-0 h-0.5 bg-semcompOffWhite transition-all duration-300 ease-out"
              style={{ left: indicator.left, width: indicator.width }}
            />
            {visibleTabs.map((tab) => (
              <Link
                key={tab.key}
                to={tab.path}
                ref={(el) => { btnRefs.current[tab.key] = el; }}
                className={`relative px-4 py-2 text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                  active === tab.key ? "text-semcompOffWhite scale-105" : "text-semcompOffWhite/70 hover:text-white"
                }`}
              >
                {tab.label}
                {tab.key === "perfil" && <ChevronRight size={16} />}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}