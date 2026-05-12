import client from "./client";
import type { ParticipationType } from "@/types/ParticipationType.ts";

export interface PresencesListResponse{
    presences: ParticipationType[];
    total_records: number;
    filtered_records: number;
}

/**
 * Mapeia dados do backend para formato local
 */
const mapBackendPresence = (presence: any): ParticipationType => {
    return{
        nameUser: presence.name,
        nameEvent: presence.event_name,
        dateEvent: presence.event_init_date,
        userBackoffice: presence.email_admin
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
    }

}