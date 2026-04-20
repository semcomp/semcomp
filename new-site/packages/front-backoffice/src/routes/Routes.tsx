import { Navigate, createBrowserRouter } from "react-router-dom";
import App from "@/App";
import RequireAuth from "@/lib/RequireAuth";
import LoginPage from "@/pages/Login";
import HomePage from "@/pages/Home";
import EventsCRUD from "@/pages/Events";
import QRCodeReader from "@/pages/Events/QRCodeReader";
import Sections from "@/pages/Section";
import SemcompUsersCRUD from "@/pages/UserSemcomp";
import BackofficeUsersCRUD from "@/pages/UserBackoffice";
import ParticipationCRUD from "@/pages/Participation";
import PermissionsCRUD from "@/pages/Permission";
import NotFoundPage from "@/pages/NotFound";

export const router = createBrowserRouter(
  [
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
              path: "/sections",
              element: <Sections />,
            },
            {
              path: "/events",
              element: <EventsCRUD />,
            },
            {
              path: "/events/:nameEvent/:datetime/qrcode-reader",
              element: <QRCodeReader />,
            },
            {
              path: "/semcomp-users",
              element: <SemcompUsersCRUD />,
            },
            {
              path: "/backoffice-users",
              element: <BackofficeUsersCRUD />,
            },
            {
              path: "/participation",
              element: <ParticipationCRUD />,
            },
            {
              path: "/permissions",
              element: <PermissionsCRUD />,
            },
            {
              path: "*",
              element: <NotFoundPage />,
            }
          ],
        },
      ],
    },
  ],
  {
    basename: "/admin",
  }
);