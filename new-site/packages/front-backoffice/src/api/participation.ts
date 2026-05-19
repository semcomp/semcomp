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
const mapBackendPresence = (presence: any): any => {
    return{
        id: `${presence.user_number}__${presence.event_name}__${presence.event_init_date}`,
        userNumber: presence.user_number,
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
  const normalizedUserNumber =
    typeof presence.user_number === "string"
      ? parseInt(presence.user_number, 10)
      : presence.user_number;

  return {
    user_number: normalizedUserNumber,
    event_name: presence.name_event,
    event_init_date: normalizeRFC3339(presence.date_event),
    email_admin: presence.user_backoffice,
  };
};


/**
 * API para gerenciar presenças
 */
export const participationAPI = {
    getAll: async(
        page = 1,
        limit = 10,
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
        const presences = response.data.Presences ?? response.data.presences ?? [];

        return{
            ...response.data,
            presences: presences.map(mapBackendPresence),
        }
    },

    getByKeys: async (
        userNumber: string,
        eventName: string,
        dateEvent: string
    ): Promise<ParticipationType> => {
        const response = await client.get<any>(
        `/admin/presences/${encodeURIComponent(userNumber)}/${encodeURIComponent(eventName)}/${encodeURIComponent(dateEvent)}`
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

        return mapBackendPresence(response.data.Presences);
    },

    update: async (
        originalUserNumber: string,
        originalEventName: string,
        originalDateEvent: string,
        updatedPresence: ParticipationType
    ): Promise<void> => {
        console.log("Atualizando presença:", {
            originalUserNumber,
            originalEventName,
            originalDateEvent,
            updatedPresence
        });
        const payload = mapFrontendPresence(updatedPresence);

        await client.put(
            `/admin/presences/${encodeURIComponent(originalUserNumber)}/${encodeURIComponent(originalEventName)}/${encodeURIComponent(originalDateEvent)}`,
            payload
        );
    },

    delete: async (
        userNumber: string,
        eventName: string,
        dateEvent: string
    ): Promise<void> => {
        console.log("Deletando presença:", { userNumber, eventName, dateEvent });
        
        await client.delete(
        `/admin/presences/${encodeURIComponent(userNumber)}/${encodeURIComponent(eventName)}/${encodeURIComponent(dateEvent)}`
        );
    },

    createByQRCode: async (
        userNumber: string,
        eventName: string,
        eventInitDate: string,
        adminEmail: string
    ): Promise<ParticipationType> => {
        const presence: ParticipationType = {
            user_number: userNumber,
            name_event: eventName,
            date_event: eventInitDate,
            user_backoffice: adminEmail,
        };

        const payload = mapFrontendPresence(presence);

        console.log("Payload QR:", payload);

        const response = await client.post<any>(
            "/admin/presences",
            payload
        );

        console.log("RESPOSTA COMPLETA:", response.data);

        return mapBackendPresence(response.data.presence);
    },
}