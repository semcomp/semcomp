import client from "./client";

export interface SaleItem {
  product_id: number;
  quantity: number;
}

export interface CreateSalePayload {
  items: SaleItem[];
  payment_method: string;
  status: string;
}

export interface SaleProduct {
  id: number;
  name: string;
  price: number;
  image_url?: string;
}

export interface SaleItemResponse {
  id: number;
  sale_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  is_picked_up: boolean;
  product?: SaleProduct;
}

export interface SaleResponse {
  id: number;
  user_number: number;
  status: "PENDING" | "PAID" | "CANCELED" | "REFUNDED" | string;
  total_amount: number;
  payment_method: string;
  created_at: string;
  updated_at: string;
  items?: SaleItemResponse[];
}

interface CreateSaleApiResponse {
  message: string;
  sale: SaleResponse;
}

interface GetMySalesApiResponse {
  sales: SaleResponse[];
}

export const salesAPI = {
  // POST /api/sales — cria um novo pedido para o usuário autenticado
  create: async (payload: CreateSalePayload): Promise<SaleResponse> => {
    const response = await client.post<CreateSaleApiResponse>("/api/sales", payload);
    console.log(response.data.sale);
    return response.data.sale;
  },

  // GET /api/sales/me — histórico de compras do usuário autenticado
  getMySales: async (): Promise<SaleResponse[]> => {
    const response = await client.get<GetMySalesApiResponse>("/api/sales/me");
    return response.data.sales;
  },

  // GET /api/sales/:id — detalhes de uma compra específica do usuário
  getById: async (saleId: number): Promise<SaleResponse> => {
    const response = await client.get<SaleResponse>(`/api/sales/${saleId}`);
    return response.data;
  },
};