import type { CrudItemType } from "@/types/CrudItem";

export interface ParticipationType extends CrudItemType {
  user_number: string;
  name_event: string;
  date_event: string;
  user_backoffice: string;
}