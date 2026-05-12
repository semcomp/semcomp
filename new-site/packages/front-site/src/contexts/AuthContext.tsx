
import { createContext, useEffect, useMemo, useState } from "react";
import type { UserType } from "@/types/UserType";
import { authAPI } from "@/api";
import { useNavigate } from "react-router-dom";
import { useNotification } from "./NotificationContext";
import { registerTokenInvalidCallback } from "@/api/client";

type AuthContextValue = {
  isAuthenticated: boolean;
  user: UserType | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const storageKey = "semcomp-site-auth";

export const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): UserType | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(storageKey);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as UserType;
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(() => readStoredUser());
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(storageKey, JSON.stringify(user));
      return;
    }

    window.localStorage.removeItem(storageKey);
  }, [user]);

  // Registra callback para quando o token é invalidado (401/403)
  useEffect(() => {
    const handleTokenInvalid = () => {
      setUser(null);
      showNotification("Sessão expirada. Faça login novamente.", "warning");
      navigate("/login", { replace: true });
    };

    registerTokenInvalidCallback(handleTokenInvalid);
  }, [navigate, showNotification]);

  // Valida o token ao montar o provider
  useEffect(() => {
    if (!user) return;

    const validateToken = async () => {
      try {
        await authAPI.getProfile();
      } catch (err: any) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          setUser(null);
          showNotification("Sessão expirada. Faça login novamente.", "warning");
          navigate("/login", { replace: true });
        }
      }
    };

    validateToken();
  }, [user, navigate, showNotification]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: user !== null,
      user,
      login: async (email: string, password: string) => {
        try {
          const response = await authAPI.login(email, password);

          // Armazena token
          localStorage.setItem("semcomp-site-token", response.token);

          // Atualiza user state 
          setUser({
            user_number: response.user.user_number,
            name: response.user.name,
            email: response.user.email,
          });

          showNotification(response.message, "success");
          navigate("/profile");
          return true;
        } catch (err: any) {
            const message =
              err?.response?.data?.error || err?.response?.data?.message || err?.message || "Erro no login";
            showNotification(message, "warning");
          return false;
        }
      },
      logout: () => {
        setUser(null);
        localStorage.removeItem("semcomp-site-token");
        showNotification("Desconectado com sucesso!", "success");
        navigate("/");
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
