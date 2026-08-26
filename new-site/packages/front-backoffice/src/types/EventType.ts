import type { CrudItemType } from "@/types/CrudItem";

export interface EventType  extends CrudItemType {
  nameEvent: string;
  dateInit: string; // RFC3339 format
  dateEnd: string; // RFC3339 format
  local: string;
  type: string;
  type_name: string;
  presence_type_weight_id: number | null;
  description: string;
  hasPresence: boolean;
}