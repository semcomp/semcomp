package database

import (
	"fmt"
	"os"
	"time"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// AppTimezone é o fuso em que o app interpreta "o dia" de um registro.
//
// A sessão do Postgres conecta em UTC (ver ConnectDB) de propósito: o front
// converte o horário digitado para o instante absoluto antes de enviar, então
// guardar em timestamptz já é o suficiente. A consequência é que comparar só a
// data direto com DATE() usaria o dia UTC, e um café registrado às 22h de São
// Paulo cairia no dia seguinte: o filtro não encontraria o que a tela mostra.
// Por isso os filtros por data convertem explicitamente com AT TIME ZONE.
//
// Trocar a sessão para este fuso NÃO é alternativa: os eventos são gravados com
// o instante absoluto já convertido, então um evento criado às 10h passaria a
// filtrar pelo dia anterior.
//
// O nome é resolvido pelo próprio Postgres, então a imagem distroless do backend
// não precisa de tzdata.
const AppTimezone = "America/Sao_Paulo"

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
	const maxAttempts = 10
	const retryDelay = 3 * time.Second

	var db *gorm.DB
	var connectErr error

	for attempt := 1; attempt <= maxAttempts; attempt++ {
		db, connectErr = gorm.Open(postgres.New(postgres.Config{
			DSN:                  dsn,
			PreferSimpleProtocol: true,
		}), &gorm.Config{})
		if connectErr == nil {
			sqlDB, sqlErr := db.DB()
			if sqlErr == nil {
				connectErr = sqlDB.Ping()
			}
		}

		if connectErr == nil {
			break
		}

		if attempt < maxAttempts {
			fmt.Printf("Banco indisponivel, tentando novamente em %s (%d/%d): %v\n", retryDelay, attempt, maxAttempts, connectErr)
			time.Sleep(retryDelay)
		}
	}

	if connectErr != nil {
		fmt.Printf("Erro ao conectar ao banco de dados: %v", connectErr)
		return nil, connectErr
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
		panic(fmt.Errorf("variável de ambiente %q não está definida", key))
	}
	return value
}
