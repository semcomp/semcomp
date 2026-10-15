package middleware

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"backend/internal/providers"

	"github.com/gin-gonic/gin"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func setupTestJWTEnv(t *testing.T) providers.JWTProvider {
	t.Helper()
	os.Setenv("JWT_SECRET", "super-secret-key-for-test-12345")
	os.Setenv("JWT_EXPIRES_IN_HOURS", "24")
	return providers.NewJWTProvider()
}

func TestAuthMiddleware(t *testing.T) {
	jwtProvider := setupTestJWTEnv(t)

	r := gin.New()
	r.Use(AuthMiddleware(jwtProvider))
	r.GET("/api/test-profile", func(c *gin.Context) {
		userNumber, _ := c.Get("userNumber")
		email, _ := c.Get("email")
		c.JSON(http.StatusOK, gin.H{
			"userNumber": userNumber,
			"email":      email,
		})
	})

	t.Run("Rejeita requisição sem cookie de autenticação", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/api/test-profile", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusUnauthorized {
			t.Fatalf("esperado status 401, recebido %d", w.Code)
		}
	})

	t.Run("Permite acesso com token de site válido", func(t *testing.T) {
		token, err := jwtProvider.Generate(123, "aluno@usp.br")
		if err != nil {
			t.Fatalf("falha ao gerar token: %v", err)
		}

		req, _ := http.NewRequest(http.MethodGet, "/api/test-profile", nil)
		req.AddCookie(&http.Cookie{Name: "semcomp-site-token", Value: token})
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("esperado status 200, recebido %d. Body: %s", w.Code, w.Body.String())
		}

		var resp map[string]interface{}
		if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
			t.Fatalf("falha ao deserializar resposta: %v", err)
		}

		if resp["email"] != "aluno@usp.br" {
			t.Errorf("esperado email aluno@usp.br, recebido %v", resp["email"])
		}
		if resp["userNumber"] != float64(123) {
			t.Errorf("esperado userNumber 123, recebido %v", resp["userNumber"])
		}
	})

	t.Run("Rejeita token de backoffice enviado no cookie do site", func(t *testing.T) {
		backofficeToken, err := jwtProvider.GenerateToBackoffice("admin@semcomp.com")
		if err != nil {
			t.Fatalf("falha ao gerar token de backoffice: %v", err)
		}

		req, _ := http.NewRequest(http.MethodGet, "/api/test-profile", nil)
		req.AddCookie(&http.Cookie{Name: "semcomp-site-token", Value: backofficeToken})
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusUnauthorized {
			t.Fatalf("esperado status 401, recebido %d", w.Code)
		}
	})
}

func TestAuthBackofficeMiddleware(t *testing.T) {
	jwtProvider := setupTestJWTEnv(t)

	r := gin.New()
	r.Use(AuthBackofficeMiddleware(jwtProvider))
	r.GET("/admin/test-dashboard", func(c *gin.Context) {
		email, _ := c.Get("email")
		c.JSON(http.StatusOK, gin.H{"email": email})
	})

	t.Run("Rejeita requisição sem cookie de backoffice", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/admin/test-dashboard", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusUnauthorized {
			t.Fatalf("esperado status 401, recebido %d", w.Code)
		}
	})

	t.Run("Permite acesso com token de backoffice legítimo", func(t *testing.T) {
		token, err := jwtProvider.GenerateToBackoffice("admin@semcomp.com")
		if err != nil {
			t.Fatalf("falha ao gerar token: %v", err)
		}

		req, _ := http.NewRequest(http.MethodGet, "/admin/test-dashboard", nil)
		req.AddCookie(&http.Cookie{Name: "semcomp-backoffice-token", Value: token})
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("esperado status 200, recebido %d. Body: %s", w.Code, w.Body.String())
		}

		var resp map[string]interface{}
		if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
			t.Fatalf("falha ao deserializar resposta: %v", err)
		}

		if resp["email"] != "admin@semcomp.com" {
			t.Errorf("esperado email admin@semcomp.com, recebido %v", resp["email"])
		}
	})

	// Teste do vetor de ataque da Vulnerabilidade 1 do pentest:
	// Participante autentica no site, renomeia cookie para semcomp-backoffice-token e tenta acessar rota de backoffice
	t.Run("Bloqueia token do site renomeado como semcomp-backoffice-token (Vulnerabilidade 1)", func(t *testing.T) {
		siteToken, err := jwtProvider.Generate(999, "participante@usp.br")
		if err != nil {
			t.Fatalf("falha ao gerar token de participante: %v", err)
		}

		req, _ := http.NewRequest(http.MethodGet, "/admin/test-dashboard", nil)
		req.AddCookie(&http.Cookie{Name: "semcomp-backoffice-token", Value: siteToken})
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusUnauthorized {
			t.Fatalf("esperado status 401, recebido %d. O token do site foi indevidamente aceito no backoffice!", w.Code)
		}

		var resp map[string]string
		if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
			t.Fatalf("falha ao deserializar resposta: %v", err)
		}

		if resp["error"] != "Token inválido para o backoffice" {
			t.Errorf("esperado 'Token inválido para o backoffice', recebido '%s'", resp["error"])
		}
	})
}
