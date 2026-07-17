import { createBrowserRouter } from "react-router-dom";
import RequireAuth from "@/lib/RequireAuth";
import { useAuth } from "@/contexts/useAuth";
import ProfilePage from "@/pages/Profile";

function ProfileRoute() {
  const { user } = useAuth();

  return (
    <ProfilePage
      user_number={user?.user_number}
      name={user?.name}
      email={user?.email}
      presence_rate={user?.presence_rate}
    />
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    lazy: async () => {
      const { default: AppLayout } = await import("@/App");
      return { Component: AppLayout };
    },
    children: [
      {
        index: true,
        lazy: async () => {
          const { default: HomePage } = await import("@/pages/Home");
          return { Component: HomePage };
        },
      },
      {
        path: "cronograma",
        lazy: async () => {
          const { default: CronogramaPage } = await import("@/pages/Cronograma");
          return { Component: CronogramaPage };
        },
      },
      {
        path: "login",
        lazy: async () => {
          const { default: LoginPage } = await import("@/pages/Login");
          return { Component: LoginPage };
        },
      },
      {
        element: <RequireAuth />,
        children: [
          {
            path: "profile",
            element: <ProfileRoute />,
          },
          {
            path: "loja",
            lazy: async () => {
              const { default: StorePage } = await import("@/pages/Store/StorePage");
              return { Component: StorePage };
            },
          },
          {
            path: "loja/carrinho",
            lazy: async () => {
              const { default: CartPage } = await import("@/pages/Store/Cart");
              return { Component: CartPage };
            },
          },
          
        ],
      },
      {
        path: "*",
        lazy: async () => {
          const { default: NotFoundPage } = await import("@/pages/NotFound");
          return { Component: NotFoundPage };
        },
      },
    ],
  },
]);
