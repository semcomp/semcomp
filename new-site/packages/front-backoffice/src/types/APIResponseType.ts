/**
 * Tipos de resposta e requisição da API de Backoffice
 */

export interface BackofficeUser {
  email: string;
}

export interface LoginResponse {
  message: string;
  user: BackofficeUser;
  token: string;
}

export interface RegisterResponse {
  message: string;
  user: BackofficeUser;
}

export interface ProfileResponse {
  ok: boolean;
  message: string;
  user_number: number;
  email: string;
  name: string;
  presence_rate: number;
}

export interface ApiError {
  error?: string;
  message?: string;
}
