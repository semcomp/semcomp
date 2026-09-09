export type SigninEventType = {
    event_name: string;
    event_init_date: string;
    event_end_date: string;
    event_type: string;
    event_location: string;
    event_description: string;
    user_wait_list_position?: number;
    status: "Inscrito" | "Lista de Espera";
};
