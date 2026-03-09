import { useMemo, useState } from "react";
import HomePage from "./pages/Home";
import CronogramaPage from "./pages/Cronograma";
import Header from "./components/Header";
import LoginPage from "./pages/Login";
import { Sun, Moon } from "lucide-react";
import useWindowDimensions from "./hooks/useWindowDimensions";

type TabKey = "home" | "cronograma" | "login";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "home", label: "HOME" },
  { key: "cronograma", label: "CRONOGRAMA" },
  { key: "login", label: "LOGIN" },
];

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { width, height } = useWindowDimensions();

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const currentPage = useMemo(() => {
    switch (activeTab) {
      case "home":
        return <HomePage />;
      case "cronograma":
        return <CronogramaPage />;
      case "login":
        return <LoginPage />;
      default:
        return null;
    }
  }, [activeTab]);

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-semcompDarkBlue text-semcompOffWhite" : "bg-semcompOffWhite text-semcompDarkBlue"} transition-colors duration-300`}>
      <Header tabs={tabs} active={activeTab} onChange={setActiveTab} />
      <main className="w-full">{currentPage}</main>

      {/* Dark Mode Button */}
      <button
        onClick={toggleTheme}
        className={`fixed bottom-4 right-4 flex items-center justify-center w-12 h-12 rounded-full shadow-lg focus:outline-none transition-colors duration-300 ${
          isDarkMode
            ? "bg-semcompOffWhite text-semcompDarkBlue hover:bg-semcompOffWhite/80"
            : "bg-semcompMidDarkBlue text-semcompOffWhite hover:bg-semcompMidDarkBlue/80"
        }`}
      >

        {isDarkMode ? <Sun size={0.02*width} /> : <Moon size={0.02*width} />}
      </button>
    </div>
  );
}

export default App;