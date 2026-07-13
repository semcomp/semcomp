import Header from "./components/Header";
import DarkModeToggle from "./components/DarkModeToggle";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Outlet } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";

function App() {
  return (
    <NotificationProvider>
      <ThemeProvider>
        <AuthProvider>
          <Header />
          <main className="w-full">
            <Outlet />
          </main>
          <DarkModeToggle />
        </AuthProvider>
      </ThemeProvider>
    </NotificationProvider>
  );
}

export default App;
