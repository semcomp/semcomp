import client from "./client";
import type { SigninEventType } from "@/types/SigninEventType";
import type { EventType } from "@/types/EventType";

const mapSigninableEvent = (event: any): EventType => ({
    name: event.name,
    dateInit: event.init_date,
    dateEnd: event.end_date,
    type: event.type,
    location: event.location,
    description: event.description,
    has_attendance: event.has_attendance,
});

export const signinEventsAPI = {
    getMySignins: async (): Promise<SigninEventType[]> => {
        const response = await client.get<{ signins: SigninEventType[] }>("/api/signin-events/me");
        return response.data.signins ?? [];
    },

    createSignin: async (eventName: string, eventInitDate: string): Promise<void> => {
        await client.post("/api/signin-events", {
            event_name: eventName,
            event_init_date: eventInitDate,
        });
    },

    getSigninEvents: async (): Promise<EventType[]> => {
        const response = await client.get<{ events: any[] }>("/api/signin-events");
        return (response.data.events ?? []).map(mapSigninableEvent);
    },

    deleteSignin: async (eventName: string, eventInitDate: string): Promise<void> => {
        await client.delete(
            `/api/signin-events/${encodeURIComponent(eventName)}/${encodeURIComponent(eventInitDate)}`
        );
    },
};
