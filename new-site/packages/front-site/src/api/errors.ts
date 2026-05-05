import { AxiosError } from "axios";
import type { ApiError } from "@/types/APIResponseType";

/**
 * Extrai mensagem de erro da resposta da API
 * @param error Erro do axios
 * @returns Mensagem de erro formatada
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    // Tenta extrair mensagem do response data
    const data = error.response?.data as ApiError | undefined;
    if (data?.error) return data.error;
    if (data?.message) return data.message;

    // Fallback para status HTTP
    switch (error.response?.status) {
      case 400:
        return "Dados inválidos. Verifique os campos.";
      case 401:
        return "Email ou senha inválidos.";
      case 403:
        return "Acesso negado.";
      case 404:
        return "Recurso não encontrado.";
      case 500:
        return "Erro no servidor. Tente novamente mais tarde.";
      default:
        return error.message || "Erro desconhecido.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Erro desconhecido.";
}

/**
 * Verifica se é erro de rede/conexão
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return !error.response || error.code === "ECONNABORTED";
  }
  return false;
}
