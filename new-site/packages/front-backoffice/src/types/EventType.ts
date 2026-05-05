import type { CrudItemType } from "@/types/CrudItem";

export interface EventType  extends CrudItemType {
  nameEvent: string;
  datetime: string;
  local: string;
  type: string;
  description: string;
  hasPresence: boolean;
}