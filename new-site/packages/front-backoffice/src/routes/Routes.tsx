import { Navigate, createBrowserRouter } from "react-router-dom";
import App from "@/App";
import RequireAuth from "@/lib/RequireAuth";
import RequirePermission from "@/lib/RequirePermission";
import LoginPage from "@/pages/Login";
import HomePage from "@/pages/Home";
import EventsCRUD from "@/pages/Events";
import QRCodeReader from "@/pages/Events/QRCodeReader";
import SemcompUsersCRUD from "@/pages/UserSemcomp";
import BackofficeUsersCRUD from "@/pages/UserBackoffice";
import ParticipationCRUD from "@/pages/Participation";
import ProductsCRUD from "@/pages/Products";
import PermissionsCRUD from "@/pages/Permission";
import PagesAvailability from "@/pages/PagesAvailability";
import SponsorsCRUD from "@/pages/Sponsors";
import SalesCRUD from "@/pages/Sales";
import PapfeDocuments from "@/pages/PapfeDocuments";
import NoticesCRUD from "@/pages/Notices"
import AbsenceJustifications from "@/pages/AbsenceJustifications";
import DashboardPage from "@/pages/Dashboard";
import PresencePage from "@/pages/Dashboard/presence";
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
              element: <RequirePermission section="Eventos" />,
              children: [
                { path: "/events", element: <EventsCRUD /> },
                { path: "/events/:nameEvent/:datetime/qrcode-reader", element: <QRCodeReader /> },
              ],
            },
            {
              element: <RequirePermission section="Usuários Semcomp" />,
              children: [{ path: "/semcomp-users", element: <SemcompUsersCRUD /> }],
            },
            {
              element: <RequirePermission section="Usuários Backoffice" />,
              children: [{ path: "/backoffice-users", element: <BackofficeUsersCRUD /> }],
            },
            {
              element: <RequirePermission section="Participações" />,
              children: [{ path: "/participation", element: <ParticipationCRUD /> }],
            },
            {
              element: <RequirePermission section="Produtos" />,
              children: [{ path: "/products", element: <ProductsCRUD /> }],
            },
            {
              element: <RequirePermission section="Permissões" />,
              children: [{ path: "/permissions", element: <PermissionsCRUD /> }],
            },
            {
              element: <RequirePermission section="Páginas" />,
              children: [{ path: "/pages-availability", element: <PagesAvailability /> }],
            },
            {
              element: <RequirePermission section="Patrocinadores" />,
              children: [{ path: "/sponsors", element: <SponsorsCRUD /> }],
            },
            {
              element: <RequirePermission section="Vendas" />,
              children: [{ path: "/sales", element: <SalesCRUD /> }],
            },
            {
              element: <RequirePermission section="PAPFE" />,
              children: [{ path: "/papfe-documents", element: <PapfeDocuments /> }],
            },
            {
              element: <RequirePermission section="Avisos" />,
              children: [{ path: "/notices", element: <NoticesCRUD /> }],
            },
            {
              element: <RequirePermission section="Justificativas de Ausência" />,
              children: [{ path: "/absence-justifications", element: <AbsenceJustifications /> }],
            },
            {
              element: <RequirePermission section="Dashboard" />,
              children: [
                { path: "/dashboard", element: <DashboardPage /> },
                { path: "/dashboard/presence", element: <PresencePage /> },
              ],
            },
            {
              path: "*",
              element: <NotFoundPage />,
            },
          ],
        },
      ],
    },
  ],
  {
    basename: "/admin",
  }
);
