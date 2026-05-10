import { useContext } from "react";
import { AuthContext } from "./AuthContext";

/**
 * Hook para acessar contexto de autenticação
 * @returns Valor do contexto (user, isAuthenticated, login, logout)
 * @throws Erro se usado fora de AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
