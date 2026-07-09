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
   * @param age Idade do usuário
   * @param gender Gênero do usuário
   * @param city Cidade do usuário
   * @param education Nível de educação do usuário
   * @param hasPapfe Boleano que indica se o usuário recebe apoio pafpe
   * @param disabilities Vetor de deficiências do usuário
   * @param profession Profissão do usuário (opcional)
   * @param linkedin Perfil do usuário no LinkedIn (opcional)
   * @param telegram Nome de usuário no Telegram (opcional)
   * @returns Dados do novo usuário
   */
  register: async (
    name: string,
    email: string,
    password: string,
    age: number,
    gender: string,
    city: string,
    education: string,
    hasPapfe: boolean,
    disabilities: string[],
    profession?: string,
    linkedin?: string,
    telegram?: string,
  ): Promise<RegisterResponse> => {
    const response = await client.post<RegisterResponse>("/register", {
      name,
      email,
      password,
      age,
      gender,
      city,
      education,
      hasPapfe,
      disabilities,
      profession,
      linkedin,
      telegram
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
