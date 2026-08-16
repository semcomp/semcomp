import client from "./client";
import type { ProductType, ProductRaw, ProductKind, ComboItemRich } from "@/types/ProductType";
import { isNightCoffee } from "@/utils/coffeeRules";

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
    name: product.name ?? "",
    isSelling: product.is_selling,
    price: String(product.price),
    pictureUrl: product.picture_url ?? "",
    description: product.description ?? "",
    // Kit
    kitName: product.kit?.name ?? "",
    kitSize: product.kit?.size ?? "",
    kitColor: product.kit?.color ?? "",
    kitIsBabydoll: product.kit ? String(product.kit.is_babydoll) : "",
    // Coffee
    coffeeName: product.coffee?.name ?? "",
    coffeeDateTime: product.coffee?.date_time ?? "",
    // Combo
    comboItemDetails: (product.combo_items ?? []).map((ci): ComboItemRich => ({
      itemId: ci.item_id,
      name: ci.item?.kit?.name || ci.item?.coffee?.name || `#${ci.item_id}`,
      type: (ci.item?.type as "KIT" | "COFFEE") ?? "KIT",
      quantity: ci.quantity ?? 1,
    })),
    comboItems: product.combo_items?.length
      ? product.combo_items
          .map((ci) => {
            const name = ci.item?.kit?.name || ci.item?.coffee?.name || `#${ci.item_id}`;
            return ci.quantity > 1 ? `${name} (x${ci.quantity})` : name;
          })
          .join(", ")
      : "",
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
    is_selling: product.isSelling,
    price: parsedPrice,
    picture_url: product.pictureUrl ?? "",
    description: product.description ?? "",
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
    case "COFFEE": {
      if (!product.coffeeName || !product.coffeeDateTime) {
        throw new Error("Preencha todos os campos obrigatórios do Coffee (Nome, Data/Hora).");
      }
      const coffeeDateTime = normalizeRFC3339(product.coffeeDateTime);
      // Regra de negócio: coffee diurno não pode ser vendido individualmente.
      if (product.isSelling && !isNightCoffee(coffeeDateTime)) {
        throw new Error("Coffee de dia (antes das 18h) não pode ser vendido individualmente — venda via combo.");
      }
      base.coffee = {
        name: product.coffeeName,
        date_time: coffeeDateTime,
      };
      break;
    }
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
  kitName: "kit.name",
  kitSize: "kit.size",
  kitColor: "kit.color",
  coffeeName: "coffee.name",
  coffeeDateTime: "coffee.date_time",
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
    searchValue?: string,
    /** Always filter by product type (KIT / COFFEE / COMBO) */
    typeFilter?: string,
  ): Promise<ProductsListResponse> => {
    const backendSortBy = fieldMap[sortBy] ?? sortBy;
    const backendSearchBy = searchBy ? (fieldMap[searchBy] ?? searchBy) : undefined;

    let url = `/admin/products?page=${page}&limit=${limit}&sort_by=${backendSortBy}&sort_order=${sortOrder}`;
    if (typeFilter) url += `&type=${typeFilter}`;
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

  createCombo: async (
    name: string,
    isSelling: boolean,
    price: number,
    items: { item_id: number; quantity: number }[],
    pictureUrl = "",
    description = "",
  ): Promise<ProductType> => {
    const payload = { type: "COMBO", name, is_selling: isSelling, price, items, picture_url: pictureUrl, description };
    const response = await client.post<any>("/admin/products", payload);
    return mapBackendProduct(response.data.product);
  },

  updateCombo: async (
    id: number,
    name: string,
    isSelling: boolean,
    price: number,
    items: { item_id: number; quantity: number }[],
    pictureUrl = "",
    description = "",
  ): Promise<ProductType> => {
    const payload = { type: "COMBO", name, is_selling: isSelling, price, items, picture_url: pictureUrl, description };
    const response = await client.put<any>(`/admin/products/${id}`, payload);
    return mapBackendProduct(response.data.product);
  },

  bulkCreate: async (products: object[]): Promise<ProductType[]> => {
    const response = await client.post<any>("/admin/products/bulk", { products });
    return (response.data.products ?? []).map(mapBackendProduct);
  },
};