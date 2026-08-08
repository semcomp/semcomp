import client from "./client";
import type {
  LoginResponse,
  RegisterResponse,
  ProfileResponse,
  VerifyEmailResponse,
  ResendVerificationResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse,
} from "@/types/APIResponseType";

/**
 * Endpoints de autenticação
 */

export const authAPI = {
  logout: async (): Promise<void> => {
    await client.post("/logout");
  },

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
   * Registra um novo usuário via multipart/form-data
   * @param name Nome completo do usuário
   * @param email Email do usuário
   * @param password Senha do usuário
   * @param age Idade do usuário
   * @param gender Gênero do usuário
   * @param city Cidade do usuário
   * @param education Nível de educação do usuário
   * @param hasPapfe Indica se o usuário possui PAPFE
   * @param disabilities Deficiências do usuário
   * @param querCracha Indica se o usuário deseja retirar o crachá físico no evento
   * @param autorizaCompartilhamento Indica se o usuário autoriza o compartilhamento de dados com patrocinadores
   * @param profession Profissão do usuário (opcional)
   * @param linkedin Perfil do LinkedIn do usuário (opcional)
   * @param telegram Perfil do Telegram do usuário (opcional)
   * @param papfeFile Comprovante PAPFE do usuário - obrigatório se hasPapfe for true, do contrário, opcional
   * @returns Dados do usuário registrado
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
    querCracha: boolean,
    autorizaCompartilhamento: boolean,
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
    fd.append("quer_cracha", String(querCracha));
    fd.append("autoriza_compartilhamento", String(autorizaCompartilhamento));
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

  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    const response = await client.post<ForgotPasswordResponse>("/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<ResetPasswordResponse> => {
    const response = await client.post<ResetPasswordResponse>("/reset-password", { token, new_password: newPassword });
    return response.data;
  },
};
