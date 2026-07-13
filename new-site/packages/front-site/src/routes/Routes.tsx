import { createBrowserRouter } from "react-router-dom";
// import RequireAuth from "@/lib/RequireAuth";

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
      // {
      //   path: "cronograma",
      //   lazy: async () => {
      //     const { default: CronogramaPage } = await import("@/pages/Cronograma");
      //     return { Component: CronogramaPage };
      //   },
      // },
      {
        path: "login",
        lazy: async () => {
          const { default: LoginPage } = await import("@/pages/Login");
          return { Component: LoginPage };
        },
      },
      // {
      //   element: <RequireAuth />,
      //   children: [
      //     {
      //       path: "profile",
      //       lazy: async () => {
      //         const { default: ProfilePage } = await import("@/pages/Profile");
      //         return { Component: ProfilePage };
      //       }
      //     },
      //   ],
      // },
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
