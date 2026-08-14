package absenceJustification

import "time"

const (
	StatusEmAnalise         = "em_analise"
	StatusAprovado          = "aprovado"
	StatusNegado            = "negado"
	StatusDocumentoInvalido = "documento_invalido"
)

// WholeEventName identifica que a justificativa é para a SEMCOMP como um todo,
// não para uma sessão/palestra específica — cada participante tem no máximo uma
// justificativa (UserEmail é único).
const WholeEventName = "SEMCOMP"

// AbsenceJustification armazena a justificativa de ausência de um participante, junto
// do comprovante anexado. O arquivo fica em disco (uploads/absence-justifications/);
// aqui salvamos apenas o path relativo.
type AbsenceJustification struct {
	ID                    uint      `gorm:"primaryKey;autoIncrement"`
	UserEmail             string    `gorm:"size:150;not null;uniqueIndex"`
	EventName             string    `gorm:"size:200;not null"`
	EventInitDate         time.Time `gorm:"type:timestamptz;not null"`
	Reason                string    `gorm:"type:text;not null"`
	AttachmentFilename    string    `gorm:"size:255;not null"`
	AttachmentContentType string    `gorm:"size:100;not null"`
	AttachmentFilePath    string    `gorm:"size:500;not null"`
	SubmittedAt           time.Time `gorm:"not null"`
	Status                string    `gorm:"size:20;not null;default:em_analise"`
	// RejectionReason só existe quando o status é "negado"; em qualquer outro status
	// permanece NULL e é omitido nas respostas JSON.
	RejectionReason *string `gorm:"type:text"`
}

type CreateAbsenceJustificationRequest struct {
	Reason string `form:"reason" json:"reason" binding:"required,max=2000"`

	// Preenchidos pelo handler a partir do arquivo multipart — não serializados
	AttachmentFilename    string `form:"-" json:"-"`
	AttachmentContentType string `form:"-" json:"-"`
	AttachmentData        []byte `form:"-" json:"-"`
}

// UpdateAbsenceJustificationRequest é usado pelo próprio participante para editar o
// motivo e, opcionalmente, substituir o anexo — só permitido enquanto o status for
// "em_analise" ou "documento_invalido".
type UpdateAbsenceJustificationRequest struct {
	Reason string `form:"reason" json:"reason" binding:"required,max=2000"`

	// Preenchidos pelo handler a partir do arquivo multipart, se um novo anexo foi enviado
	AttachmentFilename    string `form:"-" json:"-"`
	AttachmentContentType string `form:"-" json:"-"`
	AttachmentData        []byte `form:"-" json:"-"`
}

type UpdateStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=em_analise aprovado negado documento_invalido"`

	// Obrigatório quando Status="negado"; ignorado/limpo nos demais status.
	RejectionReason string `json:"rejection_reason"`
}

// AbsenceJustificationInfo é a projeção retornada tanto para o backoffice quanto para
// o próprio participante, com os dados do usuário já resolvidos via join.
type AbsenceJustificationInfo struct {
	ID                    uint      `json:"id"`
	UserNumber            uint      `json:"user_number"`
	UserName              string    `json:"user_name"`
	UserEmail             string    `json:"user_email"`
	EventName             string    `json:"event_name"`
	EventInitDate         time.Time `json:"event_init_date"`
	Reason                string    `json:"reason"`
	AttachmentFilename    string    `json:"attachment_filename"`
	AttachmentContentType string    `json:"attachment_content_type"`
	SubmittedAt           time.Time `json:"submitted_at"`
	Status                string    `json:"status"`

	// Só presente quando Status="negado"; omitido caso contrário.
	RejectionReason *string `json:"rejection_reason,omitempty"`
}
