export type PapfeStatus = "aprovado" | "rejeitado" | "pendente";

export type PapfeDocumentType = {
  id: number;
  user_number: number;
  user_name: string;
  user_email: string;
  filename: string;
  content_type: string;
  uploaded_at: string;
  is_approved: boolean | null; // null=pendente, true=aprovado, false=rejeitado
  /** Só presente quando is_approved=false (rejeitado). */
  rejection_reason?: string | null;
};

export const papfeStatusOf = (doc: PapfeDocumentType | null): PapfeStatus =>
  doc == null || doc.is_approved === null
    ? "pendente"
    : doc.is_approved
      ? "aprovado"
      : "rejeitado";
