export type ProductType = "KIT" | "COFFEE" | "COMBO";

export interface Kit {
  id: number;
  name: string;
  size: string;
  color: string;
  is_babydoll: boolean;
}

export interface Coffee {
  id: number;
  name: string;
  date_time: string;
}

export interface ComboItem {
  combo_id: number;
  item_id: number;
}

export interface Product {
  id: number;
  type: ProductType;
  is_selling: boolean;
  price: number;
  picture_url?: string;
  kit?: Kit | null;
  coffee?: Coffee | null;
  combo_items?: ComboItem[];
}

export interface ProductsResponse {
  page: number;
  limit: number;
  sort_by: string;
  sort_order: string;
  search_by: string;
  search_value: string;
  total_records: number;
  filtered_records: number;
  products: Product[];
}
