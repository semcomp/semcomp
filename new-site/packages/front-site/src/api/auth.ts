import client from "./client";
import type { LoginResponse, RegisterResponse, ProfileResponse } from "@/types/APIResponseType";

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
    const response = await client.post<LoginResponse>("/login", {
      email,
      password,
    });
    return response.data;
  },

  /**
   * Registra um novo usuário
   * @param name Nome completo
   * @param email Email do usuário
   * @param password Senha (min 8 caracteres)
   * @returns Dados do novo usuário
   */
  register: async (
    name: string,
    email: string,
    password: string
  ): Promise<RegisterResponse> => {
    const response = await client.post<RegisterResponse>("/register", {
      name,
      email,
      password,
    });
    return response.data;
  },

  /**
   * Obtém perfil do usuário autenticado
   * @returns Dados do perfil do usuário
   */
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await client.get<ProfileResponse>("/api/profile");
    return response.data;
  },
};
