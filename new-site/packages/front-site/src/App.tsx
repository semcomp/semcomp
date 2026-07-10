/* importa header, darkmode, tema e o 
 outlet (layout onde os componentes especificos serão reenderizados) */

import Header from "./components/Header";
import DarkModeToggle from "./components/DarkModeToggle";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Outlet } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { CartProvider } from "./contexts/CartContext";

function App() {

  return (
    /**
     * o cabecalha e o trigger de tema são conteudo fixos entao estao sempre
     * presentes na pagina, o resto é renderizado no outlet, com o conteudo variando
     * com base na pagina na qual o usuario esta presente.
     */
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
