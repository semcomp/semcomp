import client from "./client";
import type { PageAvailability } from "@/types/APIResponseType";

export type { PageAvailability };

interface PagesAvailabilityResponse {
  pages: Record<string, boolean>;
}

export const pagesAPI = {
  getAll: async (): Promise<PageAvailability[]> => {
    const res = await client.get<PagesAvailabilityResponse>("/pages/availability");
    return Object.entries(res.data.pages ?? {}).map(([page, available]) => ({
      page,
      available,
    }));
  },

  setAvailability: async (page: string, available: boolean): Promise<void> => {
    await client.put(`/admin/pages/${encodeURIComponent(page)}/availability`, { available });
  },
};
