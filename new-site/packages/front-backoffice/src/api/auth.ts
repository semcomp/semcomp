import client from "./client";
import type { LoginResponse } from "@/types/APIResponseType";

/**
 * Endpoints de autenticação
 */

export const authAPI = {
  /**
   * Realiza login com email e senha
   * @param email Email do usuário
   * @param password Senha do usuário
   * @returns Dados do usuário e token JWT
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await client.post<LoginResponse>("/admin/login", {
      email,
      password,
    });
    console.log("Login response:", response);
    return response.data;
  },

};
