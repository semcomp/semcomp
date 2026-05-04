import { createContext, useEffect, useMemo, useState } from "react";
import type { UserType } from "@/types/UserType";
import { authAPI, getErrorMessage } from "@/api";
import { useNavigate } from "react-router-dom";
import { useNotification } from "./NotificationContext";

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
          showNotification(err.message, "warning");
          return false;
        }
      },
      logout: () => {
        setUser(null);
        showNotification("Desconectado com sucesso!", "success");
        navigate("/");
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
