import type { CrudItemType } from "@/types/CrudItem";

export interface SigninEventType extends CrudItemType{
    user_number: number;
    event_name: string;
    event_init_date: string;
    user_wait_list_position?: number;
    status: "Inscrito" | "Lista de Espera" | "Cancelado";
}