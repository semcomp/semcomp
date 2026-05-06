import client from "./client";
import type { SemcompUserType } from "@/types/SemcompUserType";

type SafeSemcompUser = {
  user_number: string;
  name: string;
  email: string;
  presence_rate: number;
};

const mapBackendUser = (user: SafeSemcompUser): SemcompUserType => {
  return {
    id: user.user_number,
    name: user.name,
    email: user.email,
    presence_rate: user.presence_rate,
    password: "",
  };
};

const normalizePresenceRate = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export interface UsersListResponse {
  page: number;
  limit: number;
  sort_by: string;
  sort_order: string;
  search_by: string | null;
  search_value: string | null;
  total_records: number;
  filtered_records: number;
  users: SafeSemcompUser[];
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
    return {
      ...response.data,
      users: (response.data.users || []).map(mapBackendUser),
    };
  },

  /**
   * Busca um usuário por ID
   */
  getById: async (id: string): Promise<SemcompUserType> => {
    const response = await client.get<SafeSemcompUser>(`/admin/users/${id}`);
    return mapBackendUser(response.data);
  },

  /**
   * Cria um usuário
   */
  create: async (
    data: Omit<SemcompUserType, "id" | "presence_rate">
  ): Promise<SemcompUserType> => {
    const response = await client.post<{ message: string; user: SafeSemcompUser }>(
      "/admin/users",
      {
        name: data.name,
        email: data.email,
        password: data.password,
      }
    );
    return mapBackendUser(response.data.user);
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
        presence_rate: normalizePresenceRate(data.presence_rate),
      }
    );
    console.log("Resposta do backend ao atualizar usuário:", response.data);
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
