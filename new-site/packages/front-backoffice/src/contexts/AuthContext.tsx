import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "@/api/auth";

type AuthUser = {
  email: string;
  name: string;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const storageKey = "semcomp-backoffice-auth";

export const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(storageKey);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as AuthUser;
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(storageKey, JSON.stringify(user));
      return;
    }

    window.localStorage.removeItem(storageKey);
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: user !== null,
      user,
      login: async (email: string, password: string) => {
        try {
          const response = await authAPI.login(email, password);
          console.log("Login response:", response);

          // Store token
          localStorage.setItem("semcomp-backoffice-token", response.token);

          const displayName = email.split("@")[0] || "Semcomper";
          setUser({
            email: response.user.email,
            name: displayName,
          });

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
        localStorage.removeItem("semcomp-backoffice-token");
        navigate("/login", { replace: true });
      },
    }),
    [user, navigate]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}