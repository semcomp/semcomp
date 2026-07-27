import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = "semcomp-theme";

const getInitialTheme = (): boolean => {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light") return false;
  if (stored === "dark") return true;
  // Sem preferência salva → respeita o sistema operacional
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(getInitialTheme);

  useEffect(() => {
    // Aplica .dark no <html> — habilita todos os dark: variants do Tailwind
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem(THEME_KEY, isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
