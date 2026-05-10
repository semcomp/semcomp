/**
 * Hook para acessar o token JWT armazenado
 * @returns Token JWT do localStorage ou null se não existir
 */
export function useToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("semcomp-site-token");
}
