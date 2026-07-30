import client from "./client";
import type { SemcompUserType } from "@/types/SemcompUserType";

type SafeSemcompUser = {
  user_number: string;
  name: string;
  email: string;
  presence_rate: number;
  age?: number;
  gender?: string;
  city?: string;
  education?: string;
  hasPapfe?: boolean;
  disabilities?: string[] | string;
  profession?: string;
  linkedin?: string;
  telegram?: string;
  quer_cracha?: boolean;
  pegou_camiseta?: boolean;
};

const mapBackendUser = (user: SafeSemcompUser): SemcompUserType => {
  // Trata disabilities para garantir que chegue como Array no frontend,
  // mesmo que o backend devolva uma string separada por vírgulas
  let parsedDisabilities: string[] = [];
  if (Array.isArray(user.disabilities)) {
    parsedDisabilities = user.disabilities;
  } else if (
    typeof user.disabilities === "string" &&
    user.disabilities.trim() !== ""
  ) {
    parsedDisabilities = user.disabilities.split(",").map((d) => d.trim());
  }

  return {
    id: user.user_number,
    user_number: user.user_number,
    name: user.name,
    email: user.email,
    presence_rate: user.presence_rate,
    password: "",
    age: user.age,
    gender: user.gender,
    city: user.city,
    education: user.education,
    hasPapfe: user.hasPapfe ?? false,
    disabilities: parsedDisabilities,
    profession: user.profession,
    linkedin: user.linkedin,
    telegram: user.telegram,
    quer_cracha: user.quer_cracha ?? false,
    pegou_camiseta: user.pegou_camiseta ?? false,
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
  users: SemcompUserType[];
}

interface UsersListBackendResponse {
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
    const response = await client.get<UsersListBackendResponse>(url);
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
    data: Omit<SemcompUserType, "id" | "presence_rate" | "user_number"> & {
      papfe_document?: File | null;
    }
  ): Promise<SemcompUserType> => {
    const formData = new FormData();

    // Campos Obrigatórios
    formData.append("name", data.name ?? "");
    formData.append("email", data.email ?? "");
    formData.append("password", data.password ?? "");
    formData.append("age", String(data.age ?? ""));
    formData.append("gender", data.gender ?? "");
    formData.append("city", data.city ?? "");
    formData.append("education", data.education ?? "");

    // Campos Opcionais / Booleanos
    formData.append("hasPapfe", String(Boolean(data.hasPapfe)));
    formData.append("quer_cracha", String(Boolean(data.quer_cracha)));

    if (data.profession) formData.append("profession", data.profession);
    if (data.linkedin) formData.append("linkedin", data.linkedin);
    if (data.telegram) formData.append("telegram", data.telegram);

    // Array de Deficiências
    if (Array.isArray(data.disabilities)) {
      data.disabilities.forEach((disability) => {
        formData.append("disabilities", disability);
      });
    }

    // Comprovante PAPFE
    if (data.papfe_document) {
      formData.append("papfe_document", data.papfe_document);
    }

    try {
      const response = await client.post<{
        message: string;
        user: SafeSemcompUser;
      }>(
        "/admin/users", // Ou "/register", dependendo da sua rota de admin
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return mapBackendUser(response.data.user);
    } catch (error) {
      
      throw error;
    }
  },

  /**
   * Atualiza um usuário
   */
  update: async (
    id: string,
    data: Partial<Omit<SemcompUserType, "id" | "user_number">>
  ): Promise<{ message: string }> => {
    const payload = {
      name: data.name,
      email: data.email,
      ...(data.password && { password: data.password }),
      presence_rate: normalizePresenceRate(data.presence_rate),
      age: data.age !== undefined ? Number(data.age) : undefined,
      gender: data.gender,
      city: data.city,
      education: data.education,
      hasPapfe: data.hasPapfe,
      disabilities: data.disabilities,
      profession: data.profession,
      linkedin: data.linkedin,
      telegram: data.telegram,
      quer_cracha: data.quer_cracha,
      pegou_camiseta: data.pegou_camiseta,
    };

    const response = await client.put<{ message: string }>(
      `/admin/users/${id}`,
      payload
    );
    return response.data;
  },

  /**
   * Deleta um usuário
   */
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await client.delete<{ message: string }>(
      `/admin/users/${id}`
    );
    return response.data;
  },
};
