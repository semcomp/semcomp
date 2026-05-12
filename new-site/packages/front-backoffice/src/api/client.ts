import axios, { AxiosError } from "axios";
import type { AxiosInstance } from "axios";
import { BASEURL } from "@/constants/ApiURL";

/**
 * Configuração centralizada do cliente axios
 */
const client: AxiosInstance = axios.create({
  baseURL: BASEURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Callback para quando o token é invalidado (401/403)
 */
let onTokenInvalid: (() => void) | null = null;

/**
 * Registra callback para quando o token é invalidado
 */
export function registerTokenInvalidCallback(callback: () => void) {
  onTokenInvalid = callback;
}

/**
 * Interceptador de requisição: adiciona token se disponível
 */
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("semcomp-backoffice-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Interceptador de resposta: armazena novo token se fornecido
 * e detecta token inválido (401/403)
 */
client.interceptors.response.use(
  (response) => {
    const newToken = response.headers.authorization;
    if (newToken) {
      localStorage.setItem("semcomp-backoffice-token", newToken);
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("semcomp-backoffice-token");
      localStorage.removeItem("semcomp-backoffice-auth");
      if (onTokenInvalid) {
        onTokenInvalid();
      }
    }
    return Promise.reject(error);
  }
);

export default client;