import client from "./client";
import type {
  AbsenceJustificationType,
  AbsenceJustificationStatus,
} from "@/types/AbsenceJustificationType";

/**
 * API para gerenciar solicitações de Justificativa de Ausência.
 */
export interface AbsenceJustificationsListResponse {
  absence_justifications: AbsenceJustificationType[];
  total_records: number;
  filtered_records: number;
  page: number;
  limit: number;
}

export const absenceJustificationsAPI = {
  getAll: async (
    page = 1,
    limit = 10,
    sortBy = "submitted_at",
    sortOrder = "desc",
    searchBy?: string,
    searchValue?: string
  ): Promise<AbsenceJustificationsListResponse> => {
    let url = `/admin/absence-justifications?page=${page}&limit=${limit}&sort_by=${sortBy}&sort_order=${sortOrder}`;
    if (searchBy && searchValue) {
      url += `&search_by=${encodeURIComponent(searchBy)}&search_value=${encodeURIComponent(searchValue)}`;
    }
    const response = await client.get<AbsenceJustificationsListResponse>(url);
    return response.data;
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
    status: AbsenceJustificationStatus,
    rejectionReason?: string
  ): Promise<{ message: string }> => {
    const response = await client.patch<{ message: string }>(
      `/admin/absence-justifications/${id}`,
      { status, rejection_reason: rejectionReason ?? "" }
    );
    return response.data;
  },
};
