import client from "./client";
import type {
  AbsenceJustificationType,
  AbsenceJustificationStatus,
} from "@/types/AbsenceJustificationType";

/**
 * API para gerenciar solicitações de Justificativa de Ausência.
 */
export const absenceJustificationsAPI = {
  getAll: async (): Promise<AbsenceJustificationType[]> => {
    const response = await client.get<{
      absence_justifications: AbsenceJustificationType[];
    }>("/admin/absence-justifications");
    return response.data.absence_justifications ?? [];
  },

  getAttachment: async (id: number): Promise<Blob> => {
    const response = await client.get(
      `/admin/absence-justifications/${id}/attachment`,
      { responseType: "blob" }
    );
    return response.data as Blob;
  },

  updateStatus: async (
    id: number,
    status: AbsenceJustificationStatus
  ): Promise<{ message: string }> => {
    const response = await client.patch<{ message: string }>(
      `/admin/absence-justifications/${id}`,
      { status }
    );
    return response.data;
  },
};
