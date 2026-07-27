window.addEventListener("error", (e) =>
  console.error("GLOBAL ERROR:", e.error)
);
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/Routes";
import RouteLoading from "./components/RouteLoading";
import { FeatureFlagsProvider } from "./contexts/FeatureFlagsContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  // agora o router é renderizado ao inves do app diretamente
  <StrictMode>
    <Suspense fallback={<RouteLoading />}>
      <FeatureFlagsProvider>
        <RouterProvider router={router}></RouterProvider>
      </FeatureFlagsProvider>
    </Suspense>
  </StrictMode>
);
