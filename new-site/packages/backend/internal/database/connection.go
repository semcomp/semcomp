package database

import (
	"fmt"
	"os"
	"time"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func ConnectDB() (*gorm.DB, error) {
	err := godotenv.Load()

	// Configurações de conexão
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
		getEnv("DB_HOST"), getEnv("DB_USER"), getEnv("DB_PASSWORD"), getEnv("DB_NAME"), getEnv("DB_PORT"),
	)
	maxOpenConns := 20
	maxIdleConns := 5
	connMaxLifetime := 30 * time.Minute
	connMaxIdleTime := 5 * time.Minute

	// Conecta ao banco de dados usando GORM
	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN:                  dsn,
		PreferSimpleProtocol: true,
	}), &gorm.Config{})
	if err != nil {
		fmt.Printf("Erro ao conectar ao banco de dados: %v", err)
		return nil, err
	}

	// Configura o pool de conexões
	sqlDB, err := db.DB()
	if err != nil {
		fmt.Printf("Erro ao obter instância do banco de dados: %v", err)
		return nil, err
	}
	sqlDB.SetMaxOpenConns(maxOpenConns)
	sqlDB.SetMaxIdleConns(maxIdleConns)
	sqlDB.SetConnMaxLifetime(connMaxLifetime)
	sqlDB.SetConnMaxIdleTime(connMaxIdleTime)

	return db, nil
}

// Garante que as variáveis de ambiente estão definidas
func getEnv(key string) string {
	value := os.Getenv(key)
	if value == "" {
		panic(fmt.Errorf("Variável de ambiente não está definida"))
	}
	return value
}
