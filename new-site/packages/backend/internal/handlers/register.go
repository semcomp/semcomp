package handlers

import (
	"encoding/json"
	"errors"
	"net/http"

	"backend/internal/models"

	"github.com/go-playground/validator/v10"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// Biblioteca de validação para validar os campos de entrada
var validate = validator.New()

func RegisterHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var request CreateUserRequest
		errReq := json.NewDecoder(r.Body).Decode(&request)
		if errReq != nil {
			http.Error(w, "Invalid json register request", http.StatusBadRequest)
			return
		}

		errVal := validate.Struct(request)
		if errVal != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": errVal.Error()})
			return
		}

		hashed, errCrypt := bcrypt.GenerateFromPassword([]byte(request.Password), bcrypt.DefaultCost)
		if errCrypt != nil {
			http.Error(w, "internal error", http.StatusInternalServerError)
			return
		}
		user := models.User{
			Name:         request.Name,
			LastName:     request.LastName,
			Email:        request.Email,
			PasswordHash: string(hashed),
		}

		errCreateUser := db.Create(&user).Error
		if errCreateUser != nil {
			if errors.Is(errCreateUser, gorm.ErrDuplicatedKey) {
				http.Error(w, "Email already in use", http.StatusConflict)
				return
			}
			http.Error(w, "Internal error", http.StatusInternalServerError)
			return
		}

		// Responde com os dados do usuário criado (sem a senha)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(UserResponse{
			Message:  "User created successfully",
			Name:     user.Name,
			LastName: user.LastName,
			Email:    user.Email,
		})
	}
}

// Uso validator para validar os campos de entrada
type CreateUserRequest struct {
	Name     string `json:"name"     validate:"required,min=3"`
	LastName string `json:"last_name" validate:"required,min=3"`
	Email    string `json:"email"    validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
}

type UserResponse struct {
	Message  string `json:"message"`
	Name     string `json:"name"`
	LastName string `json:"last_name"`
	Email    string `json:"email"`
}
