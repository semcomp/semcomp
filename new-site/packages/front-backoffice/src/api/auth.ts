import client from "./client";
import type { LoginResponse } from "@/types/APIResponseType";

/**
 * Endpoints de autenticação
 */

export const authAPI = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await client.post<LoginResponse>("/admin/login", {
      email,
      password,
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await client.post("/admin/logout");
  },
};
