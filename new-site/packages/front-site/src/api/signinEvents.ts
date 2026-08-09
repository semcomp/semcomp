import client from "./client";
import type { SigninEventType } from "@/types/SigninEventType";

export const signinEventsAPI = {
    getMySignins: async (): Promise<SigninEventType[]> => {
        const response = await client.get<{ signin_events: SigninEventType[] }>("/api/signins-events/me");
        return response.data.signin_events ?? [];
    },

    createSignin: async (eventName: string, eventInitDate: string): Promise<SigninEventType> => {
    const response = await client.post<SigninEventType>("/api/signin-events", {
        event_name: eventName,
        event_init_date: eventInitDate,
    });
        return response.data;
    },

    getSigninEvents: async (): Promise<SigninEventType[]> => {
        const response = await client.get<{ signin_events: SigninEventType[] }>("/api/signin-events");
        return response.data.signin_events ?? [];
    }
};
