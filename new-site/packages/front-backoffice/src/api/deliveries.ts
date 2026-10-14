import client from "./client";

export interface BadgeDeliveryUser {
  user_number: string;
  name: string;
  email: string;
  delivered: boolean;
  delivered_at?: string;
  admin_email?: string;
}

export interface BadgeDeliveryListResponse {
  page: number;
  limit: number;
  sort_by: string;
  sort_order: string;
  total_records: number;
  filtered_records: number;
  users: BadgeDeliveryUser[];
}

export const deliveriesAPI = {
  getBadgeDeliveries: async (
    page = 1,
    limit = 10,
    sortBy = "name",
    sortOrder = "asc",
  ): Promise<BadgeDeliveryListResponse> => {
    const response = await client.get<BadgeDeliveryListResponse>("/admin/badge-deliveries", {
      params: { page, limit, sort_by: sortBy, sort_order: sortOrder },
    });
    return response.data;
  },

  markDelivered: async (userNumber: string): Promise<void> => {
    await client.post(`/admin/badge-deliveries/${userNumber}`);
  },

  unmarkDelivered: async (userNumber: string): Promise<void> => {
    await client.delete(`/admin/badge-deliveries/${userNumber}`);
  },
};
