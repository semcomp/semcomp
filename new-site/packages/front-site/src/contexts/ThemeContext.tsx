import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "semcomp-theme";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") return true;

    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light") return false;
    if (stored === "dark") return true;

    return true;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <div
        className={`min-h-screen transition-colors duration-300 ${
          isDarkMode
            ? "bg-semcompDarkBlue text-semcompLightBlue"
            : "bg-semcompMidLightBlue text-semcompDarkBlue"
          }`}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};