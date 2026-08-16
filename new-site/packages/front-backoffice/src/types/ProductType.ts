import type { CrudItemType } from "@/types/CrudItem";

export type ProductKind = "KIT" | "COFFEE" | "COMBO";

export interface KitDetails {
    id: number;
    name: string;
    size: string;
    color: string;
    is_babydoll: boolean;
}

export interface CoffeeDetails {
    id: number;
    name: string;
    date_time: string;
}

export interface ComboItemDetails {
    combo_id: number;
    item_id: number;
    quantity: number;
    item?: ProductRaw | null;
}

export interface ComboItemRich {
    itemId: number;
    name: string;
    type: "KIT" | "COFFEE";
    quantity: number;
}

export interface ProductRaw {
    id: number;
    type: ProductKind;
    name: string;
    is_selling: boolean;
    price: number;
    picture_url?: string;
    description?: string;
    kit?: KitDetails | null;
    coffee?: CoffeeDetails | null;
    combo_items?: ComboItemDetails[] | null;
}

export type Product = ProductRaw;

export interface ProductType extends CrudItemType {
    productId: number;
    type: ProductKind;
    name: string;
    isSelling: string;   // "true" / "false" - string para renderizar no select
    price: string;       // string para CrudTable
    pictureUrl: string;
    description: string;
    // Kit fields
    kitName: string;
    kitSize: string;
    kitColor: string;
    kitIsBabydoll: string;
    // Coffee fields
    coffeeName: string;
    coffeeDateTime: string;
    // Combo fields
    comboItems: string;          // resumo legível para exibição na tabela
    comboItemDetails: ComboItemRich[];
}