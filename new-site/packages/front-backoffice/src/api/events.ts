import client from "./client";
import type { EventType } from "@/types/EventType";

export interface EventsListResponse {
  page: number;
  limit: number;
  sort_by: string;
  sort_order: string;
  search_by: string | null;
  search_value: string | null;
  total_records: number;
  filtered_records: number;
  events: EventType[];
}

/**
 * Mapeia dados do backend para formato local
 */
const mapBackendEvent = (event: any): EventType => {
  return {
    id: `${event.name}__${event.init_date}`,
    nameEvent: event.name,
    dateInit: event.init_date,
    dateEnd: event.end_date,
    local: event.location,
    type: event.type,
    type_name: event.type_name || event.type || "",
    presence_type_weight_id: event.presence_type_weight_id != null ? Number(event.presence_type_weight_id) : null,
    description: event.description,
    hasPresence: event.has_attendance,
    hasSignin: event.has_signin ?? false,
    maxParticipants: event.max_participants ?? 0,
  };
};

const normalizeBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return Boolean(value);
};

const normalizeRFC3339 = (value: unknown): string => {
  if (typeof value !== "string") return String(value ?? "");
  if (!value.trim()) return value;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toISOString();
};

/**
 * Mapeia formato local para backend
 */
const mapToBackendEvent = (event: EventType) => {
  let typeId: number | null = null;
  if (event.presence_type_weight_id != null && event.presence_type_weight_id !== ("__none__" as any)) {
    const parsed = Number(event.presence_type_weight_id);
    typeId = isNaN(parsed) ? null : parsed;
  }

  const payload: Record<string, unknown> = {
    name: event.nameEvent,
    init_date: normalizeRFC3339(event.dateInit),
    end_date: normalizeRFC3339(event.dateEnd),
    presence_type_weight_id: typeId,
    has_attendance: normalizeBoolean(event.hasPresence),
    has_signin: normalizeBoolean(event.hasSignin),
    max_participants: Number(event.maxParticipants) || 0,
  };
  if (event.local) payload.location = event.local;
  if (event.description) payload.description = event.description;
  console.log("Mapeamento de evento:", { original: event, mapped: payload });
  return payload;
};

const fieldMap: Record<string, string> = {
  nameEvent: "name",
  dateInit: "init_date",
  dateEnd: "end_date",
  local: "location",
  hasPresence: "has_attendance",
  hasSignin: "has_signin",
  maxParticipants: "max_participants",
  type: "type",
  description: "description",
};

/**
 * API para gerenciar eventos
 */

export const eventsAPI = {
  getAll: async (
    page = 1,
    limit = 10,
    sortBy = "init_date",
    sortOrder = "asc",
    searchBy?: string,
    searchValue?: string
  ): Promise<EventsListResponse> => {
    const backendSortBy = fieldMap[sortBy] ?? sortBy;
    const backendSearchBy = searchBy ? (fieldMap[searchBy] ?? searchBy) : undefined;

    let url = `/admin/events?page=${page}&limit=${limit}&sort_by=${backendSortBy}&sort_order=${sortOrder}`;
    if (backendSearchBy && searchValue) {
      url += `&search_by=${backendSearchBy}&search_value=${searchValue}`;
    }
    const response = await client.get<any>(url);
    return {
      ...response.data,
      events: response.data.events.map(mapBackendEvent),
    };
  },


  /**
   * Busca um evento específico
   */
  getByNameAndDate: async (eventName: string, initDate: string): Promise<EventType> => {
    const response = await client.get<any>(
      `/event/${encodeURIComponent(eventName)}/${encodeURIComponent(initDate)}`
    );
    return mapBackendEvent(response.data);
  },

  /**
   * Cria um novo evento
   */
  create: async (data: Omit<EventType, "id">): Promise<EventType> => {
    const payload = mapToBackendEvent(data);
    console.log("Payload enviado para criar evento:", payload);
    
    try {
      const response = await client.post<any>("/admin/events", payload);
      console.log("Resposta do backend ao criar evento:", response.data);
      return mapBackendEvent(response.data.event);
    } catch (error: any) {
      console.error("Erro ao criar evento - Resposta do backend:", error.response?.data);
      throw error;
    }
  },

  /**
   * Atualiza um evento
   */
  update: async (
    eventName: string,
    initDate: string,
    data: Partial<Omit<EventType, "id">>
  ): Promise<EventType> => {
    let typeId: number | null = null;
    if (data.presence_type_weight_id != null && data.presence_type_weight_id !== ("__none__" as any)) {
      const parsed = Number(data.presence_type_weight_id);
      typeId = isNaN(parsed) ? null : parsed;
    }

    const response = await client.put<any>(
      `/admin/events/${encodeURIComponent(eventName)}/${encodeURIComponent(initDate)}`,
      {
        name: data.nameEvent,
        init_date: normalizeRFC3339(data.dateInit),
        end_date: normalizeRFC3339(data.dateEnd),
        presence_type_weight_id: typeId,
        location: data.local,
        description: data.description,
        has_attendance: normalizeBoolean(data.hasPresence),
        has_signin: normalizeBoolean(data.hasSignin),
        max_participants: Number(data.maxParticipants) || 0,
      }
    );
    return mapBackendEvent(response.data.event);
  },

  /**
   * Deleta um evento
   */
  delete: async (eventName: string, initDate: string): Promise<{ message: string }> => {
    const response = await client.delete<{ message: string }>(
      `/admin/events/${encodeURIComponent(eventName)}/${encodeURIComponent(initDate)}`
    );
    return response.data;
  },
};