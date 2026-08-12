import client from "./client";
import type { AbsenceJustificationType } from "@/types/AbsenceJustificationType";

/**
 * Endpoints de Justificativa de Ausência (participante).
 *
 * Contrato a ser implementado no backend (ainda não existe — ver mock abaixo):
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
 *         Atualiza o texto e/ou SUBSTITUI o documento enquanto o status for "em_analise".
 *         O backend deve rejeitar (409) se o status não for mais "em_analise".
 *
 * Enquanto o backend não existir, USE_MOCK_API=true faz com que tudo seja
 * persistido em localStorage (por user_number), mantendo o fluxo funcional.
 */
export const USE_MOCK_API = true;

const MOCK_STORAGE_KEY = (userNumber: number) =>
  `semcomp-absence-justification-${userNumber}`;

const AUTH_STORAGE_KEY = "semcomp-site-auth";

export type SubmitJustificationInput = {
  reason: string;
  file: File;
};

export type UpdateJustificationInput = {
  reason: string;
  /** Se informado, substitui o comprovante enviado anteriormente. */
  file?: File;
};

type StoredJustification = {
  id: number;
  user_number: number;
  user_name: string;
  user_email: string;
  event_name: string;
  reason: string;
  status: AbsenceJustificationType["status"];
  attachment_filename: string;
  attachment_content_type: string;
  /** Data URL (base64). null quando o arquivo não coube no localStorage (mock). */
  attachment_base64: string | null;
  submitted_at: string;
  updated_at: string;
};

function getCurrentUser(): { user_number: number; name: string; email: string } | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    const user = JSON.parse(raw);
    return {
      user_number: user.user_number,
      name: user.name ?? "",
      email: user.email ?? "",
    };
  } catch {
    return null;
  }
}

function readStored(userNumber: number): StoredJustification | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(MOCK_STORAGE_KEY(userNumber));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredJustification;
  } catch {
    return null;
  }
}

function writeStored(record: StoredJustification): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MOCK_STORAGE_KEY(record.user_number), JSON.stringify(record));
  } catch {
    // Quota do localStorage estourada (arquivos grandes). Persiste sem o arquivo.
    window.localStorage.setItem(
      MOCK_STORAGE_KEY(record.user_number),
      JSON.stringify({ ...record, attachment_base64: null })
    );
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function toApiType(record: StoredJustification): AbsenceJustificationType {
  return {
    id: record.id,
    user_number: record.user_number,
    user_name: record.user_name,
    user_email: record.user_email,
    event_name: record.event_name,
    event_init_date: record.submitted_at,
    reason: record.reason,
    attachment_filename: record.attachment_filename,
    attachment_content_type: record.attachment_content_type,
    submitted_at: record.submitted_at,
    status: record.status,
  };
}

export const absenceJustificationsAPI = {
  /**
   * POST /api/absence-justifications (multipart: reason, attachment)
   * Cria a justificativa de ausência do usuário autenticado.
   */
  submit: async (input: SubmitJustificationInput): Promise<AbsenceJustificationType> => {
    if (!USE_MOCK_API) {
      const fd = new FormData();
      fd.append("reason", input.reason);
      fd.append("attachment", input.file);
      const response = await client.post<{ absence_justification: AbsenceJustificationType }>(
        "/api/absence-justifications",
        fd,
        { headers: { "Content-Type": undefined } }
      );
      return response.data.absence_justification;
    }

    const user = getCurrentUser();
    if (!user) throw new Error("Usuário não autenticado");

    const base64 = await fileToBase64(input.file);
    const now = new Date().toISOString();
    const record: StoredJustification = {
      id: Date.now(),
      user_number: user.user_number,
      user_name: user.name,
      user_email: user.email,
      event_name: "SEMCOMP",
      reason: input.reason,
      status: "em_analise",
      attachment_filename: input.file.name,
      attachment_content_type: input.file.type || "application/octet-stream",
      attachment_base64: base64,
      submitted_at: now,
      updated_at: now,
    };
    writeStored(record);
    return toApiType(record);
  },

  /**
   * GET /api/absence-justifications/mine
   * Retorna a justificativa do usuário autenticado (null se ainda não enviou).
   */
  getMine: async (): Promise<AbsenceJustificationType | null> => {
    if (!USE_MOCK_API) {
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
    }

    const user = getCurrentUser();
    if (!user) return null;
    const record = readStored(user.user_number);
    return record ? toApiType(record) : null;
  },

  /**
   * GET /api/absence-justifications/:id/attachment
   * Retorna o comprovante do usuário autenticado (blob). null se não houver.
   */
  getAttachment: async (id: number): Promise<Blob | null> => {
    if (!USE_MOCK_API) {
      const response = await client.get(`/api/absence-justifications/${id}/attachment`, {
        responseType: "blob",
      });
      return response.data as Blob;
    }

    const user = getCurrentUser();
    if (!user) return null;
    const record = readStored(user.user_number);
    if (!record || !record.attachment_base64) return null;
    const res = await fetch(record.attachment_base64);
    return res.blob();
  },

  /**
   * PATCH /api/absence-justifications/:id (multipart: reason, attachment opcional)
   * Edita o texto e/ou substitui o documento enquanto o status for "em_analise".
   */
  update: async (
    id: number,
    input: UpdateJustificationInput
  ): Promise<AbsenceJustificationType> => {
    if (!USE_MOCK_API) {
      const fd = new FormData();
      fd.append("reason", input.reason);
      if (input.file) fd.append("attachment", input.file);
      const response = await client.patch<{ absence_justification: AbsenceJustificationType }>(
        `/api/absence-justifications/${id}`,
        fd,
        { headers: { "Content-Type": undefined } }
      );
      return response.data.absence_justification;
    }

    const user = getCurrentUser();
    if (!user) throw new Error("Usuário não autenticado");
    const record = readStored(user.user_number);
    if (!record || record.id !== id) throw new Error("Justificativa não encontrada");
    if (record.status !== "em_analise") {
      throw new Error("Só é possível editar uma justificativa em análise");
    }

    let base64 = record.attachment_base64;
    if (input.file) {
      base64 = await fileToBase64(input.file);
      record.attachment_filename = input.file.name;
      record.attachment_content_type = input.file.type || "application/octet-stream";
    }
    record.reason = input.reason;
    record.attachment_base64 = base64;
    record.updated_at = new Date().toISOString();
    writeStored(record);
    return toApiType(record);
  },
};
