import client from "./client";
import type { SemcompUserType } from "@/types/SemcompUserType";

export interface UsersListResponse {
  page: number;
  limit: number;
  sort_by: string;
  sort_order: string;
  search_by: string | null;
  search_value: string | null;
  total_records: number;
  filtered_records: number;
  users: SemcompUserType[];
}

/**
 * API para gerenciar usuários da Semcomp
 */
export const userSemcompAPI = {
  /**
   * Lista todos os usuários com paginação e filtros
   */
  getAll: async (
    page = 1,
    limit = 10,
    sortBy = "name",
    sortOrder = "asc",
    searchBy?: string,
    searchValue?: string
  ): Promise<UsersListResponse> => {
    let url = `/admin/users?page=${page}&limit=${limit}&sort_by=${sortBy}&sort_order=${sortOrder}`;
    if (searchBy && searchValue) {
      url += `&search_by=${searchBy}&search_value=${searchValue}`;
    }
    const response = await client.get<UsersListResponse>(url);
    return response.data;
  },

  /**
   * Busca um usuário por ID
   */
  getById: async (id: string): Promise<SemcompUserType> => {
    const response = await client.get<SemcompUserType>(`/admin/users/${id}`);
    return response.data;
  },

  /**
   * Atualiza um usuário
   */
  update: async (
    id: string,
    data: Partial<Omit<SemcompUserType, "id">>
  ): Promise<{ message: string }> => {
    const response = await client.put<{ message: string }>(
      `/admin/users/${id}`,
      {
        name: data.name,
        email: data.email,
        ...(data.password && { password: data.password }),
        ...(data.presence_rate !== undefined && { presence_rate: data.presence_rate }),
      }
    );
    return response.data;
  },

  /**
   * Deleta um usuário
   */
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await client.delete<{ message: string }>(`/admin/users/${id}`);
    return response.data;
  },
};
