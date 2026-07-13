import client from "./client";
import type { BackofficePermission } from "@/types/APIResponseType";

export type { BackofficePermission };

interface PermissionsListResponse {
  data: {
    permissions: BackofficePermission[];
    total_records: number;
    filtered_records: number;
  };
}

export const permissionsAPI = {
  getAll: async (): Promise<BackofficePermission[]> => {
    const res = await client.get<PermissionsListResponse>(
      "/admin/permissions?page=1&limit=10000&sort_by=user_email&sort_order=asc"
    );
    return res.data.data.permissions ?? [];
  },

  // Returns [] when the caller has no permissions (404).
  // Returns null on transient errors so callers can keep the cached state.
  getMe: async (): Promise<BackofficePermission[] | null> => {
    try {
      const res = await client.get<BackofficePermission[]>("/admin/permissions/me");
      return res.data ?? [];
    } catch (err: any) {
      if (err?.response?.status === 404) return [];
      return null;
    }
  },

  create: async (
    user_email: string,
    section_name: string,
    permission_type: "R" | "RW"
  ): Promise<void> => {
    await client.post("/admin/permissions", { user_email, section_name, permission_type });
  },

  update: async (
    user: string,
    section: string,
    user_email: string,
    section_name: string,
    permission_type: "R" | "RW" | null
  ): Promise<void> => {
    await client.put(
      `/admin/permissions/${encodeURIComponent(user)}/${encodeURIComponent(section)}`,
      { user_email, section_name, permission_type }
    );
  },

  remove: async (user: string, section: string): Promise<void> => {
    await client.delete(
      `/admin/permissions/${encodeURIComponent(user)}/${encodeURIComponent(section)}`
    );
  },
};
