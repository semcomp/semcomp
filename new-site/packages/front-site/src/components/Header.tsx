import { useLayoutEffect, useRef, useState } from "react";
import LogoSemcomp from "../assets/img/semcomp/logo_default_branco.png";
import { IoMenu } from "react-icons/io5";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { useTheme } from "@/contexts/useTheme";
import { Link, useLocation } from "react-router-dom";

// definição de Tabkey
type TabKey = "home" | "cronograma" | "login" ;


// Tabs como array de Tabkey
const tabs: Array<{ key: TabKey; label: string; path: string }> = [
  { key: "home", label: "HOME", path: "/" },
  { key: "cronograma", label: "CRONOGRAMA", path: "/cronograma" },
  { key: "login", label: "LOGIN", path: "/login" },
];

export default function Header() {
  const location = useLocation(); //pega qual o url atual
  const active = tabs.find((t) => t.path === location.pathname)?.key || "home"; //checa qual a tab ativa

  // referencias do menu
  const btnRefs = useRef<Record<TabKey, HTMLAnchorElement | null>>({
    home: null,
    cronograma: null,
    login: null,
  });


  const { isDarkMode } = useTheme(); // consome o tema da aplicação
  const navRef = useRef<HTMLElement | null>(null); // referencia para a nabar
  const { width, height } = useWindowDimensions(); // largura da aplicação
  const [indicator, setIndicator] = useState({ left: 0, width: 0 }); // state indicator
  const [isMenuOpen, setIsMenuOpen] = useState(false); // state para o estado do menu

  useLayoutEffect(() => {  // hook para modificar a posição da barrinha branca
    const el = btnRefs.current[active];
    const navEl = navRef.current;
    if (el && navEl) { // se os elementos existem
      const elRect = el.getBoundingClientRect(); // posicao do elemento atual
      const navRect = navEl.getBoundingClientRect(); // posicao da navbar
      setIndicator({ left: elRect.left - navRect.left, width: elRect.width }); // atribui a nova posicao para o indicador("barrinha branca")
    }
  }, [active, tabs]);

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
          <>
            <button
              className="md:hidden text-semcompOffWhite text-2xl"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              <IoMenu />
            </button>
            {isMenuOpen && (
              <nav
                ref={navRef}
                className="absolute top-full left-0 w-full bg-semcompDarkBlue flex flex-col items-center gap-1 p-4 transition-transform duration-300 ease-in-out"
              >
                { !isMobile && (
                  <span
                    aria-hidden
                    className="absolute bottom-0 h-0.5 bg-semcompOffWhite transition-all duration-300 ease-out"
                    style={{ left: indicator.left, width: indicator.width }}
                  />
                )}
                {tabs.map((tab) => {
                  const isActive = active === tab.key;
                  return (
                    <Link
                      key={tab.key}
                      to={tab.path}
                      ref={(el: HTMLAnchorElement | null) => {
                        btnRefs.current[tab.key] = el;
                      }}
                      onClick={() => setIsMenuOpen(false)}
                      className={`relative px-3 py-1 text-xs font-bold transition-all duration-200 transform md:px-4 md:py-2 md:text-sm ${
                        isActive
                          ? "text-semcompOffWhite scale-110"
                          : "text-semcompOffWhite/70 hover:text-semcompOffWhite/90 hover:scale-110"
                      }`}
                    >
                      {tab.label}
                    </Link>
                  );
                })}
              </nav>
            )}
          </>
        ) : (
          <nav
            ref={navRef}
            className="relative flex items-center gap-2 p-1"
          >
            <span
              aria-hidden
              className="absolute bottom-0 h-0.5 bg-semcompOffWhite transition-all duration-300 ease-out"
              style={{ left: indicator.left, width: indicator.width }}
            />
            {tabs.map((tab) => {
              const isActive = active === tab.key;
              return (
                <Link
                  key={tab.key}
                  to={tab.path}
                  ref={(el: HTMLAnchorElement | null) => {
                    btnRefs.current[tab.key] = el;
                  }}
                  className={`relative px-3 py-1 text-xs font-bold transition-all duration-200 transform md:px-4 md:py-2 md:text-sm ${
                    isActive
                      ? "text-semcompOffWhite scale-110"
                      : "text-semcompOffWhite/70 hover:text-semcompOffWhite/90 hover:scale-110"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
