import client from "./client";
import type { PapfeDocumentType } from "@/types/PapfeDocumentType";

/**
 * Endpoints do comprovante PAPFE (participante).
 *
 *   GET /api/papfe-document
 *     Retorna os metadados do comprovante PAPFE do usuário autenticado
 *     (404 -> null). Inclui `rejection_reason` apenas quando rejeitado.
 *
 *   PUT /api/papfe-document                      multipart: papfe_document
 *     Envia (ou substitui) o comprovante PAPFE do usuário autenticado.
 *     Sempre exige o arquivo — não há edição parcial. O comprovante volta
 *     para "pendente" a cada novo envio, mesmo que o anterior já tivesse
 *     sido aprovado/rejeitado.
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

  /**
   * PUT /api/papfe-document (multipart: papfe_document)
   * Envia ou substitui o comprovante PAPFE do usuário autenticado.
   */
  update: async (file: File): Promise<void> => {
    const fd = new FormData();
    fd.append("papfe_document", file);
    await client.put("/api/papfe-document", fd, {
      headers: { "Content-Type": undefined },
    });
  },
};
