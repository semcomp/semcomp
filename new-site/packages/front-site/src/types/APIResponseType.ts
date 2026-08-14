import type { UserType } from "@/types/UserType";

/**
 * Tipos de resposta e requisição da API
 */

export interface LoginResponse {
  message: string;
  user: UserType;
}

export interface RegisterResponse {
  message: string;
  user: UserType;
}

export interface VerifyEmailResponse {
  message: string;
}

export interface ResendVerificationResponse {
  message: string;
}

export interface ProfileResponse {
  ok: boolean;
  message: string;
  user_number: number;
  email: string;
  name: string;
  presence_rate: number;
  hasPapfe?: boolean;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ApiError {
  error?: string;
  message?: string;
}
