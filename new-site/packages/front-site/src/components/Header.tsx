import { useLayoutEffect, useRef, useState, useEffect } from "react";
import { Menu } from "lucide-react";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFeatureFlags } from "@/contexts/FeatureFlagsContext";
import type { FeatureKey } from "@/types/FeatureKeyType";

type TabKey = "home" | "loja" | "login" | "perfil" | "cronograma" | "riddle";

export default function Header() {
  const { width } = useWindowDimensions();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { isFeatureEnabled } = useFeatureFlags();

  const allTabs: Array<{ key: TabKey; featureKey?: FeatureKey; label: string; path: string; status: boolean }> = [
    { key: "home", featureKey: "home", label: "HOME", path: "/", status: true },
    { key: "cronograma", featureKey: "cronograma", label: "CRONOGRAMA", path: "/cronograma", status: true },
    { key: "loja", featureKey: "loja", label: "LOJA", path: "/loja", status: isAuthenticated },
    { key: "riddle", featureKey: "riddle", label: "RIDDLE", path: "/riddle", status: isAuthenticated },
    { key: "login", featureKey: "login", label: "INSCRIÇÃO", path: "/login", status: !isAuthenticated },
    { key: "perfil", featureKey: "login", label: "PERFIL", path: "/profile", status: isAuthenticated },
  ];

  const visibleTabs = allTabs.filter(tab =>
    tab.status && (tab.featureKey ? isFeatureEnabled(tab.featureKey) : true)
    
  );

  // A seção "loja" fica ativa em qualquer rota /loja/* (loja, carrinho, checkout
  // e pagamentos pendentes) — não só em /loja exato.
  const activeTabObj = visibleTabs.find(
    (t) =>
      t.path === location.pathname ||
      (t.path === "/loja" && location.pathname.startsWith("/loja"))
  );
  const active = activeTabObj ? activeTabObj.key : "home";

  const btnRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

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
  }, [active, width, visibleTabs.length]);

  const isMobile = width < 768;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 pt-[env(safe-area-inset-top)] ${
      hasScrolled ? "bg-semcompMidLightBlue dark:bg-semcompDarkBlue backdrop-blur-sm shadow-lg" : "bg-transparent"
    }`}>
      <div className="mx-auto flex w-[80%] items-center justify-end pt-5 pb-5">

        {isMobile ? (
          <div className="relative">
            <button
              className="text-semcompOffWhite text-2xl"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <Menu />
            </button>
            {isMenuOpen && (
              <nav className="absolute top-full right-0 mt-3 w-48 bg-semcompDarkBlue/80 backdrop-blur-sm border border-white/10 shadow-xl flex flex-col items-center gap-1 p-4 rounded-xl">
                {visibleTabs.map((tab) => (
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
                ))}
              </nav>
            )}
          </div>
        ) : (
          <nav ref={navRef} className="relative flex items-center gap-2 p-1">
            <span
              className={`absolute bottom-0 h-0.5 transition-all duration-300 ease-out bg-white`}
              style={{ left: indicator.left, width: indicator.width }}
            />
            {visibleTabs.map((tab) => (
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
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}