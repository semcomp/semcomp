import client from "./client";
import type { RiddleType } from "@/types/RiddleType";

export interface RiddlesListResponse {
  page: number;
  limit: number;
  sort_by: string;
  sort_order: string;
  search_by: string | null;
  search_value: string | null;
  total_records: number;
  filtered_records: number;
  riddles: RiddleType[];
}

const mapBackendRiddle = (riddle: any): RiddleType => {
  return {
    id: String(riddle.id),
    riddleId: riddle.id,
    hint1: riddle.hint_1,
    hint2: riddle.hint_2,
    answer: riddle.answer,
    imageUrl: riddle.image_url,
    isActive: Boolean(riddle.is_active),
    createdAt: riddle.created_at,
  };
};

const mapToBackendRiddle = (riddle: Partial<RiddleType>) => ({
  hint_1: riddle.hint1,
  hint_2: riddle.hint2,
  answer: riddle.answer,
  image_url: riddle.imageUrl,
  is_active: riddle.isActive,
});

// hint1/hint2 não precisam de mapeamento: o nome do campo já bate com a
// coluna real no banco (o GORM não insere "_" antes de dígito em "Hint1"/"Hint2").
const fieldMap: Record<string, string> = {
  isActive: "is_active",
};

export const riddlesAPI = {
  getAll: async (
    page = 1,
    limit = 10,
    sortBy = "id",
    sortOrder = "asc",
    searchBy?: string,
    searchValue?: string
  ): Promise<RiddlesListResponse> => {
    const backendSortBy = fieldMap[sortBy] ?? sortBy;
    const backendSearchBy = searchBy ? (fieldMap[searchBy] ?? searchBy) : undefined;

    let url = `/admin/riddles?page=${page}&limit=${limit}&sort_by=${backendSortBy}&sort_order=${sortOrder}`;
    if (backendSearchBy && searchValue) {
      url += `&search_by=${backendSearchBy}&search_value=${searchValue}`;
    }
    const response = await client.get<any>(url);
    return {
      ...response.data,
      riddles: response.data.riddles.map(mapBackendRiddle),
    };
  },

  getByID: async (id: number): Promise<RiddleType> => {
    const response = await client.get<any>(`/admin/riddles/${id}`);
    return mapBackendRiddle(response.data);
  },

  create: async (data: Omit<RiddleType, "id" | "riddleId" | "createdAt">): Promise<RiddleType> => {
    const payload = mapToBackendRiddle(data);
    const response = await client.post<any>("/admin/riddles", payload);
    return mapBackendRiddle(response.data.riddle);
  },

  update: async (id: number, data: Partial<RiddleType>): Promise<RiddleType> => {
    const payload = mapToBackendRiddle(data);
    const response = await client.put<any>(`/admin/riddles/${id}`, payload);
    return mapBackendRiddle(response.data.riddle);
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await client.delete<{ message: string }>(`/admin/riddles/${id}`);
    return response.data;
  },

  uploadCsv: async (file: File): Promise<RiddleType[]> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await client.post<any>("/admin/riddles/upload-csv", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.riddles.map(mapBackendRiddle);
  },
};
