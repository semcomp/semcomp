import client from "./client";
import type { SectionType } from "@/types/SectionType";

export interface SectionsListResponse {
  page: number;
  limit: number;
  sort_by: string;
  sort_order: string;
  search_by: string | null;
  search_value: string | null;
  total_records: number;
  filtered_records: number;
  sections: SectionType[];
}

// Mapeador para padronizar dados do backend
const mapBackendSection = (section: any): SectionType => {
  return {
    id: section.name,
    name: section.name,
    description: section.description || "",
  };
};

export const sectionsAPI = {
  // READ - Listar todas as seções
  getAll: async (page = 1, limit = 10, sortBy = "name", sortOrder = "asc", searchBy?: string, searchValue?: string): Promise<SectionsListResponse> => {
    let url = `/admin/sections?page=${page}&limit=${limit}&sort_by=${sortBy}&sort_order=${sortOrder}`;
    if (searchBy && searchValue) {
      url += `&search_by=${searchBy}&search_value=${searchValue}`;
    }
    const response = await client.get<any>(url);
    return {
      ...response.data,
      sections: (response.data.sections || []).map(mapBackendSection),
    };
  },

  // READ - Buscar uma seção específica
  getByName: async (name: string): Promise<SectionType> => {
    const response = await client.get<any>(`/admin/sections/${name}`);
    return mapBackendSection(response.data);
  },

  // CREATE - Criar nova seção
  create: async (data: Omit<SectionType, "id" | "createdAt" | "updatedAt">): Promise<SectionType> => {
    const response = await client.post<{ message: string; section: any }>("/admin/sections", {
      name: data.name,
      description: data.description,
    });
    return mapBackendSection(response.data.section);
  },

  // UPDATE - Atualizar seção
  update: async (originalName: string, data: SectionType): Promise<SectionType> => {
    const response = await client.put<{ message: string; section: any }>(
      `/admin/sections/${originalName}`,
      {
        name: data.name,
        description: data.description,
      }
    );
    return mapBackendSection(response.data.section);
  },

  // DELETE - Deletar seção
  delete: async (name: string): Promise<{ message: string }> => {
    return client.delete<{ message: string }>(`/admin/sections/${name}`).then(res => res.data);
  },
};