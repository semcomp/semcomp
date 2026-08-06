import client from "./client";

// ============================================================
// Payload de criação (usado no fechamento do carrinho/checkout)
// ============================================================

export interface CreateSaleItemPayload {
  product_id: number;
  quantity: number;
}

export interface CreateSalePayload {
  items: CreateSaleItemPayload[];
  payment_method: string;
  status: string;
}

// ============================================================
// Entidades (espelham backend/internal/sales/model.go)
// ============================================================

export interface SaleProduct {
  id: number;
  name: string;
  price: number;
  image_url?: string;
}

// Entidade completa de um item de venda (não confundir com
// CreateSaleItemPayload, que é só o que se envia na criação).
export interface SaleItem {
  id: number;
  sale_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  is_picked_up: boolean;
  product?: SaleProduct;
}

export type SaleStatus = "PENDENTE" | "PAGO" | "CANCELADO" | "REEMBOLSADO";

export interface Sale {
  id: number;
  user_number: number;
  status: SaleStatus;
  total_amount: number;
  payment_method: string;
  created_at: string;
  updated_at: string;
  items?: SaleItem[];
}

// Aliases mantidos para compatibilidade com código que já usava esses nomes
// (tela de perfil do usuário).
export type SaleResponse = Sale;
export type SaleItemResponse = SaleItem;

// ============================================================
// Payloads/respostas específicos de cada endpoint
// ============================================================

export interface UpdateSalePayload {
  status?: SaleStatus;
  payment_method?: string;
}

interface CreateSaleApiResponse {
  message: string;
  sale: Sale;
}

interface GetMySalesApiResponse {
  sales: Sale[];
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
  // POST /api/sales — cria um novo pedido para o usuário autenticado
  create: async (payload: CreateSalePayload): Promise<Sale> => {
    const response = await client.post<CreateSaleApiResponse>("/api/sales", payload);
    return response.data.sale;
  },

  // GET /api/sales/me — histórico de compras do usuário autenticado
  getMySales: async (): Promise<Sale[]> => {
    const response = await client.get<GetMySalesApiResponse>("/api/sales/me");
    return response.data.sales;
  },

  // GET /api/sales/:id — detalhes de uma compra específica do usuário
  getById: async (saleId: number): Promise<Sale> => {
    const response = await client.get<Sale>(`/api/sales/${saleId}`);
    return response.data;
  },

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