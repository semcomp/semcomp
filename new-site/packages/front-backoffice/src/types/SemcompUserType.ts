import type { CrudItemType } from "@/types/CrudItem";

export interface SemcompUserType extends CrudItemType {
  id: string;
  name: string;
  email: string;
  password?: string;
  presence_rate: number;
}
