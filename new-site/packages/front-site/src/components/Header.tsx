import { useLayoutEffect, useRef, useState } from "react";
import LogoSemcomp from "../assets/img/semcomp/logo_default_branco.webp";
import { IoMenu } from "react-icons/io5";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { useTheme } from "@/contexts/useTheme";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";

const COFFEE_FORM_URL = "https://forms.gle/VnA9hhQcyZTqDzqr7";

type TabKey = "home" | "cronograma" | "coffee" | "login" | "profile" ;

const allTabs: Array<{ key: TabKey; label: string; path: string }> = [
  { key: "home", label: "HOME", path: "/" },
  { key: "cronograma", label: "CRONOGRAMA", path: "/cronograma" },
  { key: "coffee", label: "COFFEE", path: "/coffee" }, 
  { key: "login", label: "LOGIN", path: "/login" },
  { key: "profile", label: "PROFILE", path: "/profile" },
];

export default function Header() {
  const { isDarkMode } = useTheme();
  const { width } = useWindowDimensions();
  const location = useLocation();
  
  //Simulação de Login
  const { isAuthenticated } = useAuth(); 

  //Filtro de abas
  const visibleTabs = allTabs.filter((tab) => {
    if (tab.key === "profile") return isAuthenticated;
    if (tab.key === "login") return !isAuthenticated;
    return true;
  });

  //Achar a ativa
  const activeTabObj = visibleTabs.find((t) => t.path === location.pathname);
  const active = activeTabObj ? activeTabObj.key : "home";

  const btnRefs = useRef<Record<TabKey, HTMLAnchorElement | null>>({
    home: null,
    cronograma: null,
    coffee: null,
    login: null,
    profile: null,
  });

  const navRef = useRef<HTMLElement | null>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
  const headerColor = isDarkMode ? "bg-semcompDarkBlue" : "bg-semcompMidLightBlue";

  return (
    <header className={`sticky top-0 z-50 border-b ${headerColor} transition-all duration-300 ease-in-out`}>
      <div className="mx-auto flex w-full items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center gap-2">
          <img src={LogoSemcomp} alt="Logo da Semcomp" className="h-6 w-auto md:h-8" />
          <h1 className="text-lg font-display text-semcompOffWhite md:text-xl">semcomp</h1>
        </div>

        {isMobile ? (
          <div className="relative">
            <button
              className="text-semcompOffWhite text-2xl"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <IoMenu />
            </button>
            {isMenuOpen && (
              <nav className="absolute top-full right-0 mt-3 w-48 bg-semcompDarkBlue border border-white/10 shadow-xl flex flex-col items-center gap-1 p-4 rounded-xl">
                {visibleTabs.map((tab) => (
                  tab.key === "coffee" ? (
                    <a
                      key={tab.key}
                      href={COFFEE_FORM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsMenuOpen(false)}
                      className={`px-3 py-2 text-sm font-bold transition-all ${
                        active === tab.key ? "text-semcompOffWhite" : "text-white/60"
                      }`}
                    >
                      {tab.label}
                    </a>
                  ) : (
                    <Link
                      key={tab.key}
                      to={tab.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`px-3 py-2 text-sm font-bold transition-all ${
                        active === tab.key ? "text-semcompOffWhite" : "text-white/60"
                      }`}
                    >
                      {tab.label}
                    </Link>
                  )
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
              tab.key === "coffee" ? (
                <a
                  key={tab.key}
                  href={COFFEE_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  ref={(el) => { btnRefs.current[tab.key] = el; }}
                  className={`relative px-4 py-2 text-sm font-bold transition-all duration-200 ${
                    active === tab.key ? "text-semcompOffWhite scale-105" : "text-semcompOffWhite/70 hover:text-white"
                  }`}
                >
                  {tab.label}
                </a>
              ) : (
                <Link
                  key={tab.key}
                  to={tab.path}
                  ref={(el) => { btnRefs.current[tab.key] = el; }}
                  className={`relative px-4 py-2 text-sm font-bold transition-all duration-200 ${
                    active === tab.key ? "text-semcompOffWhite scale-105" : "text-semcompOffWhite/70 hover:text-white"
                  }`}
                >
                  {tab.label}
                </Link>
              )
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}