import type { CrudItemType } from "@/types/CrudItem";

export interface RiddleType extends CrudItemType {
  riddleId: number;
  hint1: string;
  hint2: string;
  answer: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
}
