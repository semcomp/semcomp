import { Navigate, createBrowserRouter } from "react-router-dom";
import App from "@/App";
import HomePage from "@/pages/Home";
import LoginPage from "@/pages/Login";
import EventsCRUD from "@/pages/Events";
import SemcompUsers from "@/pages/UserSemcomp";
import BackofficeUsers from "@/pages/UserBackoffice";
import RequireAuth from "@/lib/RequireAuth";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />,
      },
      {
        element: <LoginPage />,
        path: "/login",
      },
      {
        element: <RequireAuth />,
        children: [
          {
            path: "/home",
            element: <HomePage />,
          },
          {
            path: "/events",
            element: <EventsCRUD />,
          },
          {
            path: "/semcompusers",
            element: <SemcompUsers />,
          },
          {
            path: "/backofficeusers",
            element: <BackofficeUsers />,
          },

        ],
      },
    ],
  },
]);
