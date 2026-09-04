import type { CrudItemType } from "@/types/CrudItem";

export interface SigninEventType extends CrudItemType{
    userNumber: number;
    eventName: string;
    eventInitDate: string;
    userWaitListPosition?: number;
    status: "Inscrito" | "Lista de Espera" | "Cancelado";
}