import client from "./client";
import type { NoticeType } from "@/types/NoticeType";

export interface NoticesListResponse {
  page: number;
  limit: number;
  sort_by: string;
  sort_order: string;
  search_by: string | null;
  search_value: string | null;
  total_records: number;
  filtered_records: number;
  notices: NoticeType[];
}

const normalizeRFC3339 = (value: unknown): string => {
  if (typeof value !== "string") return String(value ?? "");
  if (!value.trim()) return value;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toISOString();
};

/**
 * Mapeia dados do backend Go para o formato NoticeType local
 */
const mapBackendNotice = (notice: any): NoticeType => {
  return {
    id: String(notice.id),
    title: notice.title,
    description: notice.content,
    dateTime: notice.date_time,
  };
};

/**
 * Mapeia formato local para o payload esperado pelo backend (Create/Update Request)
 */
const mapToBackendNotice = (notice: Partial<NoticeType>) => {
  return {
    title: notice.title,
    content: notice.description,
    date_time: normalizeRFC3339(notice.dateTime),
    // Adapte a estrutura do payload de acordo com a struct CreateNoticeRequest do Go
  };
};

const fieldMap: Record<string, string> = {
  title: "title",
  dateTime: "date_time",
  category: "category",
  description: "description",
};

/**
 * API para gerenciar avisos no mural
 */
export const noticesAPI = {
  /**
   * Lista avisos de forma paginada
   */
  getAll: async (
    page = 1,
    limit = 10,
    sortBy = "date_time",
    sortOrder = "desc",
    searchBy?: string,
    searchValue?: string
  ): Promise<NoticesListResponse> => {
    const backendSortBy = fieldMap[sortBy] ?? sortBy;
    const backendSearchBy = searchBy
      ? fieldMap[searchBy] ?? searchBy
      : undefined;

    let url = `/admin/notices?page=${page}&limit=${limit}&sort_by=${backendSortBy}&sort_order=${sortOrder}`;
    if (backendSearchBy && searchValue) {
      url += `&search_by=${backendSearchBy}&search_value=${encodeURIComponent(
        searchValue
      )}`;
    }

    const response = await client.get<any>(url);
    return {
      ...response.data,
      notices: response.data.notices.map(mapBackendNotice),
    };
  },

  /**
   * Busca um aviso específico por ID
   */
  getById: async (id: string | number): Promise<NoticeType> => {
    const response = await client.get<any>(`/admin/notices/${id}`);
    return mapBackendNotice(response.data);
  },

  /**
   * Cria um novo aviso (POST /admin/notices)
   */
  create: async (data: Omit<NoticeType, "id">): Promise<NoticeType> => {
    const payload = mapToBackendNotice(data);

    try {
      const response = await client.post<any>("/admin/notices", payload);
      return mapBackendNotice(response.data.notice);
    } catch (error: any) {
      console.error("Erro ao criar aviso:", error.response?.data);
      throw error;
    }
  },

  /**
   * Atualiza um aviso existente por ID (PUT /admin/notices/{id})
   */
  update: async (
    id: string | number,
    data: Partial<Omit<NoticeType, "id">>
  ): Promise<NoticeType> => {
    const payload = mapToBackendNotice(data);

    try {
      const response = await client.put<any>(`/admin/notices/${id}`, payload);
      return mapBackendNotice(response.data.notice);
    } catch (error: any) {
      console.error(`Erro ao atualizar aviso ${id}:`, error.response?.data);
      throw error;
    }
  },

  /**
   * Remove um aviso por ID (DELETE /admin/notices/{id})
   */
  delete: async (id: string | number): Promise<{ message: string }> => {
    try {
      console.log("Payload enviado para o Go:", id);
      const response = await client.delete<{ message: string }>(
        `/admin/notices/${id}`
      );
      return response.data;
    } catch (error: any) {
      console.error(`Erro ao deletar aviso ${id}:`, error.response?.data);
      throw error;
    }
  },
};
