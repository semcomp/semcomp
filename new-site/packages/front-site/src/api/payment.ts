import client from "./client";

export interface PixPaymentResponse {
  payment_id: number;
  qr_code: string;
  qr_code_base64: string;
  amount: number;
  expiration_date: string; // ISO 8601
}

export const paymentAPI = {
  createPix: async (amount: number, productIds: number[], description?: string): Promise<PixPaymentResponse> => {
    const response = await client.post<PixPaymentResponse>("/api/payments/pix", {
      amount,
      description,
      product_ids: productIds,
    });
    return response.data;
  },

  getStatus: async (paymentId: number): Promise<{ status: string }> => {
    const response = await client.get<{ status: string }>(`/api/payments/${paymentId}/status`);
    return response.data;
  },
};
