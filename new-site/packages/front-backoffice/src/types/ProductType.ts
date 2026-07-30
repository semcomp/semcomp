export type ProductKind = "KIT" | "COFFEE" | "COMBO";

export interface ProductBase {
    id: number;
    type: "KIT" | "COFFEE" | "COMBO";
    is_selling: boolean;
    price: number;   
}

export interface KitDetails {
    name: string;
    size: string;
    color: string;
    is_babydoll: boolean;
}

export interface CoffeeDetails {
    name: string;
    size: string;
    date_time: string;
}

export interface ComboDetails {
    combo_id: number;
    item_id: number;
}

export interface KitProduct extends ProductBase{
    type: "KIT";
    kit: KitDetails;
}

export interface CoffeeProduct extends ProductBase{
    type: "COFFEE";
    coffee: CoffeeDetails;
}

export interface ComboProduct extends ProductBase{
    type: "COMBO";
    combo: ComboDetails;
}

export type ProductType = 
    | KitProduct
    | CoffeeProduct
    | ComboProduct;