import client from "./client";
import type { BackofficeUserType } from "@/types/BackofficeUserType";

type SafeBackofficeUser = {
  email: string;
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
  users: BackofficeUserType[];
}

/**
 * API para gerenciar usuários do backoffice
 */
export const userBackofficeAPI = {
  /**
   * Lista todos os usuários do backoffice com paginação e filtros
   */
  getAll: async (
    page = 1,
    limit = 10,
    sortBy = "email",
    sortOrder = "asc",
    searchBy?: string,
    searchValue?: string
  ): Promise<UsersListResponse> => {
    let url = `/admin/usersBackoffice?page=${page}&limit=${limit}&sort_by=${sortBy}&sort_order=${sortOrder}`;
    if (searchBy && searchValue) {
      url += `&search_by=${searchBy}&search_value=${searchValue}`;
    }
    const response = await client.get<UsersListResponse>(url);
    return {
      ...response.data,
      users: (response.data.users || []).map((user) => ({
        id: user.email,
        email: user.email,
        password: "",
      })),
    };
  },

  /**
   * Busca um usuário do backoffice por email
   */
  getByEmail: async (email: string): Promise<BackofficeUserType> => {
    const response = await client.get<SafeBackofficeUser>(
      `/admin/usersBackoffice/${encodeURIComponent(email)}`
    );
    return {
      id: response.data.email,
      email: response.data.email,
      password: "",
    };
  },

  /**
   * Cria um novo usuário do backoffice
   */
  create: async (data: Omit<BackofficeUserType, "id">): Promise<BackofficeUserType> => {
    const response = await client.post<{ message: string; user: SafeBackofficeUser }>(
      "/admin/usersBackoffice",
      {
        email: data.email,
        password: data.password,
      }
    );
    return {
      id: response.data.user.email,
      email: response.data.user.email,
      password: "",
    };
  },

  /**
   * Atualiza um usuário do backoffice
   */
  update: async (
    email: string,
    data: Partial<Omit<BackofficeUserType, "id">>
  ): Promise<{ message: string }> => {
    const response = await client.put<{ message: string }>(
      `/admin/usersBackoffice/${encodeURIComponent(email)}`,
      {
        email: data.email,
        password: data.password,
      }
    );
    return response.data;
  },

  /**
   * Deleta um usuário do backoffice
   */
  delete: async (email: string): Promise<{ message: string }> => {
    const response = await client.delete<{ message: string }>(
      `/admin/usersBackoffice/${encodeURIComponent(email)}`
    );
    return response.data;
  },
};
