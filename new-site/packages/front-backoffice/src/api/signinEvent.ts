import client from "./client";
import type { SigninEventType } from "@/types/SigninEventType";

export interface SigninsListResponse {
  signins: SigninEventType[];
  total_records: number;
  filtered_records: number;
}

const normalizeRFC3339 = (value: string) => {
    if (!value) return value;

    const date = new Date(value);

    return date.toISOString();
};

/**
 * Mapeia dados do backend -> frontend
 */
const mapBackendSignin = (signin: any) => {
    return {
        userNumber: signin.user_number,
        eventName: signin.event_name,
        eventInitDate: signin.event_init_date,
        userWaitListPosition: signin.user_wait_list_position,
        status: signin.status,
        userName: signin.user_name,
    };
};

const mapFrontendSignin = (signin: SigninEventType) => {
    return {
        user_number: Number(signin.userNumber),
        event_name: signin.eventName,
        event_init_date: normalizeRFC3339(signin.eventInitDate),
        status: signin.status,
    };
};

export const signinEventsAPI = {
    getAll: async (
        page = 1,
        limit = 10,
        sortBy = "event_init_date",
        sortOrder = "asc",
        searchBy?: string,
        searchValue?: string
    ): Promise<SigninsListResponse> => {
        let url = `/admin/signin-events?page=${page}` + `&limit=${limit}` + `&sort_by=${sortBy}` + `&sort_order=${sortOrder}`;
        if (searchBy && searchValue) {
            url += `&search_by=${searchBy}&search_value=${searchValue}`;
        }

        const response = await client.get<any>(url);
        const signins = response.data.signins ?? [];

        return {
            ...response.data,
            signins: signins.map(mapBackendSignin),
        };
    },
    delete: async (
        userNumber: number,
        eventName: string,
        eventInitDate: string
        ) => {
        await client.delete(
            `/admin/signin-events/${userNumber}/${encodeURIComponent(eventName)}/${encodeURIComponent(eventInitDate)}`
        );
    },
    create: async (data: SigninEventType): Promise<SigninEventType> => {
        const response = await client.post(
                "/admin/signin-events",
                mapFrontendSignin(data)
            );

        return mapBackendSignin(response.data.signin);
    },
    update: async (
        userNumber: number,
        eventName: string,
        eventInitDate: string,
        data: SigninEventType
    ): Promise<SigninEventType> => {
        const response = await client.put(
            `/admin/signin-events/${userNumber}/${encodeURIComponent(eventName)}/${encodeURIComponent(eventInitDate)}`,
            {
                status: data.status,
            }
        );

        return mapBackendSignin(response.data.signin);
    },

    rotate: async (eventName: string, eventInitDate: string): Promise<SigninEventType[]> => {
        const response = await client.post<any>(
            `/admin/signin-events/rotate/${encodeURIComponent(eventName)}/${encodeURIComponent(eventInitDate)}`
        );
        return (response.data.signins ?? []).map(mapBackendSignin);
    },

    getSigninableEvents: async (): Promise<SigninableEvent[]> => {
        const response = await client.get<any>("/admin/signin-events/events");
        return response.data.events ?? [];
    },

    register: async (
        userNumber: number,
        eventName: string,
        eventInitDate: string
    ): Promise<SigninEventType> => {
        const response = await client.put<any>(
            `/admin/signin-events/${userNumber}/${encodeURIComponent(eventName)}/${encodeURIComponent(eventInitDate)}/register`
        );
        return mapBackendSignin(response.data.signin);
    },
};

export const confirmationsAPI = {
    getAll: async (
        page = 1,
        limit = 500,
        sortBy = "user_wait_list_position",
        sortOrder: "asc" | "desc" = "asc",
        searchBy?: string,
        searchValue?: string
    ): Promise<SigninsListResponse> => {
        let url = `/admin/confirmations?page=${page}&limit=${limit}&sort_by=${sortBy}&sort_order=${sortOrder}`;
        if (searchBy && searchValue) {
            url += `&search_by=${encodeURIComponent(searchBy)}&search_value=${encodeURIComponent(searchValue)}`;
        }
        const response = await client.get<any>(url);
        const signins = response.data.signins ?? [];
        return {
            ...response.data,
            signins: signins.map(mapBackendSignin),
        };
    },

    getSigninableEvents: async (): Promise<SigninableEvent[]> => {
        const response = await client.get<any>("/admin/confirmations/events");
        return response.data.events ?? [];
    },

    approve: async (
        userNumber: number,
        eventName: string,
        eventInitDate: string
    ): Promise<SigninEventType> => {
        const response = await client.put<any>(
            `/admin/confirmations/${userNumber}/${encodeURIComponent(eventName)}/${encodeURIComponent(eventInitDate)}`
        );
        return mapBackendSignin(response.data.signin);
    },
};

export interface SigninableEvent {
    name: string;
    init_date: string;
    end_date: string;
    location: string;
    max_participants: number;
}