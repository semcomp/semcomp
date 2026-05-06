import Header from "./components/Header";
import { AuthProvider } from "./contexts/AuthContext";
import { Outlet } from "react-router-dom";
import { NotificationProvider } from "@/contexts/NotificationContext";

function App() {
  return (
    <NotificationProvider>
    <AuthProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Header />

        <main className="w-full">
          <Outlet />
        </main>
      </div>
    </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
