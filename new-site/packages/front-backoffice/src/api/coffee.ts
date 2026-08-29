import client from "./client";
import type { CoffeeType } from "@/types/CoffeeType";

export interface CoffeeValidationResponse {
  hasCoffee: boolean;
  userName?: string;
  userNumber: string;
  message?: string;
}

export interface CoffeeListResponse {
  page: number;
  limit: number;
  sort_by: string;
  sort_order: string;
  search_by: string | null;
  search_value: string | null;
  total_records: number;
  filtered_records: number;
  coffees: CoffeeType[];
}

/**
 * Mapeia dados do backend para formato local
 */
const mapBackendCoffee = (coffee: any): CoffeeType => {
  return {
    id: coffee.id || coffee.code,
    name: coffee.name || coffee.title,
    description: coffee.description,
    price: coffee.price,
    date: coffee.created_at || coffee.date,
  };
};

const fieldMap: Record<string, string> = {
  name: "name",
  description: "description",
  price: "price",
  date: "created_at",
};

/**
 * API para gerenciar e validar Coffees
 */
export const coffeeAPI = {
  /**
   * Valida se um usuário/participante comprou o Coffee Break pelo QR Code
   */
  validateCoffee: async (
    userNumber: string,
    coffeeId: string
  ): Promise<CoffeeValidationResponse> => {
    try {
      const response = await client.post<any>("/admin/coffee/validate", {
        user_number: userNumber,
        coffee_id: coffeeId,
      });

      return {
        hasCoffee: Boolean(response.data.has_coffee ?? response.data.hasCoffee),
        userName: response.data.user_name ?? response.data.userName,
        userNumber,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error("Erro ao validar coffee:", error.response?.data);
      throw error;
    }
  },

  /**
   * Lista todos os registros de Coffee (paginado)
   */
  getAll: async (
    page = 1,
    limit = 10,
    sortBy = "created_at",
    sortOrder = "asc",
    searchBy?: string,
    searchValue?: string
  ): Promise<CoffeeListResponse> => {
    const backendSortBy = fieldMap[sortBy] ?? sortBy;
    const backendSearchBy = searchBy
      ? fieldMap[searchBy] ?? searchBy
      : undefined;

    let url = `/coffees?page=${page}&limit=${limit}&sort_by=${backendSortBy}&sort_order=${sortOrder}`;
    if (backendSearchBy && searchValue) {
      url += `&search_by=${backendSearchBy}&search_value=${searchValue}`;
    }

    const response = await client.get<any>(url);
    return {
      ...response.data,
      coffees: (response.data.coffees || response.data.items || []).map(
        mapBackendCoffee
      ),
    };
  },

  /**
   * Cria um novo Coffee/Pacote
   */
  create: async (data: Omit<CoffeeType, "id">): Promise<CoffeeType> => {
    const response = await client.post<any>("/admin/coffees", {
      name: data.name,
      description: data.description,
      price: data.price,
    });
    return mapBackendCoffee(response.data.coffee);
  },

  /**
   * Atualiza dados de um Coffee
   */
  update: async (
    id: string,
    data: Partial<Omit<CoffeeType, "id">>
  ): Promise<CoffeeType> => {
    const response = await client.put<any>(
      `/admin/coffees/${encodeURIComponent(id)}`,
      {
        name: data.name,
        description: data.description,
        price: data.price,
      }
    );
    return mapBackendCoffee(response.data.coffee);
  },

  /**
   * Remove um registro de Coffee
   */
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await client.delete<{ message: string }>(
      `/admin/coffees/${encodeURIComponent(id)}`
    );
    return response.data;
  },
};
