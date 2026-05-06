import type { CrudItemType } from "@/types/CrudItem";

export interface BackofficeUserType extends CrudItemType {
  email: string;
  password?: string;
}