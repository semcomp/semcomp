import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { UserType } from "@/types/UserType";
import type { APIResponse } from "@/types/APIResponseType";
import axios from "axios";
import { BASEURL } from "@/constants/ApiURL";
import { useNavigate } from "react-router-dom";

type AuthContextValue = {
  isAuthenticated: boolean;
  user: UserType | null;
  login: (email: string, password: string) => Promise<APIResponse>;
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

          navigate("/profile");

          const apiResponse: APIResponse = {
            message: response.data.message as string,
            type: "success",
          };
          return apiResponse;
        } catch (err: any) {
          const apiResponse: APIResponse = {
            message: err.message as string,
            type: "warning",
          };
          return apiResponse;
        }
      },
      logout: () => {
        setUser(null);
        navigate("/");
      },
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
