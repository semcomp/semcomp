package apierrors

import "net/http"

type APIError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Status  int    `json:"-"` // Status HTTP para uso interno, não exposto na resposta JSON
	Err     error  `json:"-"` // Error original para log, não exposto na resposta JSON
}

func (e *APIError) Error() string {
	return e.Message
}

func ValidationError(message string, err error) *APIError {
	return &APIError{
		Code:    "validation_error",
		Message: message,
		Status:  http.StatusBadRequest,
		Err:     err,
	}
}

func NotFoundError(message string, err error) *APIError {
	return &APIError{
		Code:    "not_found",
		Message: message,
		Status:  http.StatusNotFound,
		Err:     err,
	}
}

func ConflictError(message string, err error) *APIError {
	return &APIError{
		Code:    "conflict",
		Message: message,
		Status:  http.StatusConflict,
		Err:     err,
	}
}

// Erro para falhas de criacao, remocao, atualizacao, busca de recursos (ex: banco de dados, serviços externos)
func InternalServerError(message string, err error) *APIError {
	return &APIError{
		Code:    "internal_server_error",
		Message: message,
		Status:  http.StatusInternalServerError,
		Err:     err,
	}
}

func UnauthorizedError(message string, err error) *APIError {
	return &APIError{
		Code:    "unauthorized",
		Message: message,
		Status:  http.StatusUnauthorized,
		Err:     err,
	}
}

func ForbiddenError(message string, err error) *APIError {
	return &APIError{
		Code:    "forbidden",
		Message: message,
		Status:  http.StatusForbidden,
		Err:     err,
	}
}
