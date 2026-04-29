import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { UserType } from "@/types/UserType";
import axios from "axios";
import { BASEURL } from "@/constants/ApiURL";
import Notification from "@/components/Notification";

type AuthContextValue = {
  isAuthenticated: boolean;
  user: UserType | null;
  login: (email: string, password: string) => void;
  logout: () => void;
};

const storageKey = "semcomp-site-auth";

const AuthContext = createContext<AuthContextValue | null>(null);

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
  const [errorMessage, setErrorMessage] = useState("");

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
          // Faz a chamada da api com o método POST para tentativa de login
          const response = await axios.post(`${BASEURL}/login`, {
            email: email,
            password: password,
          });

          // Teste de login
          console.log("deu certo");

          // Se a requisição deu certo, adiciona no user os dados de token, nome e email
          setUser({
            token: response.data.token,
            name: response.data.user.name,
            email: response.data.user.email,
          });
        } catch (err: any) {
          setErrorMessage(err.message);
          <Notification
            message={errorMessage}
            type="warning"
            visible={Boolean(errorMessage)}
            onClose={() => setErrorMessage("")}
          />;
        }
      },
      logout: () => setUser(null),
    }),
    [user]
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
