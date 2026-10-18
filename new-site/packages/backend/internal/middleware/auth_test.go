package middleware

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"backend/internal/permission"
	"backend/internal/providers"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
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

	t.Run("Rejeita token de backoffice expirado", func(t *testing.T) {
		token := signTestToken(t, os.Getenv("JWT_SECRET"), jwt.MapClaims{
			"sub":   "admin@semcomp.com",
			"email": "admin@semcomp.com",
			"scope": providers.ScopeBackoffice,
			"exp":   time.Now().Add(-1 * time.Minute).Unix(),
		})

		w := doBackofficeRequest(r, "/admin/test-dashboard", token)
		if w.Code != http.StatusUnauthorized {
			t.Fatalf("esperado status 401, recebido %d", w.Code)
		}
	})

	t.Run("Rejeita token de backoffice com assinatura inválida", func(t *testing.T) {
		token := signTestToken(t, "outra-chave-qualquer", jwt.MapClaims{
			"sub":   "admin@semcomp.com",
			"email": "admin@semcomp.com",
			"scope": providers.ScopeBackoffice,
			"exp":   time.Now().Add(1 * time.Hour).Unix(),
		})

		w := doBackofficeRequest(r, "/admin/test-dashboard", token)
		if w.Code != http.StatusUnauthorized {
			t.Fatalf("esperado status 401, recebido %d", w.Code)
		}
	})
}

// fakePermissionService concede permissões a partir de um mapa email -> seção -> nível
// e registra se CheckPermission foi chamado.
type fakePermissionService struct {
	permission.PermissionService
	grants map[string]map[string]permission.PermissionLevel
	called bool
}

func (f *fakePermissionService) CheckPermission(email, section string, required permission.PermissionLevel) (bool, error) {
	f.called = true
	actual, ok := f.grants[email][section]
	if !ok {
		return false, nil
	}
	return permission.HasLevel(actual, required), nil
}

// Garante que a autenticação do backoffice (escopo do token) acontece antes do RBAC
// e que a correção da Vulnerabilidade 1 não enfraqueceu o controle de permissões.
func TestBackofficeAuthAndPermissionChain(t *testing.T) {
	jwtProvider := setupTestJWTEnv(t)

	perms := &fakePermissionService{grants: map[string]map[string]permission.PermissionLevel{
		"admin@semcomp.com": {"Configurações Presença": permission.PermRW},
	}}

	r := gin.New()
	admin := r.Group("/admin")
	admin.Use(AuthBackofficeMiddleware(jwtProvider))
	admin.GET("/presence-settings", RequirePermission(perms, "Configurações Presença", permission.PermR), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"ok": true})
	})

	t.Run("Sem cookie retorna 401 sem consultar o RBAC", func(t *testing.T) {
		perms.called = false
		w := doBackofficeRequest(r, "/admin/presence-settings", "")
		if w.Code != http.StatusUnauthorized {
			t.Fatalf("esperado status 401, recebido %d", w.Code)
		}
		if perms.called {
			t.Error("RBAC não deveria ser consultado sem autenticação")
		}
	})

	// Vetor de escalada: participante do site cadastrado com o mesmo email de um admin.
	// Antes da correção, o RBAC era avaliado com as permissões do admin.
	t.Run("Token do site com email de admin é rejeitado na autenticação (401), não no RBAC", func(t *testing.T) {
		perms.called = false
		siteToken, err := jwtProvider.Generate(1, "admin@semcomp.com")
		if err != nil {
			t.Fatalf("falha ao gerar token de site: %v", err)
		}

		w := doBackofficeRequest(r, "/admin/presence-settings", siteToken)
		if w.Code != http.StatusUnauthorized {
			t.Fatalf("esperado status 401, recebido %d. Body: %s", w.Code, w.Body.String())
		}
		if perms.called {
			t.Error("RBAC não deveria ser consultado para token de outro contexto")
		}
	})

	t.Run("Admin válido sem permissão na seção recebe 403", func(t *testing.T) {
		token, err := jwtProvider.GenerateToBackoffice("semperm@semcomp.com")
		if err != nil {
			t.Fatalf("falha ao gerar token: %v", err)
		}

		w := doBackofficeRequest(r, "/admin/presence-settings", token)
		if w.Code != http.StatusForbidden {
			t.Fatalf("esperado status 403, recebido %d", w.Code)
		}
	})

	t.Run("Admin válido com permissão na seção recebe 200", func(t *testing.T) {
		token, err := jwtProvider.GenerateToBackoffice("admin@semcomp.com")
		if err != nil {
			t.Fatalf("falha ao gerar token: %v", err)
		}

		w := doBackofficeRequest(r, "/admin/presence-settings", token)
		if w.Code != http.StatusOK {
			t.Fatalf("esperado status 200, recebido %d. Body: %s", w.Code, w.Body.String())
		}
	})
}

func doBackofficeRequest(r *gin.Engine, path, token string) *httptest.ResponseRecorder {
	req, _ := http.NewRequest(http.MethodGet, path, nil)
	if token != "" {
		req.AddCookie(&http.Cookie{Name: "semcomp-backoffice-token", Value: token})
	}
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func signTestToken(t *testing.T, secret string, claims jwt.MapClaims) string {
	t.Helper()
	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(secret))
	if err != nil {
		t.Fatalf("falha ao assinar token: %v", err)
	}
	return token
}
