import { Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/useTheme";
import useWindowDimensions from "../hooks/useWindowDimensions";

const DarkModeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { width } = useWindowDimensions();

  return (
    <button
      onClick={toggleTheme}
      className={`fixed bottom-8 right-8 flex items-center justify-center w-12 h-12 rounded-full shadow-lg focus:outline-none transition-colors duration-300 z-9999 ${
      isDarkMode
        ? "bg-semcompOffWhite text-semcompDarkBlue hover:bg-semcompOffWhite/80"
        : "bg-semcompMidLightBlue text-semcompOffWhite hover:bg-semcompMidDarkBlue/80"
      }`}
    >
      {isDarkMode ? <Sun size={Math.max(20, 0.015 * width)} /> : <Moon size={Math.max(20, 0.015 * width)} />}
    </button>
  );
};

export default DarkModeToggle;