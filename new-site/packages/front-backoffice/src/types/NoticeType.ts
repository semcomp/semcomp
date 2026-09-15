import type { CrudItemType } from "@/types/CrudItem";

export interface NoticeType extends CrudItemType {
  title: string;
  description: string;
  dateTime: string;
}
