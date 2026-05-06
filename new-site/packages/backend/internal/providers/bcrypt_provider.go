package providers

import "golang.org/x/crypto/bcrypt"

type PasswordProvider interface {
	Hash(password string) (string, error)
	Compare(hashedPassword string, password string) error
}

type bcryptProvider struct{}

func NewBcryptProvider() PasswordProvider {
	return &bcryptProvider{}
}

func (p *bcryptProvider) Hash(password string) (string, error) {
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}

	return string(hashed), nil
}

func (p *bcryptProvider) Compare(hashedPassword string, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}
