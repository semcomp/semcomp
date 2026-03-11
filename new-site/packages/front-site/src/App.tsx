import { useMemo, useState } from "react";
import HomePage from "./pages/Home";
import CronogramaPage from "./pages/Cronograma";
import Header from "./components/Header";
import LoginPage from "./pages/Login";
import DarkModeToggle from "./components/DarkModeToggle";
import { ThemeProvider } from "./contexts/ThemeContext";

type TabKey = "home" | "cronograma" | "login";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "home", label: "HOME" },
  { key: "cronograma", label: "CRONOGRAMA" },
  { key: "login", label: "LOGIN" },
];

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");

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
    <>
      <Header tabs={tabs} active={activeTab} onChange={setActiveTab} />
      <main className="w-full">{currentPage}</main>
      <DarkModeToggle />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;