/**
 * API centralizada
 * Exporta todos os endpoints e utilitários
 */

export { authAPI } from "./auth";
export { userBackofficeAPI } from "./userBackoffice";
export { userSemcompAPI } from "./users";
export { eventsAPI } from "./events";
export { sectionsAPI } from "./sections";
export { participationsAPI } from "./participations";
export { default as client } from "./client";
export type { LoginResponse, RegisterResponse, ProfileResponse, ApiError } from "@/types/APIResponseType";
