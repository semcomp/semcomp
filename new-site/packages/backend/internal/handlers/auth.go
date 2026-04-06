package handlers

import (
	"errors"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// Biblioteca de validação para validar os campos de entrada
var validate = validator.New()

func RegisterHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Verifica request body e decodifica para struct
		var request models.RegisterUserRequest
		errReq := c.ShouldBindJSON(&request)
		if errReq != nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Invalid json register request"})
			return
		}

		errVal := validate.Struct(request)
		if errVal != nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Invalid register request: " + errVal.Error()})
			return
		}

		hashed, errCrypt := bcrypt.GenerateFromPassword([]byte(request.Password), bcrypt.DefaultCost)
		if errCrypt != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
			return
		}

		// Criar o usuário no banco de dados
		user := models.User{
			Name:         request.Name,
			LastName:     request.LastName,
			Email:        request.Email,
			PasswordHash: string(hashed),
		}
		errCreateUser := db.Create(&user).Error
		if errCreateUser != nil {
			if errors.Is(errCreateUser, gorm.ErrDuplicatedKey) {
				c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Email already exists"})
				return
			}
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Create user failed"})
			return
		}

		// Confirmacao de criacao do usuario
		c.Header("Content-Type", "application/json")
		c.Status(http.StatusCreated)
		c.JSON(http.StatusCreated, gin.H{
			"message": "User created successfully",
			"user": map[string]string{
				"name":      user.Name,
				"last_name": user.LastName,
				"email":     user.Email,
			},
		})
	}
}

func LoginHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Verifica request body e decodifica para struct
		var request models.LoginUserRequest
		errReq := c.ShouldBindJSON(&request)
		if errReq != nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Invalid json login request"})
			return
		}

		errValidate := validate.Struct(request)
		if errValidate != nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Invalid auth request: " + errValidate.Error()})
			return
		}

		// Busca do usuário no banco de dados pelo email
		var user models.User
		errUser := db.Where("email = ?", request.Email).First(&user).Error
		if errUser != nil {
			if errors.Is(errUser, gorm.ErrRecordNotFound) {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
				return
			}
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
			return
		}

		errPassword := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(request.Password))
		if errPassword != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
			return
		}

		// Autenticacao usando HS256
		token, errToken := GenerateJWT(user)
		if errToken != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Token generation failed"})
			return
		}

		// Confirmacao de login do usuario (passa o token para o cliente)
		c.Header("Content-Type", "application/json")
		c.Status(http.StatusOK)
		c.JSON(http.StatusOK, gin.H{
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

func GenerateJWT(user models.User) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return "", errors.New("jwt secret not configured")
	}
	hours, err := strconv.Atoi(os.Getenv("JWT_EXPIRES_IN_HOURS"))
	if err != nil {
		hours = 24
	}

	// JWT claims com o ID do usuário e informações de expiração
	claims := models.JWTClaims{
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
