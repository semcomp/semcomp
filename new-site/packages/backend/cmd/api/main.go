package main

import (
	"fmt"
	"net/http"

	"backend/internal/database"
	"backend/internal/handlers"
	"backend/internal/models"
)

func main() {
	db, errDB := database.ConnectDB()
	if errDB != nil {
		fmt.Println("Error connecting to database:", errDB)
		return
	}
	db.AutoMigrate(&models.User{}) // Cria a tabela de usuários se não existir

	http.HandleFunc("/", handlers.HomeHandler(db))
	http.HandleFunc("/register", handlers.RegisterHandler(db))

	fmt.Println("Servidor rodando na porta 4000")
	errServer := http.ListenAndServe(":4000", nil)
	if errServer != nil {
		fmt.Println("Erro ao iniciar servidor:", errServer)
	}
}
