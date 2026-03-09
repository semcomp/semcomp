import { useLayoutEffect, useRef, useState } from "react";
import LogoSemcomp from "../assets/img/semcomp/logo_default_branco.png";

type TabKey = "home" | "cronograma" | "login";

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
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const el = btnRefs.current[active];
    const navEl = navRef.current;
    if (el && navEl) {
      const elRect = el.getBoundingClientRect();
      const navRect = navEl.getBoundingClientRect();
      setIndicator({ left: elRect.left - navRect.left, width: elRect.width });
    }
  }, [active, tabs]);

  return (
    <header className="sticky top-0 z-10 border-b bg-semcompDarkBlue transition-transform duration-300 ease-in-out">
      <div className="mx-auto flex w-full items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <img src={LogoSemcomp} alt="Logo da Semcomp" className="h-8 w-auto" />
          <h1 className="text-xl font-display text-semcompOffWhite">semcomp</h1>
        </div>
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
                className={`relative px-4 py-2 text-sm font-bold transition-all duration-200 transform ${
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
      </div>
    </header>
  );
}
