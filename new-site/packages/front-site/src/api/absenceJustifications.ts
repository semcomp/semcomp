import client from "./client";
import type { AbsenceJustificationType } from "@/types/AbsenceJustificationType";

/**
 * Endpoints de Justificativa de Ausência (participante).
 *
 * Contrato implementado no backend (internal/absenceJustification):
 *
 *   POST  /api/absence-justifications                     multipart: reason, attachment
 *         Cria a justificativa com status "em_analise". Retorna a justificativa criada.
 *
 *   GET   /api/absence-justifications/mine
 *         Retorna a justificativa do usuário autenticado (404 -> null).
 *
 *   GET   /api/absence-justifications/:id/attachment
 *         Retorna o comprovante anexado (blob) para download/pré-visualização.
 *
 *   PATCH /api/absence-justifications/:id                 multipart: reason, attachment (opcional)
 *         Atualiza o texto e/ou SUBSTITUI o documento enquanto o status for
 *         "em_analise" ou "documento_invalido", reenviando para análise.
 *         O backend rejeita (409) nos demais status ("aprovado"/"negado").
 */

export type SubmitJustificationInput = {
  reason: string;
  file: File;
};

export type UpdateJustificationInput = {
  reason: string;
  /** Se informado, substitui o comprovante enviado anteriormente. */
  file?: File;
};

export const absenceJustificationsAPI = {
  /**
   * POST /api/absence-justifications (multipart: reason, attachment)
   * Cria a justificativa de ausência do usuário autenticado.
   */
  submit: async (input: SubmitJustificationInput): Promise<AbsenceJustificationType> => {
    const fd = new FormData();
    fd.append("reason", input.reason);
    fd.append("attachment", input.file);
    const response = await client.post<{ absence_justification: AbsenceJustificationType }>(
      "/api/absence-justifications",
      fd,
      { headers: { "Content-Type": undefined } }
    );
    return response.data.absence_justification;
  },

  /**
   * GET /api/absence-justifications/mine
   * Retorna a justificativa do usuário autenticado (null se ainda não enviou).
   */
  getMine: async (): Promise<AbsenceJustificationType | null> => {
    try {
      const response = await client.get<{ absence_justification: AbsenceJustificationType }>(
        "/api/absence-justifications/mine"
      );
      return response.data.absence_justification;
    } catch (err) {
      if ((err as { response?: { status?: number } }).response?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  /**
   * GET /api/absence-justifications/:id/attachment
   * Retorna o comprovante do usuário autenticado (blob). null se não houver.
   */
  getAttachment: async (id: number): Promise<Blob | null> => {
    const response = await client.get(`/api/absence-justifications/${id}/attachment`, {
      responseType: "blob",
    });
    return response.data as Blob;
  },

  /**
   * PATCH /api/absence-justifications/:id (multipart: reason, attachment opcional)
   * Edita o texto e/ou substitui o documento enquanto o status for "em_analise"
   * ou "documento_invalido". A justificativa volta para "em_analise".
   */
  update: async (
    id: number,
    input: UpdateJustificationInput
  ): Promise<AbsenceJustificationType> => {
    const fd = new FormData();
    fd.append("reason", input.reason);
    if (input.file) fd.append("attachment", input.file);
    const response = await client.patch<{ absence_justification: AbsenceJustificationType }>(
      `/api/absence-justifications/${id}`,
      fd,
      { headers: { "Content-Type": undefined } }
    );
    return response.data.absence_justification;
  },
};
