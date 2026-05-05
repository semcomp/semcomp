import type { CrudItemType } from "@/types/CrudItem";

export interface SemcompUserType extends CrudItemType {
  user_number: number;
  name: string;
  email: string;
  presence_rate?: number;
}
