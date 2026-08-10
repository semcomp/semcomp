/**
 * API centralizada
 * Exporta todos os endpoints e utilitários
 */

export { authAPI } from "./auth";
export { userBackofficeAPI } from "./userBackoffice";
export { userSemcompAPI } from "./users";
export { eventsAPI } from "./events";
export { sectionsAPI } from "./sections";
export { participationAPI } from "./participation";
export { productsAPI } from "./products";
export { permissionsAPI } from "./permissions";
export { pagesAPI } from "./pages";
export { sponsorsAPI } from "./sponsors";
export { salesAPI } from "./sales";
export { default as client } from "./client";
export type { LoginResponse, RegisterResponse, ProfileResponse, ApiError } from "@/types/APIResponseType";
