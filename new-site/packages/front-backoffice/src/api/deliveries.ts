import client from "./client";
import type { SaleItem } from "./sales";

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

export interface KitDeliveryItem {
  item_id: number;
  sale_id: number;
  user_number: string;
  user_name: string;
  kit_name: string;
  kit_size: string;
  kit_color: string;
  kit_is_babylook: boolean;
  quantity: number;
  is_picked_up: boolean;
}

export interface KitDeliveryListResponse {
  kit_deliveries: KitDeliveryItem[];
  total_records: number;
  filtered_records: number;
  page: number;
  limit: number;
}

export const deliveriesAPI = {
  getBadgeDeliveries: async (
    page = 1,
    limit = 10,
    sortBy = "name",
    sortOrder = "asc",
    searchBy?: string,
    searchValue?: string
  ): Promise<BadgeDeliveryListResponse> => {
    const params: Record<string, string | number> = { page, limit, sort_by: sortBy, sort_order: sortOrder };
    if (searchBy && searchValue) {
      params.search_by = searchBy;
      params.search_value = searchValue;
    }
    const response = await client.get<BadgeDeliveryListResponse>("/admin/badge-deliveries", { params });
    return response.data;
  },

  markDelivered: async (userNumber: string): Promise<void> => {
    await client.post(`/admin/badge-deliveries/${userNumber}`);
  },

  unmarkDelivered: async (userNumber: string): Promise<void> => {
    await client.delete(`/admin/badge-deliveries/${userNumber}`);
  },

  getKitDeliveries: async (
    page = 1,
    limit = 10,
    sortBy = "user_name",
    sortOrder = "asc",
    searchBy?: string,
    searchValue?: string
  ): Promise<KitDeliveryListResponse> => {
    const params: Record<string, string | number> = { page, limit, sort_by: sortBy, sort_order: sortOrder };
    if (searchBy && searchValue) {
      params.search_by = searchBy;
      params.search_value = searchValue;
    }
    const response = await client.get<KitDeliveryListResponse>("/admin/deliveries/kits", { params });
    return response.data;
  },

  updateItemPickup: async (
    itemId: string,
    isPickedUp: boolean,
  ): Promise<{ message: string; item: SaleItem }> => {
    const response = await client.patch<{ message: string; item: SaleItem }>(
      `/admin/sales/items/${itemId}/pickup`,
      { is_picked_up: isPickedUp },
    );
    return response.data;
  },
};
