import axios, { AxiosError } from "axios";
import type { AxiosInstance } from "axios";
import { BASEURL } from "@/constants/ApiURL";

const UNAUTHENTICATED_ENDPOINTS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/resend-verification",
];

const client: AxiosInstance = axios.create({
  baseURL: BASEURL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const url = error.config?.url ?? "";
    const isPublicEndpoint = UNAUTHENTICATED_ENDPOINTS.some((p) => url === p);

    if (error.response?.status === 401 && !isPublicEndpoint) {
      localStorage.removeItem("semcomp-site-auth");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default client;
