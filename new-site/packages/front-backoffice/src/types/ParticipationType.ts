import type { CrudItemType } from "@/types/CrudItem";

export interface ParticipationType extends CrudItemType {
  userNumber: string;
  nameEvent: string;
  dateEvent: string;
  userBackoffice: string;
  /** Instante do lançamento da presença (RFC3339). Só existe na resposta do
   *  backend — opcional para os payloads de criação não precisarem enviá-lo. */
  createdAt?: string;
}