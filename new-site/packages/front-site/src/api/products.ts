import client from "./client";
import type { ProductsResponse } from "@/types/ProductType";

/**
 * Endpoints de produtos (públicos)
 */
export const productsAPI = {
  /**
   * Obtém todos os produtos à venda
   * @returns Lista paginada de produtos
   */
  getAllProducts: async (): Promise<ProductsResponse> => {
    const response = await client.get<ProductsResponse>("/products?limit=1000");
    return response.data;
  },
};
