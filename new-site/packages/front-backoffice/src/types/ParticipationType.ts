import type { CrudItemType } from "@/types/CrudItem";

export interface ParticipationType extends CrudItemType {
  userNumber: string;
  nameEvent: string;
  dateEvent: string;
  userBackoffice: string;
}