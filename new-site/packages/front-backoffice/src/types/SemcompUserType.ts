import type { CrudItemType } from "@/types/CrudItem";

export interface SemcompUserType extends CrudItemType {
  user_number: string;
  name: string;
  email: string;
  password?: string;
  presence_rate: number;
  age?: number;
  gender?: string;
  city?: string;
  education?: string;
  hasPapfe?: boolean;
  disabilities?: string[];
  profession?: string;
  linkedin?: string;
  telegram?: string;
  papfe_document?: File | null;
  quer_cracha?: boolean;
  pegou_camiseta?: boolean;
}
