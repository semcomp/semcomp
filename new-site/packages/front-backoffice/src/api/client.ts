import axios, { AxiosError } from "axios";
import type { AxiosInstance } from "axios";
import { BASEURL } from "@/constants/ApiURL";

const client: AxiosInstance = axios.create({
  baseURL: BASEURL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (
      error.response?.status === 401 &&
      error.config?.url !== "/admin/login"
    ) {
      localStorage.removeItem("semcomp-backoffice-auth");
      localStorage.removeItem("semcomp-backoffice-permissions");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

export default client;
