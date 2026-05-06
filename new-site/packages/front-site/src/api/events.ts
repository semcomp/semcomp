import client from "./client";
import type { EventType } from "@/types/EventType";
import type { EventsResponse } from "@/types/EventsResponse";

/**
 * Endpoints de eventos
 */

export const eventsAPI = {
  /**
   * Obtém todos os eventos
   * @returns Lista de eventos
   */
  getAllEvents: async (): Promise<EventsResponse> => {
    const response = await client.get<EventsResponse>("/events");
    return response.data;
  },

  /**
   * Obtém um evento específico pelo nome e data inicial
   * @param eventName Nome do evento
   * @param initDate Data inicial do evento (ISO format)
   * @returns Dados do evento
   */
  getEventByNameAndDate: async (
    eventName: string,
    initDate: string
  ): Promise<EventType> => {
    const response = await client.get<EventType>(
      `/event/${eventName}/${initDate}`
    );
    return response.data;
  },
};
