// import dos componentes para as paginas
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import HomePage from "../pages/Home";
import CronogramaPage from "../pages/Cronograma";
import LoginPage from "../pages/Login/login";
import Profile from "@/pages/Perfil/profile";

// criação do router
export const router = createBrowserRouter([
  {
    path: "/", // path base onde iremos reenderizar outras paginas dentro dessa pagina 
    element: <App />,
    children: [ // paths das paginas filhas que serão reenderizadas dentro de app
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/cronograma",
        element: <CronogramaPage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/perfil",
        element: <Profile />,
      },
    ],
  },
]);
