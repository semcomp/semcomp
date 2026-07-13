import { Navigate, Outlet } from "react-router-dom";
import { useHasPermission } from "@/contexts/AuthContext";

export default function RequirePermission({ section }: { section: string }) {
  const allowed = useHasPermission(section, "R");
  if (!allowed) return <Navigate to="/home" replace />;
  return <Outlet />;
}
