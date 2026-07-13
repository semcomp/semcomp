import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "@/api/auth";
import { permissionsAPI } from "@/api/permissions";
import type { BackofficePermission } from "@/types/APIResponseType";

type AuthUser = {
  email: string;
  name: string;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  permissions: BackofficePermission[];
  refreshPermissions: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const USER_KEY = "semcomp-backoffice-auth";
const PERMS_KEY = "semcomp-backoffice-permissions";

export const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    window.localStorage.removeItem(USER_KEY);
    return null;
  }
}

function readStoredPermissions(): BackofficePermission[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(PERMS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as BackofficePermission[];
  } catch {
    return [];
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [permissions, setPermissions] = useState<BackofficePermission[]>(() => readStoredPermissions());
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  useEffect(() => {
    window.localStorage.setItem(PERMS_KEY, JSON.stringify(permissions));
  }, [permissions]);

  const refreshPermissions = useCallback(async () => {
    if (!user) return;
    const perms = await permissionsAPI.getMe();
    if (perms !== null) {
      // null = transient error → keep cached permissions
      setPermissions(perms);
    }
  }, [user?.email]);

  // Sync permissions with the backend whenever a session is resumed from localStorage.
  const didSyncRef = useRef(false);
  useEffect(() => {
    if (didSyncRef.current) return;
    didSyncRef.current = true;
    if (user) refreshPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: user !== null && !!localStorage.getItem("semcomp-backoffice-token"),
      user,
      permissions,
      refreshPermissions,
      login: async (email: string, password: string) => {
        try {
          const response = await authAPI.login(email, password);
          localStorage.setItem("semcomp-backoffice-token", response.token);
          const displayName = email.split("@")[0] || "Semcomper";
          setUser({ email: response.user.email, name: displayName });
          setPermissions(response.permissions ?? []);
          navigate("/home", { replace: true });
          return true;
        } catch (err: any) {
          const message =
            err?.response?.data?.error ||
            err?.response?.data?.message ||
            err?.message ||
            "Erro ao fazer login";
          console.error("Login error:", message);
          return false;
        }
      },
      logout: () => {
        setUser(null);
        setPermissions([]);
        localStorage.removeItem("semcomp-backoffice-token");
        localStorage.removeItem(PERMS_KEY);
        navigate("/login", { replace: true });
      },
    }),
    [user, permissions, navigate, refreshPermissions]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export function useHasPermission(section: string, level: "R" | "RW"): boolean {
  const { permissions } = useAuth();
  const entry = permissions.find(p => p.section_name === section);
  if (!entry) return false;
  if (level === "R") return true; // "R" ou "RW" satisfazem leitura
  return entry.permission_type === "RW";
}
