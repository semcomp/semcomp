package providers

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
)

type TokenProvider interface {
	// Generate retorna o token bruto (a ser enviado por e-mail) e seu hash SHA-256
	// (a ser persistido no banco). O token bruto nunca deve ser armazenado.
	Generate() (raw string, hash string, err error)
	Hash(raw string) string
}

type tokenProvider struct{}

func NewTokenProvider() TokenProvider {
	return &tokenProvider{}
}

func (p *tokenProvider) Generate() (string, string, error) {
	buf := make([]byte, 32)
	if _, err := rand.Read(buf); err != nil {
		return "", "", err
	}

	raw := hex.EncodeToString(buf)
	return raw, p.Hash(raw), nil
}

func (p *tokenProvider) Hash(raw string) string {
	sum := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(sum[:])
}
