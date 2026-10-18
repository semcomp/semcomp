package providers

import (
	"errors"
	"os"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func setupJWTEnv(t *testing.T) {
	t.Helper()
	os.Setenv("JWT_SECRET", "super-secret-key-for-test-12345")
	os.Setenv("JWT_EXPIRES_IN_HOURS", "24")
}

func TestJWTProvider_GenerateAndParse_Site(t *testing.T) {
	setupJWTEnv(t)
	p := NewJWTProvider()

	tokenStr, err := p.Generate(42, "participante@example.com")
	if err != nil {
		t.Fatalf("erro ao gerar token de site: %v", err)
	}

	claims, err := p.Parse(tokenStr)
	if err != nil {
		t.Fatalf("erro ao fazer parse do token de site: %v", err)
	}

	if claims.UserNumber != 42 {
		t.Errorf("esperado UserNumber 42, recebido %d", claims.UserNumber)
	}
	if claims.Email != "participante@example.com" {
		t.Errorf("esperado email participante@example.com, recebido %s", claims.Email)
	}
	if claims.Scope != ScopeSite {
		t.Errorf("esperado scope %s, recebido %s", ScopeSite, claims.Scope)
	}
}

func TestJWTProvider_GenerateAndParse_Backoffice(t *testing.T) {
	setupJWTEnv(t)
	p := NewJWTProvider()

	tokenStr, err := p.GenerateToBackoffice("admin@semcomp.com")
	if err != nil {
		t.Fatalf("erro ao gerar token de backoffice: %v", err)
	}

	claims, err := p.ParseToBackoffice(tokenStr)
	if err != nil {
		t.Fatalf("erro ao fazer parse do token de backoffice: %v", err)
	}

	if claims.Email != "admin@semcomp.com" {
		t.Errorf("esperado email admin@semcomp.com, recebido %s", claims.Email)
	}
	if claims.Scope != ScopeBackoffice {
		t.Errorf("esperado scope %s, recebido %s", ScopeBackoffice, claims.Scope)
	}
}

// Reprodução do cenário do pentest: token do site NÃO pode ser aceito pelo backoffice
func TestJWTProvider_SiteToken_RejectedByBackoffice(t *testing.T) {
	setupJWTEnv(t)
	p := NewJWTProvider()

	siteToken, err := p.Generate(10, "participante@example.com")
	if err != nil {
		t.Fatalf("erro ao gerar token de site: %v", err)
	}

	claims, err := p.ParseToBackoffice(siteToken)
	if err == nil {
		t.Fatalf("esperado erro ao validar token do site no contexto do backoffice, mas obteve sucesso: %+v", claims)
	}

	if !errors.Is(err, ErrInvalidTokenScope) {
		t.Errorf("esperado erro ErrInvalidTokenScope, recebido: %v", err)
	}
}

// Token de backoffice NÃO pode ser aceito pelo site
func TestJWTProvider_BackofficeToken_RejectedBySite(t *testing.T) {
	setupJWTEnv(t)
	p := NewJWTProvider()

	backofficeToken, err := p.GenerateToBackoffice("admin@semcomp.com")
	if err != nil {
		t.Fatalf("erro ao gerar token de backoffice: %v", err)
	}

	claims, err := p.Parse(backofficeToken)
	if err == nil {
		t.Fatalf("esperado erro ao validar token de backoffice no contexto do site, mas obteve sucesso: %+v", claims)
	}

	if !errors.Is(err, ErrInvalidTokenScope) {
		t.Errorf("esperado erro ErrInvalidTokenScope, recebido: %v", err)
	}
}

// Token legado ou externo sem claim de scope deve ser rejeitado em ambos
func TestJWTProvider_TokenWithoutScope_Rejected(t *testing.T) {
	setupJWTEnv(t)
	p := NewJWTProvider()

	rawClaims := jwt.MapClaims{
		"id":    uint(1),
		"sub":   "legacy@example.com",
		"exp":   time.Now().Add(1 * time.Hour).Unix(),
		"iat":   time.Now().Unix(),
		"email": "legacy@example.com",
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, rawClaims)
	tokenStr, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		t.Fatalf("erro ao assinar token: %v", err)
	}

	if _, err := p.Parse(tokenStr); !errors.Is(err, ErrInvalidTokenScope) {
		t.Errorf("Parse(): esperado ErrInvalidTokenScope para token sem scope, recebido: %v", err)
	}

	if _, err := p.ParseToBackoffice(tokenStr); !errors.Is(err, ErrInvalidTokenScope) {
		t.Errorf("ParseToBackoffice(): esperado ErrInvalidTokenScope para token sem scope, recebido: %v", err)
	}
}

// Token com escopo adulterado ou desconhecido deve ser rejeitado
func TestJWTProvider_InvalidScope_Rejected(t *testing.T) {
	setupJWTEnv(t)
	p := NewJWTProvider()

	rawClaims := jwt.MapClaims{
		"id":    uint(1),
		"sub":   "hacker@example.com",
		"exp":   time.Now().Add(1 * time.Hour).Unix(),
		"iat":   time.Now().Unix(),
		"email": "hacker@example.com",
		"scope": "superadmin_fake",
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, rawClaims)
	tokenStr, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		t.Fatalf("erro ao assinar token: %v", err)
	}

	if _, err := p.Parse(tokenStr); !errors.Is(err, ErrInvalidTokenScope) {
		t.Errorf("Parse(): esperado ErrInvalidTokenScope, recebido: %v", err)
	}

	if _, err := p.ParseToBackoffice(tokenStr); !errors.Is(err, ErrInvalidTokenScope) {
		t.Errorf("ParseToBackoffice(): esperado ErrInvalidTokenScope, recebido: %v", err)
	}
}
