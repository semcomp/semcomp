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
 */
client.interceptors.response.use(
  (response) => {
    const newToken = response.headers.authorization;
    if (newToken) {
      localStorage.setItem("semcomp-backoffice-token", newToken);
    }
    return response;
  },
  (error: AxiosError) => Promise.reject(error)
);

export default client;
