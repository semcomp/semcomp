import client from "./client";
import type { PapfeDocumentType } from "@/types/PapfeDocumentType";

/**
 * Endpoints do comprovante PAPFE (participante).
 *
 *   GET /api/papfe-document
 *     Retorna os metadados do comprovante PAPFE do usuário autenticado
 *     (404 -> null). Inclui `rejection_reason` apenas quando rejeitado.
 */
export const papfeAPI = {
  getMine: async (): Promise<PapfeDocumentType | null> => {
    try {
      const response = await client.get<{ papfe_document: PapfeDocumentType }>(
        "/api/papfe-document"
      );
      return response.data.papfe_document;
    } catch (err) {
      if ((err as { response?: { status?: number } }).response?.status === 404) {
        return null;
      }
      throw err;
    }
  },
};
