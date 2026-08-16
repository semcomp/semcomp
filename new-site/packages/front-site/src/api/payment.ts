import client from "./client";
import type { SaleResponse } from "@/api/sales";

export interface PixPaymentResponse {
  payment_id: number;
  qr_code: string;
  qr_code_base64: string;
  amount: number;
  expiration_date: string; // ISO 8601
}

export type PixStatus = "approved" | "rejected" | "refunded" | "expired" | "pending";

export interface PixItem {
  product_id: number;
  quantity: number;
}

function mapSaleToPix(sale: SaleResponse): PixPaymentResponse {
  return {
    payment_id: sale.id,
    qr_code: sale.qr_code ?? "",
    qr_code_base64: sale.qr_code_base64 ?? "",
    amount: sale.total_amount,
    expiration_date: sale.pix_expiration ?? new Date().toISOString(),
  };
}

function mapBackendStatus(status: string): PixStatus {
  switch (status) {
    case "PAGO":
      return "approved";
    case "REJEITADO":
    case "CANCELADO":
      return "rejected";
    case "REEMBOLSADO":
      return "refunded";
    case "EXPIRADO":
      return "expired";
    default:
      return "pending";
  }
}

export const paymentAPI = {
  // POST /api/payments/pix — cria a venda e dispara a cobrança PIX no Mercado Pago.
  // O backend espera { payment_method: "PIX", items: [{ product_id, quantity }] }
  // e responde com a venda enriquecida com qr_code/qr_code_base64/pix_expiration.
  createPix: async (items: PixItem[], description?: string): Promise<PixPaymentResponse> => {
    const response = await client.post<{ sale: SaleResponse }>("/api/payments/pix", {
      payment_method: "PIX",
      items,
      description,
    });
    return mapSaleToPix(response.data.sale);
  },

  // GET /api/payments/:id/status — polling do status da venda.
  getStatus: async (paymentId: number): Promise<{ status: PixStatus }> => {
    const response = await client.get<{ status: string }>(`/api/payments/${paymentId}/status`);
    return { status: mapBackendStatus(response.data.status) };
  },
};
