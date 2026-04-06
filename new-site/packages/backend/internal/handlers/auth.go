package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"backend/internal/models"

	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// Biblioteca de validação para validar os campos de entrada
var validate = validator.New()

func RegisterHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			errorMesssageJSON(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var request RegisterUserRequest
		errReq := json.NewDecoder(r.Body).Decode(&request)
		if errReq != nil {
			errorMesssageJSON(w, "Invalid json register request", http.StatusBadRequest)
			return
		}

		errVal := validate.Struct(request)
		if errVal != nil {
			errorMesssageJSON(w, "Invalid register request: "+errVal.Error(), http.StatusBadRequest)
			return
		}

		hashed, errCrypt := bcrypt.GenerateFromPassword([]byte(request.Password), bcrypt.DefaultCost)
		if errCrypt != nil {
			errorMesssageJSON(w, "Internal Server Error", http.StatusInternalServerError)
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
				errorMesssageJSON(w, "Email already exists", http.StatusBadRequest)
				return
			}
			errorMesssageJSON(w, "Create user failed", http.StatusInternalServerError)
			return
		}

		// Confirmacao de criacao do usuario
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message": "User created successfully",
			"user": map[string]string{
				"name":      user.Name,
				"last_name": user.LastName,
				"email":     user.Email,
			},
		})
	}
}

func LoginHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			errorMesssageJSON(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var request LoginUserRequest
		errReq := json.NewDecoder(r.Body).Decode(&request)
		if errReq != nil {
			errorMesssageJSON(w, "Invalid json login request", http.StatusBadRequest)
			return
		}

		errValidate := validate.Struct(request)
		if errValidate != nil {
			errorMesssageJSON(w, "Invalid auth request: "+errValidate.Error(), http.StatusBadRequest)
			return
		}

		var user models.User
		errUser := db.Where("email = ?", request.Email).First(&user).Error
		if errUser != nil {
			if errors.Is(errUser, gorm.ErrRecordNotFound) {
				errorMesssageJSON(w, "Invalid email or password", http.StatusUnauthorized)
				return
			}
			errorMesssageJSON(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		errPassword := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(request.Password))
		if errPassword != nil {
			errorMesssageJSON(w, "Invalid email or password", http.StatusUnauthorized)
			return
		}

		// Autenticacao usando HS256
		token, errToken := GenerateJWT(user)
		if errToken != nil {
			errorMesssageJSON(w, "Token generation failed", http.StatusInternalServerError)
			return
		}

		// Confirmacao de login do usuario (passa o token para o cliente)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message": "Login successful",
			"user": map[string]string{
				"name":      user.Name,
				"last_name": user.LastName,
				"email":     user.Email,
			},
			"token": token,
		})
	}
}

// Uso validator para validar os campos de entrada
type RegisterUserRequest struct {
	Name     string `json:"name"     validate:"required,min=3"`
	LastName string `json:"last_name" validate:"required,min=3"`
	Email    string `json:"email"    validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
}

type LoginUserRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
}

type JWTClaims struct {
	UserID uint `json:"id"`
	jwt.RegisteredClaims
}

func errorMesssageJSON(w http.ResponseWriter, message string, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}

func GenerateJWT(user models.User) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return "", errors.New("jwt secret not configured")
	}
	hours, err := strconv.Atoi(os.Getenv("JWT_EXPIRES_IN_HOURS"))
	if err != nil {
		hours = 24
	}

	claims := JWTClaims{
		UserID: user.ID,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   fmt.Sprintf("%s", user.Email),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(hours) * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}
