import type { CrudItemType } from "@/types/CrudItem";

export interface ParticipationType  extends CrudItemType {
  nameUser: string;
  nameEvent: string;
  dateEvent: string;
  userBackoffice: string;
} 