import { useEffect } from "react";
import Header from "./components/Header";
import DarkModeToggle from "./components/DarkModeToggle";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Outlet } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { CartProvider } from "./contexts/CartContext";
import { recordVisit } from "./api/stats";

function App() {
  useEffect(() => { recordVisit(); }, []);

  return (
    <NotificationProvider>
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
        
          <Header />
          <main className="w-full">
            <Outlet />
          </main>
          <DarkModeToggle />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
    </NotificationProvider>
  );
}

export default App;
