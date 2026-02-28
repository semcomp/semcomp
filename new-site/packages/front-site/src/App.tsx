import { useMemo, useState } from "react";
import HomePage from "./pages/Home";
import CronogramaPage from "./pages/Cronograma";
import Header from "./components/Header";
import LoginPage from "./pages/Login";

type TabKey = "home" | "cronograma" | "login";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "home", label: "HOME" },
  { key: "cronograma", label: "CRONOGRAMA" },
  { key: "login", label: "LOGIN" },
];

function App() {
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
    <div className={`min-h-screen text-white`}>
      <Header tabs={tabs} active={activeTab} onChange={setActiveTab} />
      <main className="w-full">{currentPage}</main>
    </div>
  );
}

export default App;