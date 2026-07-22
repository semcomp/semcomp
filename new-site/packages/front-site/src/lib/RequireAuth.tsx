import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";

export default function RequireAuth() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
}