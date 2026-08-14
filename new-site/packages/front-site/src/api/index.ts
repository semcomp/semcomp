/**
 * API centralizada
 * Exporta todos os endpoints e utilitários
 */

export { authAPI } from "./auth";
export { absenceJustificationsAPI } from "./absenceJustifications";
export type {
  SubmitJustificationInput,
  UpdateJustificationInput,
} from "./absenceJustifications";
export { papfeAPI } from "./papfe";
export type { AbsenceJustificationType, AbsenceJustificationStatus } from "@/types/AbsenceJustificationType";
export type { PapfeDocumentType } from "@/types/PapfeDocumentType";
export { default as client } from "./client";
export type { LoginResponse, RegisterResponse, ProfileResponse, ApiError } from "@/types/APIResponseType";
export { productsAPI } from "./products";
export { paymentAPI } from "./payment";
export type { PixPaymentResponse } from "./payment";
