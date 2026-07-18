import { createBrowserRouter } from "react-router-dom";
import RequireAuth from "@/lib/RequireAuth";

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
        path: "verify-email",
        lazy: async () => {
          const { default: VerifyEmailPage } = await import("@/pages/VerifyEmail");
          return { Component: VerifyEmailPage };
        },
      },
      {
        path: "reset-password",
        lazy: async () => {
          const { default: ResetPasswordPage } = await import("@/pages/ResetPassword");
          return { Component: ResetPasswordPage };
        },
      },
      {
        element: <RequireAuth />,
        children: [
          {
            path: "profile",
            lazy: async () => {
              const { default: ProfilePage } = await import("@/pages/Profile");
              return { Component: ProfilePage };
            }
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
