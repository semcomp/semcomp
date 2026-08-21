import client from "./client";
import type { SigninEventType } from "@/types/SigninEventType";

export interface SigninsListResponse {
  signins: SigninEventType[];
  total_records: number;
  filtered_records: number;
}

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

};