import type { CrudItemType } from "@/types/CrudItem";

export interface SemcompUserType extends CrudItemType {
  user_number: string;
  name: string;
  email: string;
  password?: string;
  presence_rate: number;
}
