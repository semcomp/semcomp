/**
 * API centralizada
 * Exporta todos os endpoints e utilitários
 */

export { authAPI } from "./auth";
export { default as client } from "./client";
export { getErrorMessage, isNetworkError } from "./errors";
export type { LoginResponse, RegisterResponse, ProfileResponse, ApiError } from "@/types/APIResponseType";
