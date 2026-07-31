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
}

/**
 * Tipo do produto retornado pelo backend (formato direto da API)
 */
export interface ProductRaw {
    id: number;
    type: ProductKind;
    is_selling: boolean;
    price: number;
    kit?: KitDetails | null;
    coffee?: CoffeeDetails | null;
    combo_items?: ComboItemDetails[] | null;
}

/**
 * Tipo achatado do produto para exibição na CrudTable
 * Campos da especialização são prefixados (kit_name, coffee_name, etc.)
 */
export interface ProductType extends CrudItemType {
    productId: number;
    type: ProductKind;
    isSelling: string;   // "true" / "false" - string para renderizar no select
    price: string;       // string para CrudTable
    // Kit fields
    kitName: string;
    kitSize: string;
    kitColor: string;
    kitIsBabydoll: string;
    // Coffee fields
    coffeeName: string;
    coffeeDateTime: string;
    // Combo fields
    comboItems: string;  // IDs dos itens separados por vírgula (ex: "1, 3, 5")
}