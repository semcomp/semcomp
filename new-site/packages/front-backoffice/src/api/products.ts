import client from "./client";
import type { ProductKind, ProductBase, ProductType } from "@/types/ProductType";

export interface ProductListResponse {
    page: number;
    limit: number;
    sort_by: "id" | "type" | "is_selling" | "price";
    sort_order: "asc" | "desc";
    search_by: string | null;
    search_value: string | null;
    total_records: number;
    filtered_records: number;
    products: ProductType[];
}
/*
export const productsAPI = {
    getAll: async (
        page = 1,
        limit = 10,
        sort_by = "id",
        sort_order = "asc",
        searchBy?: string,
        searchValue?: string
    ): Promise<ProductListResponse> => {
        const response = client.get("/admin/products", {
            params: {
                page: page,
                limit: limit,   
                sort_by: sort_by,
                sort_order: sort_order,
                search_by: searchBy,
                search_value: searchValue,
            }
        })
    },

    create: async () => {

    },
    update: async () => {

    },
    delete: async () => {

    }
}
    */