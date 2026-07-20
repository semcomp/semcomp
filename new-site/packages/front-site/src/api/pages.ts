import client from "./client";

interface PagesAvailabilityResponse {
  pages: Record<string, boolean>;
}

/**
 * Endpoints de disponibilidade de páginas (Feature Toggle)
 */
export const pagesAPI = {
  /**
   * Obtém a disponibilidade de todas as páginas registradas
   */
  getAllAvailability: async (): Promise<Record<string, boolean>> => {
    const response = await client.get<PagesAvailabilityResponse>("/pages/availability");
    return response.data.pages ?? {};
  },
};
