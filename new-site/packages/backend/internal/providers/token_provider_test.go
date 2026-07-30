package providers

import "testing"

// Testa se o token gerado é hexadecimal de 64 caracteres (32 bytes) e se o hash é determinístico
func TestTokenProvider_Generate(t *testing.T) {
	provider := NewTokenProvider()

	raw, hash, err := provider.Generate()
	if err != nil {
		t.Fatalf("erro não esperado: %v", err)
	}
	if len(raw) != 64 {
		t.Fatalf("esperado token bruto com 64 caracteres hex, recebido %d", len(raw))
	}
	if hash != provider.Hash(raw) {
		t.Fatalf("hash retornado por Generate deveria ser igual ao de Hash(raw)")
	}
}

// Testa se dois tokens gerados são diferentes entre si
func TestTokenProvider_Generate_Unique(t *testing.T) {
	provider := NewTokenProvider()

	raw1, _, _ := provider.Generate()
	raw2, _, _ := provider.Generate()

	if raw1 == raw2 {
		t.Fatalf("tokens gerados não deveriam ser iguais")
	}
}

// Testa se o hash de um mesmo token bruto é sempre o mesmo
func TestTokenProvider_Hash_Deterministic(t *testing.T) {
	provider := NewTokenProvider()

	if provider.Hash("abc") != provider.Hash("abc") {
		t.Fatalf("hash deveria ser determinístico para a mesma entrada")
	}
	if provider.Hash("abc") == provider.Hash("def") {
		t.Fatalf("hashes de entradas diferentes não deveriam colidir")
	}
}
