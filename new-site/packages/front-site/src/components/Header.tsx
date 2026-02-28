import { useLayoutEffect, useRef, useState } from "react";
import LogoSemcomp from "../assets/img/semcomp/logo_default_branco.png";
import { COLORS } from "../constants/Colors";

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
    <header className={`sticky top-0 z-10 border-b bg-${COLORS.MAIN_BLUE}`}>
      <div className="mx-auto flex w-full items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <img src={LogoSemcomp} alt="Logo da Semcomp" className="h-8 w-auto" />
          <h1 className="text-xl font-display text-white">semcomp</h1>
        </div>
        <nav
          ref={navRef}
          className="relative flex items-center gap-2 p-1 transition-transform"
        >
          <span
            aria-hidden
            className="absolute bottom-0 h-0.5 bg-white transition-all duration-300 ease-out"
            style={{ left: indicator.left, width: indicator.width }}
          />
          {tabs.map((tab) => {
            const isActive = active === tab.key;
            return (
              <button
                key={tab.key}
                ref={(el) => { btnRefs.current[tab.key] = el; }}
                type="button"
                onClick={() => onChange(tab.key)}
                className={`relative px-4 py-2 text-sm font-bold transition-colors duration-200 ${
                  isActive ? "text-white" : "text-slate-300 hover:text-slate-200"
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
