import client from "./client";
import type { ParticipationType } from "@/types/ParticipationType.ts";

export interface PresencesListResponse{
    presences: ParticipationType[];
    total_records: number;
    filtered_records: number;
}

/**
 * Mapeia dados do backend -> frontend
 */
const mapBackendPresence = (presence: any): ParticipationType => {
    return{
        id: `${presence.name}__${presence.event_name}__${presence.event_init_date}`,
        nameUser: presence.name,
        nameEvent: presence.event_name,
        dateEvent: presence.event_init_date,
        userBackoffice: presence.email_admin
    };
};

/**
 * Normaliza data para RFC3339
 */
const normalizeRFC3339 = (value: unknown): string => {
  if (typeof value !== "string") return String(value ?? "");
  if (!value.trim()) return value;

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toISOString();
};

/**
 * Converte formato local -> backend
 */
const mapFrontendPresence = (presence: ParticipationType) => {
  return {
    name: presence.nameUser,
    event_name: presence.nameEvent,
    event_init_date: normalizeRFC3339(presence.dateEvent),
    email_admin: presence.userBackoffice,
  };
};


/**
 * API para gerenciar presenças
 */
export const presenceAPI = {
    getAll: async(
        page = 1,
        limit = 50,
        sortBy = "event_init_date",
        sortOrder = "asc",
        searchBy?: string,
        searchValue?: string
    ): Promise<PresencesListResponse> => {
        let url = `/admin/presences?page=${page}&limit=${limit}&sort_by=${sortBy}&sort_order=${sortOrder}`;
        if (searchBy && searchValue) {
            url += `&search_by=${searchBy}&search_value=${searchValue}`;
        }

        const response = await client.get<any>(url);
        console.log(response.data);

        return{
            ...response.data,
            presences: response.data.Presences.map(mapBackendPresence),
        }
    },

    getByKeys: async (
        name: string,
        eventName: string,
        dateEvent: string
    ): Promise<ParticipationType> => {
        const response = await client.get<any>(
        `/admin/presences/${encodeURIComponent(name)}/${encodeURIComponent(eventName)}/${encodeURIComponent(dateEvent)}`
        );

        return mapBackendPresence(response.data);
    },

    create: async (
        presence: ParticipationType
    ): Promise<ParticipationType> => {
        const payload = mapFrontendPresence(presence);

        console.log("Payload enviado:", payload);

        const response = await client.post<any>(
        "/admin/presences",
        payload
        );

        return mapBackendPresence(response.data.presence);
    },

    update: async (
        originalName: string,
        originalEventName: string,
        originalDateEvent: string,
        updatedPresence: ParticipationType
    ): Promise<void> => {
        const payload = mapFrontendPresence(updatedPresence);

        await client.put(
            `/admin/presences/${encodeURIComponent(originalName)}/${encodeURIComponent(originalEventName)}/${encodeURIComponent(originalDateEvent)}`,
            payload
        );
    },

    delete: async (
        name: string,
        eventName: string,
        dateEvent: string
    ): Promise<void> => {
        await client.delete(
        `/admin/presences/${encodeURIComponent(name)}/${encodeURIComponent(eventName)}/${encodeURIComponent(dateEvent)}`
        );
    },
}