import client from "./client";
import type { ProductType, ProductRaw, ProductKind } from "@/types/ProductType";

export interface ProductsListResponse {
  page: number;
  limit: number;
  sort_by: string;
  sort_order: string;
  search_by: string | null;
  search_value: string | null;
  total_records: number;
  filtered_records: number;
  products: ProductType[];
}

/**
 * Mapeia dados do backend -> formato local (achatado para CrudTable)
 */
const mapBackendProduct = (product: ProductRaw): ProductType => {
  return {
    id: String(product.id),
    productId: product.id,
    type: product.type,
    isSelling: String(product.is_selling),
    price: String(product.price),
    // Kit
    kitName: product.kit?.name ?? "",
    kitSize: product.kit?.size ?? "",
    kitColor: product.kit?.color ?? "",
    kitIsBabydoll: product.kit ? String(product.kit.is_babydoll) : "",
    // Coffee
    coffeeName: product.coffee?.name ?? "",
    coffeeDateTime: product.coffee?.date_time ?? "",
    // Combo
    comboItems: product.combo_items?.map((ci) => String(ci.item_id)).join(", ") ?? "",
  };
};

/**
 * Converte formato local -> payload do backend
 */
const mapToBackendProduct = (product: ProductType) => {
  if (!product.type || !["KIT", "COFFEE", "COMBO"].includes(product.type)) {
    throw new Error("Selecione um tipo de produto válido (KIT, COFFEE ou COMBO).");
  }

  const parsedPrice = parseFloat(String(product.price).replace(",", "."));
  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    throw new Error("O preço deve ser um número maior que zero.");
  }

  const base: Record<string, unknown> = {
    type: product.type as ProductKind,
    is_selling: product.isSelling === "true",
    price: parsedPrice,
  };

  switch (product.type) {
    case "KIT":
      if (!product.kitName || !product.kitSize || !product.kitColor) {
        throw new Error("Preencha todos os campos obrigatórios do Kit (Nome, Tamanho, Cor).");
      }
      base.kit = {
        name: product.kitName,
        size: product.kitSize,
        color: product.kitColor,
        is_babydoll: product.kitIsBabydoll === "true",
      };
      break;
    case "COFFEE":
      if (!product.coffeeName || !product.coffeeDateTime) {
        throw new Error("Preencha todos os campos obrigatórios do Coffee (Nome, Data/Hora).");
      }
      base.coffee = {
        name: product.coffeeName,
        date_time: normalizeRFC3339(product.coffeeDateTime),
      };
      break;
    case "COMBO":
      if (!product.comboItems) {
        throw new Error("Forneça pelo menos um item numérico para o Combo.");
      }
      const items = product.comboItems
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map(Number);
      if (items.length === 0 || items.some(isNaN)) {
        throw new Error("Os itens do combo devem ser IDs numéricos válidos separados por vírgula.");
      }
      // O backend espera uma lista de objetos { item_id, quantity }, não IDs soltos.
      // Como o formulário só coleta IDs (sem quantidade por item), cada item entra com quantidade 1;
      // repetir o mesmo ID na lista não é permitido pelo backend (usar quantidade em vez disso).
      base.items = items.map((itemId) => ({ item_id: itemId, quantity: 1 }));
      break;
  }

  return base;
};

const normalizeRFC3339 = (value: unknown): string => {
  if (typeof value !== "string") return String(value ?? "");
  if (!value.trim()) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toISOString();
};

/**
 * Mapa de campos frontend -> backend (para sort/search)
 */
const fieldMap: Record<string, string> = {
  productId: "id",
  type: "type",
  isSelling: "is_selling",
  price: "price",
};

/**
 * API para gerenciar produtos
 */
export const productsAPI = {
  getAll: async (
    page = 1,
    limit = 10,
    sortBy = "id",
    sortOrder = "asc",
    searchBy?: string,
    searchValue?: string
  ): Promise<ProductsListResponse> => {
    const backendSortBy = fieldMap[sortBy] ?? sortBy;
    const backendSearchBy = searchBy ? (fieldMap[searchBy] ?? searchBy) : undefined;

    let url = `/admin/products?page=${page}&limit=${limit}&sort_by=${backendSortBy}&sort_order=${sortOrder}`;
    if (backendSearchBy && searchValue) {
      url += `&search_by=${backendSearchBy}&search_value=${searchValue}`;
    }

    const response = await client.get<any>(url);
    const products = response.data.products ?? [];

    return {
      ...response.data,
      products: products.map(mapBackendProduct),
    };
  },

  getByID: async (id: number): Promise<ProductType> => {
    const response = await client.get<any>(`/admin/products/${id}`);
    return mapBackendProduct(response.data);
  },

  create: async (data: ProductType): Promise<ProductType> => {
    const payload = mapToBackendProduct(data);
    console.log("Payload enviado para criar produto:", payload);

    try {
      const response = await client.post<any>("/admin/products", payload);
      console.log("Resposta do backend ao criar produto:", response.data);
      return mapBackendProduct(response.data.product);
    } catch (error: any) {
      console.error("Erro ao criar produto - Resposta do backend:", error.response?.data);
      throw error;
    }
  },

  update: async (id: number, data: ProductType): Promise<ProductType> => {
    const payload = mapToBackendProduct(data);
    console.log("Payload enviado para atualizar produto:", payload);

    const response = await client.put<any>(`/admin/products/${id}`, payload);
    return mapBackendProduct(response.data.product);
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await client.delete<{ message: string }>(
      `/admin/products/${id}`
    );
    return response.data;
  },
};