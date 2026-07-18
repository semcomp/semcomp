import client from "./client";
import type {
  LoginResponse,
  RegisterResponse,
  ProfileResponse,
  VerifyEmailResponse,
  ResendVerificationResponse,
} from "@/types/APIResponseType";

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
   * Registra um novo usuário via multipart/form-data para suportar upload do comprovante PAPFE.
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
    papfeFile?: File | null,
  ): Promise<RegisterResponse> => {
    const fd = new FormData();
    fd.append("name", name);
    fd.append("email", email);
    fd.append("password", password);
    fd.append("age", String(age));
    fd.append("gender", gender);
    fd.append("city", city);
    fd.append("education", education);
    fd.append("hasPapfe", String(hasPapfe));
    fd.append("disabilities", disabilities.join(", "));
    if (profession?.trim()) fd.append("profession", profession.trim());
    if (linkedin?.trim()) fd.append("linkedin", linkedin.trim());
    if (telegram?.trim()) fd.append("telegram", telegram.trim());
    if (hasPapfe && papfeFile) fd.append("papfe_document", papfeFile);

    const response = await client.post<RegisterResponse>("/register", fd, {
      headers: { "Content-Type": undefined },
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

  /**
   * Confirma o e-mail de um usuário a partir do token recebido por link
   * @param token Token de verificação recebido por e-mail
   */
  verifyEmail: async (token: string): Promise<VerifyEmailResponse> => {
    const response = await client.post<VerifyEmailResponse>("/verify-email", { token });
    return response.data;
  },

  /**
   * Solicita o reenvio do e-mail de confirmação de conta
   * @param email Email do usuário
   */
  resendVerification: async (email: string): Promise<ResendVerificationResponse> => {
    const response = await client.post<ResendVerificationResponse>("/resend-verification", { email });
    return response.data;
  },
};
