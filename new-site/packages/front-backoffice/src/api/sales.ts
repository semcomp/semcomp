import client from "./client";

// ============================================================
// Tipos de produto (espelham internal/product/model.go)
// ============================================================

export interface SaleProductKit {
  name: string;
  size: string;
  color: string;
  is_babylook: boolean;
}

export interface SaleProductCoffee {
  name: string;
  date_time: string;
}

export interface SaleComboSubItem {
  id: number;
  type: string;
  kit?: SaleProductKit;
  coffee?: SaleProductCoffee;
}

export interface SaleComboItem {
  combo_id: number;
  item_id: number;
  item?: SaleComboSubItem;
}

export interface SaleProduct {
  id: number;
  type: "KIT" | "COFFEE" | "COMBO";
  price: number;
  picture_url?: string;
  kit?: SaleProductKit;
  coffee?: SaleProductCoffee;
  combo_items?: SaleComboItem[];
}

// ============================================================
// Entidades (espelham backend/internal/sales/model.go)
// ============================================================

export interface SaleUser {
  user_number: number;
  name: string;
  email: string;
}

export interface SaleItem {
  id: number;
  sale_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  is_picked_up: boolean;
  product?: SaleProduct;
  kit_product?: SaleProduct;
}

// EXPIRADO é persistido pelo sweeper; REJEITADO vem do Mercado Pago.
export type SaleStatus =
  | "PENDENTE"
  | "PAGO"
  | "CANCELADO"
  | "REEMBOLSADO"
  | "REJEITADO"
  | "EXPIRADO";

export interface Sale {
  id: number;
  user_number: number;
  status: SaleStatus;
  total_amount: number;
  payment_method: string;
  dietary_restrictions?: string;
  has_kit_items?: boolean;
  has_coffee_items?: boolean;
  created_at: string;
  updated_at: string;
  items?: SaleItem[];
  user?: SaleUser;
}

// ============================================================
// Payloads/respostas dos endpoints admin
// ============================================================

export interface UpdateSalePayload {
  status?: Exclude<SaleStatus, "EXPIRADO">;
  payment_method?: string;
  dietary_restrictions?: string;
}

export interface GetAllSalesApiResponse {
  page: number;
  limit: number;
  sort_by: string;
  sort_order: string;
  search_by: string;
  search_value: string;
  total_records: number;
  filtered_records: number;
  sales: Sale[];
}

interface UpdateSaleApiResponse {
  message: string;
  sale: Sale;
}

interface UpdateItemPickupApiResponse {
  message: string;
  item: SaleItem;
}

export const salesAPI = {
  // GET /admin/sales — listagem paginada de vendas (Backoffice)
  getAll: async (
    page = 1,
    pageSize = 10,
    sortField = "created_at",
    sortOrder = "desc",
    filterField?: string,
    filterValue?: string,
  ): Promise<GetAllSalesApiResponse> => {
    const response = await client.get<GetAllSalesApiResponse>("/admin/sales", {
      params: {
        page,
        limit: pageSize,
        sort_by: sortField,
        sort_order: sortOrder,
        search_by: filterField,
        search_value: filterValue,
      },
    });
    return response.data;
  },

  // PUT /admin/sales/:id — atualiza status/dados de uma venda (admin)
  update: async (id: string, payload: UpdateSalePayload): Promise<UpdateSaleApiResponse> => {
    const response = await client.put<UpdateSaleApiResponse>(`/admin/sales/${id}`, payload);
    return response.data;
  },

  // DELETE /admin/sales/:id — remove uma venda (admin)
  delete: async (id: string): Promise<void> => {
    await client.delete(`/admin/sales/${id}`);
  },

  // PATCH /admin/sales/items/:itemId/pickup — marca item como retirado/pendente (admin)
  updateItemPickup: async (
    itemId: string,
    isPickedUp: boolean,
  ): Promise<UpdateItemPickupApiResponse> => {
    const response = await client.patch<UpdateItemPickupApiResponse>(
      `/admin/sales/items/${itemId}/pickup`,
      { is_picked_up: isPickedUp },
    );
    return response.data;
  },
};
