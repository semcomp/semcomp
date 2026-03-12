import { useLayoutEffect, useRef, useState } from "react";
import LogoSemcomp from "../assets/img/semcomp/logo_default_branco.png";
import { IoMenu } from "react-icons/io5";
import useWindowDimensions from "@/hooks/useWindowDimensions";

type TabKey = "home" | "cronograma" | "login" ;

export default function Header({
  tabs,
  active,
  onChange,
}: {
  tabs: Array<{ key: TabKey; label: string }>;
  active: TabKey;
  onChange: (k: TabKey) => void;
}) {
  const btnRefs = useRef<Record<TabKey, HTMLButtonElement | null>>({
    home: null,
    cronograma: null,
    login: null,
  });
  const navRef = useRef<HTMLElement | null>(null);
  const { width } = useWindowDimensions();
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useLayoutEffect(() => { 
    const el = btnRefs.current[active];
    const navEl = navRef.current;
    if (el && navEl) {
      const elRect = el.getBoundingClientRect();
      const navRect = navEl.getBoundingClientRect();
      setIndicator({ left: elRect.left - navRect.left, width: elRect.width });
    }
  }, [active, tabs]);

  const isMobile = width < 768;

  return (
    <header className="sticky top-0 z-50 border-b bg-semcompDarkBlue transition-transform duration-300 ease-in-out">
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
                    <button
                      key={tab.key}
                      ref={(el) => {
                        btnRefs.current[tab.key] = el;
                      }}
                      type="button"
                      onClick={() => {
                        onChange(tab.key);
                        setIsMenuOpen(false);
                      }}
                      className={`relative px-3 py-1 text-xs font-bold transition-all duration-200 transform md:px-4 md:py-2 md:text-sm ${
                        isActive
                          ? "text-semcompOffWhite scale-110"
                          : "text-semcompOffWhite/70 hover:text-semcompOffWhite/90 hover:scale-110"
                      }`}
                    >
                      {tab.label}
                    </button>
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
                <button
                  key={tab.key}
                  ref={(el) => {
                    btnRefs.current[tab.key] = el;
                  }}
                  type="button"
                  onClick={() => onChange(tab.key)}
                  className={`relative px-3 py-1 text-xs font-bold transition-all duration-200 transform md:px-4 md:py-2 md:text-sm ${
                    isActive
                      ? "text-semcompOffWhite scale-110"
                      : "text-semcompOffWhite/70 hover:text-semcompOffWhite/90 hover:scale-110"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
