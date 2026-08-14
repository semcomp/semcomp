export type AbsenceJustificationStatus =
  | "em_analise"
  | "aprovado"
  | "negado"
  | "documento_invalido";

export type AbsenceJustificationType = {
  id: number;
  user_number: number;
  user_name: string;
  user_email: string;
  event_name: string;
  event_init_date: string;
  reason: string;
  attachment_filename: string;
  attachment_content_type: string;
  submitted_at: string;
  status: AbsenceJustificationStatus;
};
