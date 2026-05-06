import client from "./client";
import type { EventType } from "@/types/EventType";
import type { EventsResponse } from "@/types/EventsResponse";

const mapBackendEvent = (event: any): EventType => {
  return {
    name: event.name,
    dateInit: event.init_date,
    dateEnd: event.end_date,
    type: event.type,
    location: event.location,
    description: event.description,
    has_attendance: event.has_attendance,
    image: event.image,
  };
};

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
    return {
      ...response.data,
      events: response.data.events.map(mapBackendEvent),
    };
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
      `/event/${encodeURIComponent(eventName)}/${encodeURIComponent(initDate)}`
    );
    return mapBackendEvent(response.data);
  },
};
