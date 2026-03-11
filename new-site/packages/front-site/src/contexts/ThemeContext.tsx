import { createContext, useState } from "react";
import type { ReactNode } from "react";

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <div
        className={`min-h-screen transition-colors duration-300 ${
          isDarkMode
            ? "bg-semcompDarkBlue text-semcompOffWhite"
            : "bg-semcompOffWhite text-semcompDarkBlue"
        }`}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};