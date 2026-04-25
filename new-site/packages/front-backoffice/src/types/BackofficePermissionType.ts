import type { CrudItemType } from "@/types/CrudItem";

export interface BackofficePermissionType extends CrudItemType {
  email: string;
  section: string;
  type: string[];
}