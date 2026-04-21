import type { CrudItemType } from "@/types/CrudItem";

export interface BackofficeUserType extends CrudItemType {
  name: string;
  email: string;
  password: string;
}