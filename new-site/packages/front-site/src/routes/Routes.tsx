import { createBrowserRouter } from "react-router-dom";
import RequireAuth from "@/lib/RequireAuth";
import FeatureGuard from "@/components/FeatureGuard";

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
        element: <FeatureGuard featureKey="cronograma" />,
        children: [
          {
            path: "cronograma",
            lazy: async () => {
              const { default: CronogramaPage } = await import(
                "@/pages/Cronograma"
              );
              return { Component: CronogramaPage };
            },
          },
        ],
      },
      {
        element: <FeatureGuard featureKey="login" />,
        children: [
          {
            path: "login",
            lazy: async () => {
              const { default: LoginPage } = await import("@/pages/Login");
              return { Component: LoginPage };
            },
          },
          {
            path: "reset-password",
            lazy: async () => {
              const { default: ResetPasswordPage } = await import("@/pages/ResetPassword");
              return { Component: ResetPasswordPage };
            },
          },
        ],
      },
      {
        path: "verify-email",
        lazy: async () => {
          const { default: VerifyEmailPage } = await import("@/pages/VerifyEmail");
          return { Component: VerifyEmailPage };
        },
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <FeatureGuard featureKey="login" />,
            children: [
              {
                path: "profile",
                lazy: async () => {
                  const { default: ProfilePage } = await import("@/pages/Profile");
                  return { Component: ProfilePage };
                },
              }
            ],  
          },
          {
            element: <FeatureGuard featureKey="loja" />,
            children: [
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
              {
                path: "loja/checkout",
                lazy: async () => {
                  const { default: CheckoutPage } = await import("@/pages/Store/Checkout");
                  return { Component: CheckoutPage };
                },
              },
            ],
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
