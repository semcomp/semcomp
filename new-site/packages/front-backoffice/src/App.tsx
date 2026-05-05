import Header from "./components/Header";
import { AuthProvider } from "./contexts/AuthContext";
import { Outlet } from "react-router-dom";

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Header />

        <main className="w-full">
          <Outlet />
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
