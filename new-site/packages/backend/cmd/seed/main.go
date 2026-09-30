// Script de seed do banco de dados — use apenas localmente.
//
// Popula o banco com dados de exemplo cobrindo todas as tabelas do backoffice.
// Todos os registros carregam o prefixo [SEED] (nome) ou seed.*@teste.semcomp.com
// (e-mail) para facilitar a identificação e remoção via `make unseed`.
//
// Uso (via Docker):
//
//	make seed
package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"backend/internal/absenceJustification"
	"backend/internal/database"
	"backend/internal/event"
	"backend/internal/notice"
	"backend/internal/presence"
	"backend/internal/presencesettings"
	"backend/internal/product"
	"backend/internal/riddle"
	"backend/internal/sales"
	"backend/internal/signinEvent"
	"backend/internal/sponsor"
	"backend/internal/user"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func main() {
	db, err := database.ConnectDB()
	if err != nil {
		log.Fatalf("Erro ao conectar ao banco: %v", err)
	}

	log.Println("=== seed start ===")

	pwHash := mustHash("senha123")
	adminEmail := getenv("ADMIN_EMAIL", "adm@semcomp.com")

	seedPresenceTypeWeights(db)
	users := seedUsers(db, pwHash)
	ptypes := queryPresenceTypes(db)
	events := seedEvents(db, ptypes)
	prods := seedProductCatalog(db)
	seedSigninEvents(db, users, events)
	seedPresences(db, users, events, adminEmail)
	seedSales(db, users, prods)
	seedRiddles(db)
	seedTeams(db, users)
	seedSponsors(db)
	seedNotices(db)
	seedPapfeDocs(db, users)
	seedAbsenceJustifications(db, users, events)

	log.Println("=== seed done ===")
}

// ── helpers ────────────────────────────────────────────────────────────────

func mustHash(pw string) string {
	h, err := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("bcrypt: %v", err)
	}
	return string(h)
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func strPtr(s string) *string { return &s }

func dt(year, month, day, hour, min int) time.Time {
	return time.Date(year, time.Month(month), day, hour, min, 0, 0, time.UTC)
}

func skip(label string, n int64) bool {
	if n > 0 {
		log.Printf("%s: já seedado (%d registros), pulando", label, n)
		return true
	}
	return false
}

// ── presence type weights ──────────────────────────────────────────────────

func seedPresenceTypeWeights(db *gorm.DB) {
	weights := []presencesettings.PresenceTypeWeight{
		{TypeName: "Palestra", Weight: 1.0, DefaultHasAttendance: true},
		{TypeName: "Vitrine", Weight: 0.5, DefaultHasAttendance: true},
		{TypeName: "Rodas de conversa", Weight: 0.0, DefaultHasAttendance: false},
		{TypeName: "Minicurso", Weight: 0.0, DefaultHasAttendance: false},
		{TypeName: "Concursos", Weight: 0.0, DefaultHasAttendance: false},
		{TypeName: "Luau", Weight: 0.0, DefaultHasAttendance: false},
		{TypeName: "Gamenight", Weight: 0.0, DefaultHasAttendance: false},
		{TypeName: "Oficina", Weight: 0.0, DefaultHasAttendance: false},
		{TypeName: "Contest", Weight: 0.0, DefaultHasAttendance: false},
		{TypeName: "Jogos de rua", Weight: 0.0, DefaultHasAttendance: false},
		{TypeName: "Coffee", Weight: 0.0, DefaultHasAttendance: false},
		{TypeName: "Coffee Livre", Weight: 0.0, DefaultHasAttendance: false},
		{TypeName: "Coffee Noturno", Weight: 0.0, DefaultHasAttendance: false},
		{TypeName: "Feira", Weight: 0.0, DefaultHasAttendance: false},
		{TypeName: "Abertura", Weight: 0.0, DefaultHasAttendance: false},
		{TypeName: "Encerramento", Weight: 0.0, DefaultHasAttendance: false},
	}
	for i := range weights {
		weights[i].UpdatedAt = time.Now()
		if err := db.Where(presencesettings.PresenceTypeWeight{TypeName: weights[i].TypeName}).
			FirstOrCreate(&weights[i]).Error; err != nil {
			log.Fatalf("PresenceTypeWeight %s: %v", weights[i].TypeName, err)
		}
	}
	log.Printf("PresenceTypeWeights: %d inseridos/verificados", len(weights))
}

func queryPresenceTypes(db *gorm.DB) []presencesettings.PresenceTypeWeight {
	var pts []presencesettings.PresenceTypeWeight
	db.Find(&pts)
	return pts
}

func ptypeID(pts []presencesettings.PresenceTypeWeight, name string) *uint {
	for i := range pts {
		if pts[i].TypeName == name {
			id := pts[i].ID
			return &id
		}
	}
	return nil
}

// ── users ──────────────────────────────────────────────────────────────────

func seedUsers(db *gorm.DB, pwHash string) []user.User {
	var n int64
	db.Model(&user.User{}).Where("email LIKE ?", "seed.%@teste.semcomp.com").Count(&n)
	if !skip("Users", n) {
		rows := []user.User{
			{Name: "Alice Pereira", Email: "seed.alice@teste.semcomp.com", PasswordHash: pwHash, Age: 21, Gender: "Feminino", City: "São Carlos", Education: "Graduação", HasPapfe: true, Disabilities: "", Profession: strPtr("Estudante"), Linkedin: strPtr("https://linkedin.com/in/alice"), EmailVerified: true, QuerCracha: true, AutorizaCompartilhamento: true},
			{Name: "Bruno Santos", Email: "seed.bruno@teste.semcomp.com", PasswordHash: pwHash, Age: 23, Gender: "Masculino", City: "Ribeirão Preto", Education: "Pós-graduação", HasPapfe: false, Disabilities: "", Telegram: strPtr("@brunosantos"), EmailVerified: true, QuerCracha: true, AutorizaCompartilhamento: false},
			{Name: "Carla Oliveira", Email: "seed.carla@teste.semcomp.com", PasswordHash: pwHash, Age: 19, Gender: "Feminino", City: "São Paulo", Education: "Graduação", HasPapfe: false, Disabilities: "Deficiência visual parcial", EmailVerified: true, QuerCracha: false, AutorizaCompartilhamento: true},
			{Name: "Daniel Rocha", Email: "seed.daniel@teste.semcomp.com", PasswordHash: pwHash, Age: 25, Gender: "Masculino", City: "Campinas", Education: "Pós-graduação", HasPapfe: true, Disabilities: "", Profession: strPtr("Engenheiro de Software"), Linkedin: strPtr("https://linkedin.com/in/danielrocha"), Telegram: strPtr("@danielrocha"), EmailVerified: true, QuerCracha: true, AutorizaCompartilhamento: true},
			{Name: "Eva Lima", Email: "seed.eva@teste.semcomp.com", PasswordHash: pwHash, Age: 20, Gender: "Feminino", City: "Araraquara", Education: "Ensino Médio", HasPapfe: false, Disabilities: "", EmailVerified: false, QuerCracha: false, AutorizaCompartilhamento: false},
			{Name: "Felipe Cardoso", Email: "seed.felipe@teste.semcomp.com", PasswordHash: pwHash, Age: 22, Gender: "Masculino", City: "São Carlos", Education: "Graduação", HasPapfe: true, Disabilities: "", Profession: strPtr("Estagiário de Dados"), Linkedin: strPtr("https://linkedin.com/in/felipecardoso"), EmailVerified: true, QuerCracha: true, AutorizaCompartilhamento: true},
			{Name: "Gabriela Mendes", Email: "seed.gabriela@teste.semcomp.com", PasswordHash: pwHash, Age: 24, Gender: "Feminino", City: "Bauru", Education: "Graduação", HasPapfe: false, Disabilities: "Deficiência auditiva leve", Telegram: strPtr("@gabriela_m"), EmailVerified: true, QuerCracha: true, AutorizaCompartilhamento: true},
			{Name: "Henrique Souza", Email: "seed.henrique@teste.semcomp.com", PasswordHash: pwHash, Age: 27, Gender: "Masculino", City: "São José do Rio Preto", Education: "Técnico", HasPapfe: false, Disabilities: "", Profession: strPtr("Analista de Sistemas"), EmailVerified: true, QuerCracha: false, AutorizaCompartilhamento: false},
			{Name: "Isabela Teixeira", Email: "seed.isabela@teste.semcomp.com", PasswordHash: pwHash, Age: 18, Gender: "Feminino", City: "Piracicaba", Education: "Graduação", HasPapfe: true, Disabilities: "", Linkedin: strPtr("https://linkedin.com/in/isabelateixeira"), EmailVerified: true, QuerCracha: true, AutorizaCompartilhamento: true},
			{Name: "João Vitor Nunes", Email: "seed.joaovitor@teste.semcomp.com", PasswordHash: pwHash, Age: 26, Gender: "Masculino", City: "São Carlos", Education: "Pós-graduação", HasPapfe: true, Disabilities: "", Profession: strPtr("Pesquisador"), Linkedin: strPtr("https://linkedin.com/in/joaovitornunes"), Telegram: strPtr("@joaovnunes"), EmailVerified: true, QuerCracha: true, AutorizaCompartilhamento: true},
			{Name: "Larissa Ferreira", Email: "seed.larissa@teste.semcomp.com", PasswordHash: pwHash, Age: 21, Gender: "Feminino", City: "Franca", Education: "Graduação", HasPapfe: false, Disabilities: "", EmailVerified: true, QuerCracha: true, AutorizaCompartilhamento: false},
			{Name: "Marcos Alves", Email: "seed.marcos@teste.semcomp.com", PasswordHash: pwHash, Age: 30, Gender: "Masculino", City: "Presidente Prudente", Education: "Pós-graduação", HasPapfe: false, Disabilities: "Mobilidade reduzida", EmailVerified: false, QuerCracha: false, AutorizaCompartilhamento: false},
			{Name: "Natalia Costa", Email: "seed.natalia@teste.semcomp.com", PasswordHash: pwHash, Age: 22, Gender: "Feminino", City: "São Carlos", Education: "Graduação", HasPapfe: true, Disabilities: "", Profession: strPtr("Pesquisadora"), Linkedin: strPtr("https://linkedin.com/in/natalia"), EmailVerified: true, QuerCracha: true, AutorizaCompartilhamento: true},
			{Name: "Otávio Pires", Email: "seed.otavio@teste.semcomp.com", PasswordHash: pwHash, Age: 24, Gender: "Masculino", City: "São Paulo", Education: "Graduação", HasPapfe: false, Disabilities: "", Telegram: strPtr("@otaviopires"), EmailVerified: true, QuerCracha: false, AutorizaCompartilhamento: true},
			{Name: "Paula Monteiro", Email: "seed.paula@teste.semcomp.com", PasswordHash: pwHash, Age: 20, Gender: "Feminino", City: "Campinas", Education: "Graduação", HasPapfe: false, Disabilities: "TDAH (laudo)", EmailVerified: true, QuerCracha: true, AutorizaCompartilhamento: false},
			{Name: "Rafael Neves", Email: "seed.rafael@teste.semcomp.com", PasswordHash: pwHash, Age: 29, Gender: "Masculino", City: "São Carlos", Education: "Pós-graduação", HasPapfe: true, Disabilities: "", Profession: strPtr("DevOps Engineer"), Linkedin: strPtr("https://linkedin.com/in/rafaelneves"), EmailVerified: true, QuerCracha: true, AutorizaCompartilhamento: true},
			{Name: "Sabrina Lopes", Email: "seed.sabrina@teste.semcomp.com", PasswordHash: pwHash, Age: 23, Gender: "Feminino", City: "Araraquara", Education: "Graduação", HasPapfe: false, Disabilities: "", EmailVerified: false, QuerCracha: true, AutorizaCompartilhamento: true},
			{Name: "Thiago Barbosa", Email: "seed.thiago@teste.semcomp.com", PasswordHash: pwHash, Age: 21, Gender: "Masculino", City: "Ribeirão Preto", Education: "Graduação", HasPapfe: true, Disabilities: "", Profession: strPtr("Desenvolvedor Frontend"), Telegram: strPtr("@thiagobarbosa"), EmailVerified: true, QuerCracha: false, AutorizaCompartilhamento: true},
			{Name: "Ursula Vaz", Email: "seed.ursula@teste.semcomp.com", PasswordHash: pwHash, Age: 25, Gender: "Outro", City: "São Paulo", Education: "Pós-graduação", HasPapfe: false, Disabilities: "", Profession: strPtr("Cientista de Dados"), Linkedin: strPtr("https://linkedin.com/in/ursulavaz"), EmailVerified: true, QuerCracha: true, AutorizaCompartilhamento: false},
			{Name: "Vitor Azevedo", Email: "seed.vitor@teste.semcomp.com", PasswordHash: pwHash, Age: 19, Gender: "Masculino", City: "São Carlos", Education: "Graduação", HasPapfe: false, Disabilities: "", EmailVerified: true, QuerCracha: false, AutorizaCompartilhamento: false},
			{Name: "Wendy Correia", Email: "seed.wendy@teste.semcomp.com", PasswordHash: pwHash, Age: 22, Gender: "Feminino", City: "Bauru", Education: "Graduação", HasPapfe: true, Disabilities: "Ansiedade (laudo)", Telegram: strPtr("@wendycorreia"), EmailVerified: true, QuerCracha: true, AutorizaCompartilhamento: true},
			{Name: "Xavier Mello", Email: "seed.xavier@teste.semcomp.com", PasswordHash: pwHash, Age: 28, Gender: "Masculino", City: "Curitiba", Education: "Pós-graduação", HasPapfe: true, Disabilities: "", Profession: strPtr("Engenheiro de ML"), Linkedin: strPtr("https://linkedin.com/in/xaviermello"), EmailVerified: true, QuerCracha: true, AutorizaCompartilhamento: true},
		}
		res := db.Clauses(clause.OnConflict{DoNothing: true}).CreateInBatches(rows, 50)
		if res.Error != nil {
			log.Fatalf("Users: %v", res.Error)
		}
		log.Printf("Users: %d inseridos", res.RowsAffected)
	}

	var out []user.User
	db.Where("email LIKE ?", "seed.%@teste.semcomp.com").Find(&out)
	return out
}

// ── events ─────────────────────────────────────────────────────────────────

func seedEvents(db *gorm.DB, ptypes []presencesettings.PresenceTypeWeight) []event.Event {
	var n int64
	db.Model(&event.Event{}).Where("name LIKE ?", "[SEED]%").Count(&n)
	if !skip("Events", n) {
		rows := []event.Event{
			// ── Segunda-feira 06/10 ──────────────────────────────────────
			{Name: "[SEED] Abertura Semcomp 29", InitDate: dt(2025, 10, 6, 19, 0), EndDate: dt(2025, 10, 6, 21, 0), PresenceTypeID: ptypeID(ptypes, "Abertura"), Type: "Abertura", Location: "Auditório Fernandinho - ICMC", Description: "Cerimônia de abertura da 29ª edição da Semcomp.", HasAttendance: false, HasSignin: false},
			{Name: "[SEED] Coffee de Abertura", InitDate: dt(2025, 10, 6, 21, 0), EndDate: dt(2025, 10, 6, 22, 0), PresenceTypeID: ptypeID(ptypes, "Coffee"), Type: "Coffee", Location: "Hall do ICMC", Description: "Coffee de confraternização após a cerimônia de abertura.", HasAttendance: false, HasSignin: false},
			// ── Terça-feira 07/10 ────────────────────────────────────────
			{Name: "[SEED] Minicurso: Go para Iniciantes", InitDate: dt(2025, 10, 7, 10, 0), EndDate: dt(2025, 10, 7, 12, 0), PresenceTypeID: ptypeID(ptypes, "Minicurso"), Type: "Minicurso", Location: "Sala 5-001 - ICMC", Description: "Introdução à linguagem Go com foco em APIs REST e concorrência.", HasAttendance: false, HasSignin: true, MaxParticipants: 30},
			{Name: "[SEED] Coffee da manhã - Terça", InitDate: dt(2025, 10, 7, 9, 0), EndDate: dt(2025, 10, 7, 9, 30), PresenceTypeID: ptypeID(ptypes, "Coffee"), Type: "Coffee", Location: "Hall do ICMC", Description: "Coffee break matinal do segundo dia.", HasAttendance: false, HasSignin: false},
			{Name: "[SEED] Palestra: Inteligência Artificial na Prática", InitDate: dt(2025, 10, 7, 14, 0), EndDate: dt(2025, 10, 7, 15, 30), PresenceTypeID: ptypeID(ptypes, "Palestra"), Type: "Palestra", Location: "Auditório Fernandinho - ICMC", Description: "Aplicações reais de IA em produtos de grande escala.", HasAttendance: true, HasSignin: false},
			{Name: "[SEED] Oficina: Docker do Zero", InitDate: dt(2025, 10, 7, 16, 0), EndDate: dt(2025, 10, 7, 18, 0), PresenceTypeID: ptypeID(ptypes, "Oficina"), Type: "Oficina", Location: "Laboratório de Sistemas - ICMC", Description: "Oficina prática de containerização com Docker e Docker Compose.", HasAttendance: false, HasSignin: true, MaxParticipants: 25},
			{Name: "[SEED] Rodas de Conversa: Carreira em Tech", InitDate: dt(2025, 10, 7, 18, 30), EndDate: dt(2025, 10, 7, 20, 0), PresenceTypeID: ptypeID(ptypes, "Rodas de conversa"), Type: "Rodas de conversa", Location: "Sala 3-010 - ICMC", Description: "Bate-papo aberto sobre carreira em tecnologia.", HasAttendance: false, HasSignin: false},
			// ── Quarta-feira 08/10 ───────────────────────────────────────
			{Name: "[SEED] Coffee da manhã - Quarta", InitDate: dt(2025, 10, 8, 9, 0), EndDate: dt(2025, 10, 8, 9, 30), PresenceTypeID: ptypeID(ptypes, "Coffee"), Type: "Coffee", Location: "Hall do ICMC", Description: "Coffee break matinal do terceiro dia.", HasAttendance: false, HasSignin: false},
			{Name: "[SEED] Minicurso: Machine Learning com Python", InitDate: dt(2025, 10, 8, 10, 0), EndDate: dt(2025, 10, 8, 12, 0), PresenceTypeID: ptypeID(ptypes, "Minicurso"), Type: "Minicurso", Location: "Sala 5-002 - ICMC", Description: "Introdução ao aprendizado de máquina com scikit-learn e pandas.", HasAttendance: false, HasSignin: true, MaxParticipants: 35},
			{Name: "[SEED] Vitrine de Empresas", InitDate: dt(2025, 10, 8, 13, 0), EndDate: dt(2025, 10, 8, 17, 0), PresenceTypeID: ptypeID(ptypes, "Vitrine"), Type: "Vitrine", Location: "Hall do ICMC", Description: "Stands de empresas parceiras com oportunidades de estágio e networking.", HasAttendance: true, HasSignin: false},
			{Name: "[SEED] Palestra: Segurança em APIs REST", InitDate: dt(2025, 10, 8, 16, 0), EndDate: dt(2025, 10, 8, 17, 30), PresenceTypeID: ptypeID(ptypes, "Palestra"), Type: "Palestra", Location: "Auditório Fernandinho - ICMC", Description: "Boas práticas de segurança para APIs modernas.", HasAttendance: true, HasSignin: false},
			{Name: "[SEED] Gamenight", InitDate: dt(2025, 10, 8, 19, 0), EndDate: dt(2025, 10, 8, 22, 0), PresenceTypeID: ptypeID(ptypes, "Gamenight"), Type: "Gamenight", Location: "Corredor do ICMC", Description: "Noite de jogos de tabuleiro, card games e videogame.", HasAttendance: false, HasSignin: true, MaxParticipants: 60},
			// ── Quinta-feira 09/10 ───────────────────────────────────────
			{Name: "[SEED] Coffee da manhã - Quinta", InitDate: dt(2025, 10, 9, 9, 0), EndDate: dt(2025, 10, 9, 9, 30), PresenceTypeID: ptypeID(ptypes, "Coffee"), Type: "Coffee", Location: "Hall do ICMC", Description: "Coffee break matinal do quarto dia.", HasAttendance: false, HasSignin: false},
			{Name: "[SEED] Palestra: Sistemas Distribuídos na Nuvem", InitDate: dt(2025, 10, 9, 10, 0), EndDate: dt(2025, 10, 9, 11, 30), PresenceTypeID: ptypeID(ptypes, "Palestra"), Type: "Palestra", Location: "Auditório Fernandinho - ICMC", Description: "Arquiteturas modernas de microsserviços, Kubernetes e observabilidade.", HasAttendance: true, HasSignin: false},
			{Name: "[SEED] Oficina: Git Avançado", InitDate: dt(2025, 10, 9, 14, 0), EndDate: dt(2025, 10, 9, 16, 0), PresenceTypeID: ptypeID(ptypes, "Oficina"), Type: "Oficina", Location: "Laboratório de Sistemas - ICMC", Description: "Dominando rebase, cherry-pick, hooks e workflows colaborativos.", HasAttendance: false, HasSignin: true, MaxParticipants: 25},
			{Name: "[SEED] Concurso de Programação", InitDate: dt(2025, 10, 9, 14, 0), EndDate: dt(2025, 10, 9, 18, 0), PresenceTypeID: ptypeID(ptypes, "Concursos"), Type: "Concursos", Location: "Laboratório de Computação - ICMC", Description: "Maratona de programação com premiação.", HasAttendance: false, HasSignin: true, MaxParticipants: 50},
			{Name: "[SEED] Palestra: Open Source: Como Contribuir", InitDate: dt(2025, 10, 9, 16, 30), EndDate: dt(2025, 10, 9, 18, 0), PresenceTypeID: ptypeID(ptypes, "Palestra"), Type: "Palestra", Location: "Auditório Fernandinho - ICMC", Description: "Como fazer sua primeira contribuição a projetos open source.", HasAttendance: true, HasSignin: false},
			{Name: "[SEED] Luau Semcomp", InitDate: dt(2025, 10, 9, 20, 0), EndDate: dt(2025, 10, 9, 23, 59), PresenceTypeID: ptypeID(ptypes, "Luau"), Type: "Luau", Location: "Área externa do ICMC", Description: "Luau de integração com música ao vivo.", HasAttendance: false, HasSignin: true, MaxParticipants: 200},
			// ── Sexta-feira 10/10 ────────────────────────────────────────
			{Name: "[SEED] Coffee da manhã - Sexta", InitDate: dt(2025, 10, 10, 9, 0), EndDate: dt(2025, 10, 10, 9, 30), PresenceTypeID: ptypeID(ptypes, "Coffee"), Type: "Coffee", Location: "Hall do ICMC", Description: "Coffee break matinal do último dia.", HasAttendance: false, HasSignin: false},
			{Name: "[SEED] Palestra: Empreendedorismo em Tech", InitDate: dt(2025, 10, 10, 10, 0), EndDate: dt(2025, 10, 10, 11, 30), PresenceTypeID: ptypeID(ptypes, "Palestra"), Type: "Palestra", Location: "Auditório Fernandinho - ICMC", Description: "Da ideia ao produto: lições de fundadores de startups.", HasAttendance: true, HasSignin: false},
			{Name: "[SEED] Jogos de Rua", InitDate: dt(2025, 10, 10, 14, 0), EndDate: dt(2025, 10, 10, 17, 0), PresenceTypeID: ptypeID(ptypes, "Jogos de rua"), Type: "Jogos de rua", Location: "Área externa do ICMC", Description: "Gincana e jogos de rua para encerrar a semana.", HasAttendance: false, HasSignin: true, MaxParticipants: 80},
			{Name: "[SEED] Encerramento Semcomp 29", InitDate: dt(2025, 10, 10, 19, 0), EndDate: dt(2025, 10, 10, 21, 0), PresenceTypeID: ptypeID(ptypes, "Encerramento"), Type: "Encerramento", Location: "Auditório Fernandinho - ICMC", Description: "Cerimônia de encerramento com premiações e retrospectiva.", HasAttendance: false, HasSignin: false},
		}
		res := db.Clauses(clause.OnConflict{DoNothing: true}).CreateInBatches(rows, 50)
		if res.Error != nil {
			log.Fatalf("Events: %v", res.Error)
		}
		log.Printf("Events: %d inseridos", res.RowsAffected)
	}

	var out []event.Event
	db.Where("name LIKE ?", "[SEED]%").Find(&out)
	return out
}

// ── products ───────────────────────────────────────────────────────────────

type productCatalog struct {
	kits    []product.Product
	coffees []product.Product
	combos  []product.Product
}

func seedProductCatalog(db *gorm.DB) productCatalog {
	var n int64
	db.Model(&product.Product{}).Where("name LIKE ?", "[SEED]%").Count(&n)
	if skip("Products", n) {
		var kits, coffees, combos []product.Product
		db.Preload("Kit").Where("type = ? AND name LIKE ?", product.ProductTypeKit, "[SEED]%").Find(&kits)
		db.Preload("Coffee").Where("type = ? AND name LIKE ?", product.ProductTypeCoffee, "[SEED]%").Find(&coffees)
		db.Preload("ComboItems").Where("type = ? AND name LIKE ?", product.ProductTypeCombo, "[SEED]%").Find(&combos)
		return productCatalog{kits, coffees, combos}
	}

	kits := insertKits(db)
	coffees := insertCoffees(db)
	combos := insertCombos(db, kits, coffees)
	log.Printf("Products: %d kits, %d coffees, %d combos inseridos", len(kits), len(coffees), len(combos))
	return productCatalog{kits, coffees, combos}
}

func createProduct(db *gorm.DB, p *product.Product) {
	if err := db.Create(p).Error; err != nil {
		log.Fatalf("Product %s: %v", p.Name, err)
	}
}

func insertKits(db *gorm.DB) []product.Product {
	type spec struct {
		name, size, color string
		babylook, selling bool
		price             float64
		desc              string
	}
	rows := []spec{
		{"[SEED] Kit Semcomp 29 - Camiseta P", "P", "Preta", false, true, 59.90, "Camiseta tamanho P (corte masculino)."},
		{"[SEED] Kit Semcomp 29 - Camiseta M", "M", "Preta", false, true, 59.90, "Camiseta tamanho M (corte masculino)."},
		{"[SEED] Kit Semcomp 29 - Camiseta G", "G", "Preta", false, true, 59.90, "Camiseta tamanho G (corte masculino)."},
		{"[SEED] Kit Semcomp 29 - Camiseta GG", "GG", "Preta", false, false, 59.90, "Camiseta tamanho GG (corte masculino)."},
		{"[SEED] Kit Semcomp 29 - Babylook P", "P", "Preta", true, true, 59.90, "Babylook tamanho P."},
		{"[SEED] Kit Semcomp 29 - Babylook M", "M", "Preta", true, true, 59.90, "Babylook tamanho M."},
		{"[SEED] Kit Semcomp 29 - Babylook G", "G", "Preta", true, true, 59.90, "Babylook tamanho G."},
	}
	var out []product.Product
	for _, r := range rows {
		p := product.Product{
			Type: product.ProductTypeKit, Name: r.name, IsSelling: r.selling, Price: r.price, Description: r.desc,
			Kit: &product.Kit{Name: r.name, Size: r.size, Color: r.color, IsBabylook: r.babylook},
		}
		createProduct(db, &p)
		out = append(out, p)
	}
	return out
}

func insertCoffees(db *gorm.DB) []product.Product {
	type spec struct {
		name, detailName, desc string
		dt                     time.Time
		price                  float64
	}
	rows := []spec{
		{"[SEED] Coffee - Dia 07/10 (manhã)", "Coffee Manhã 07/10", "Coffee break da manhã do segundo dia.", dt(2025, 10, 7, 9, 0), 15.00},
		{"[SEED] Coffee - Dia 08/10 (manhã)", "Coffee Manhã 08/10", "Coffee break da manhã do terceiro dia.", dt(2025, 10, 8, 9, 0), 15.00},
		{"[SEED] Coffee - Dia 09/10 (manhã)", "Coffee Manhã 09/10", "Coffee break da manhã do quarto dia.", dt(2025, 10, 9, 9, 0), 15.00},
		{"[SEED] Coffee - Dia 10/10 (manhã)", "Coffee Manhã 10/10", "Coffee break da manhã do último dia.", dt(2025, 10, 10, 9, 0), 15.00},
		{"[SEED] Coffee Noturno - Abertura", "Coffee Noturno 06/10", "Coffee especial após a cerimônia de abertura.", dt(2025, 10, 6, 21, 0), 20.00},
	}
	var out []product.Product
	for _, r := range rows {
		p := product.Product{
			Type: product.ProductTypeCoffee, Name: r.name, IsSelling: true, Price: r.price, Description: r.desc,
			Coffee: &product.Coffee{Name: r.detailName, DateTime: r.dt},
		}
		createProduct(db, &p)
		out = append(out, p)
	}
	return out
}

func insertCombos(db *gorm.DB, kits, coffees []product.Product) []product.Product {
	if len(kits) < 6 || len(coffees) < 5 {
		return nil
	}
	type spec struct {
		name, desc string
		price      float64
		selling    bool
		items      []product.ComboItem
	}
	rows := []spec{
		{
			"[SEED] Combo Clássico (Kit M + Coffee 07/10)", "Kit camiseta M + coffee da manhã do segundo dia.", 69.90, true,
			[]product.ComboItem{{ItemID: kits[1].ID, Quantity: 1}, {ItemID: coffees[0].ID, Quantity: 1}},
		},
		{
			"[SEED] Combo Babylook (Babylook P + Coffee 08/10)", "Kit babylook P + coffee da manhã do terceiro dia.", 69.90, true,
			[]product.ComboItem{{ItemID: kits[4].ID, Quantity: 1}, {ItemID: coffees[1].ID, Quantity: 1}},
		},
		{
			"[SEED] Combo Full Week (Babylook M + 2 Coffees)", "Kit babylook M + coffee de dois dias.", 84.90, true,
			[]product.ComboItem{{ItemID: kits[5].ID, Quantity: 1}, {ItemID: coffees[1].ID, Quantity: 1}, {ItemID: coffees[2].ID, Quantity: 1}},
		},
		{
			"[SEED] Combo Café (Abertura + Manhã 07/10)", "Coffee noturno da abertura + coffee da manhã do segundo dia.", 29.90, false,
			[]product.ComboItem{{ItemID: coffees[4].ID, Quantity: 1}, {ItemID: coffees[0].ID, Quantity: 1}},
		},
	}
	var out []product.Product
	for _, r := range rows {
		p := product.Product{
			Type: product.ProductTypeCombo, Name: r.name, IsSelling: r.selling, Price: r.price, Description: r.desc,
			ComboItems: r.items,
		}
		createProduct(db, &p)
		out = append(out, p)
	}
	return out
}

// ── signin events ──────────────────────────────────────────────────────────

func seedSigninEvents(db *gorm.DB, users []user.User, events []event.Event) {
	var n int64
	db.Model(&signinEvent.SigninEvent{}).Where("event_name LIKE ?", "[SEED]%").Count(&n)
	if skip("SigninEvents", n) {
		return
	}

	var signinEvts []event.Event
	for _, e := range events {
		if e.HasSignin {
			signinEvts = append(signinEvts, e)
		}
	}
	if len(signinEvts) == 0 || len(users) == 0 {
		return
	}

	statuses := []signinEvent.RegistrationStatus{
		signinEvent.StatusRegistered, signinEvent.StatusRegistered, signinEvent.StatusRegistered,
		signinEvent.StatusWaitListed, signinEvent.StatusWaitingDonation, signinEvent.StatusCancelled,
	}

	var rows []signinEvent.SigninEvent
	used := map[string]bool{}
	waitPos := uint(1)

	for i, u := range users {
		ev := signinEvts[i%len(signinEvts)]
		key := fmt.Sprintf("%d|%s", u.UserNumber, ev.Name)
		if used[key] {
			continue
		}
		used[key] = true
		st := statuses[i%len(statuses)]
		pos := uint(0)
		if st == signinEvent.StatusWaitListed {
			pos = waitPos
			waitPos++
		}
		rows = append(rows, signinEvent.SigninEvent{
			UserNumber: u.UserNumber, EventName: ev.Name, EventInitDate: ev.InitDate,
			Status: st, UserWaitListPosition: pos,
		})

		// segundo evento por usuário para cobrir diversidade
		if len(signinEvts) > 1 {
			ev2 := signinEvts[(i+3)%len(signinEvts)]
			key2 := fmt.Sprintf("%d|%s", u.UserNumber, ev2.Name)
			if !used[key2] {
				used[key2] = true
				rows = append(rows, signinEvent.SigninEvent{
					UserNumber: u.UserNumber, EventName: ev2.Name, EventInitDate: ev2.InitDate,
					Status: signinEvent.StatusRegistered,
				})
			}
		}
	}

	res := db.Clauses(clause.OnConflict{DoNothing: true}).CreateInBatches(rows, 100)
	if res.Error != nil {
		log.Fatalf("SigninEvents: %v", res.Error)
	}
	log.Printf("SigninEvents: %d inseridos", res.RowsAffected)
}

// ── presences ──────────────────────────────────────────────────────────────

func seedPresences(db *gorm.DB, users []user.User, events []event.Event, adminEmail string) {
	var n int64
	db.Model(&presence.Presence{}).Where("event_name LIKE ?", "[SEED]%").Count(&n)
	if skip("Presences", n) {
		return
	}

	var attEvts []event.Event
	for _, e := range events {
		if e.HasAttendance {
			attEvts = append(attEvts, e)
		}
	}
	if len(attEvts) == 0 || len(users) == 0 {
		return
	}

	var rows []presence.Presence
	used := map[string]bool{}
	for i, u := range users {
		for _, offset := range []int{0, 2} {
			ev := attEvts[(i+offset)%len(attEvts)]
			key := fmt.Sprintf("%d|%s", u.UserNumber, ev.Name)
			if used[key] {
				continue
			}
			used[key] = true
			rows = append(rows, presence.Presence{
				UserNumber: int64(u.UserNumber), EventName: ev.Name,
				EventInitDate: ev.InitDate, EmailAdmin: adminEmail,
			})
		}
	}

	res := db.Clauses(clause.OnConflict{DoNothing: true}).CreateInBatches(rows, 100)
	if res.Error != nil {
		log.Fatalf("Presences: %v", res.Error)
	}
	log.Printf("Presences: %d inseridos", res.RowsAffected)
}

// ── sales ──────────────────────────────────────────────────────────────────

func seedSales(db *gorm.DB, users []user.User, prods productCatalog) {
	var n int64
	db.Model(&sales.Sale{}).
		Joins("JOIN users ON users.user_number = sales.sale_user_number").
		Where("users.email LIKE ?", "seed.%@teste.semcomp.com").Count(&n)
	if skip("Sales", n) {
		return
	}
	if len(users) == 0 || len(prods.kits) == 0 {
		log.Println("Sales: sem usuários ou produtos, pulando")
		return
	}

	type saleSpec struct {
		userIdx int
		items   []sales.SaleItem
		status  sales.SaleStatus
		dietary string
		total   float64
		mpID    *string
	}

	var specs []saleSpec

	if len(prods.kits) >= 4 {
		specs = append(specs,
			saleSpec{0, []sales.SaleItem{{ProductID: prods.kits[0].ID, Quantity: 1, UnitPrice: prods.kits[0].Price, IsPickedUp: true}}, sales.SaleStatusPaid, "", prods.kits[0].Price, strPtr("SEED-MP-001")},
			saleSpec{1, []sales.SaleItem{{ProductID: prods.kits[1].ID, Quantity: 1, UnitPrice: prods.kits[1].Price}}, sales.SaleStatusPaid, "", prods.kits[1].Price, strPtr("SEED-MP-002")},
			saleSpec{2, []sales.SaleItem{{ProductID: prods.kits[2].ID, Quantity: 1, UnitPrice: prods.kits[2].Price}}, sales.SaleStatusPending, "", prods.kits[2].Price, nil},
			saleSpec{3, []sales.SaleItem{{ProductID: prods.kits[3].ID, Quantity: 1, UnitPrice: prods.kits[3].Price}}, sales.SaleStatusCanceled, "", prods.kits[3].Price, nil},
		)
	}

	if len(prods.coffees) >= 4 {
		total := prods.coffees[0].Price + prods.coffees[1].Price
		specs = append(specs,
			saleSpec{4, []sales.SaleItem{{ProductID: prods.coffees[0].ID, Quantity: 1, UnitPrice: prods.coffees[0].Price}}, sales.SaleStatusPaid, "Sem glúten", prods.coffees[0].Price, strPtr("SEED-MP-003")},
			saleSpec{5, []sales.SaleItem{{ProductID: prods.coffees[1].ID, Quantity: 1, UnitPrice: prods.coffees[1].Price}, {ProductID: prods.coffees[2].ID, Quantity: 1, UnitPrice: prods.coffees[2].Price}}, sales.SaleStatusPaid, "Vegetariano", total, strPtr("SEED-MP-004")},
			saleSpec{6, []sales.SaleItem{{ProductID: prods.coffees[3].ID, Quantity: 1, UnitPrice: prods.coffees[3].Price}}, sales.SaleStatusPending, "Sem lactose", prods.coffees[3].Price, nil},
			saleSpec{7, []sales.SaleItem{{ProductID: prods.coffees[0].ID, Quantity: 1, UnitPrice: prods.coffees[0].Price}}, sales.SaleStatusRejected, "", prods.coffees[0].Price, strPtr("SEED-MP-005")},
			saleSpec{8, []sales.SaleItem{{ProductID: prods.coffees[1].ID, Quantity: 1, UnitPrice: prods.coffees[1].Price}}, sales.SaleStatusExpired, "", prods.coffees[1].Price, nil},
		)
	}

	if len(prods.combos) >= 3 {
		specs = append(specs,
			saleSpec{9, []sales.SaleItem{{ProductID: prods.combos[0].ID, Quantity: 1, UnitPrice: prods.combos[0].Price}}, sales.SaleStatusPaid, "Vegano", prods.combos[0].Price, strPtr("SEED-MP-006")},
			saleSpec{10, []sales.SaleItem{{ProductID: prods.combos[1].ID, Quantity: 1, UnitPrice: prods.combos[1].Price}}, sales.SaleStatusPaid, "Sem restrições", prods.combos[1].Price, strPtr("SEED-MP-007")},
			saleSpec{11, []sales.SaleItem{{ProductID: prods.combos[0].ID, Quantity: 1, UnitPrice: prods.combos[0].Price}}, sales.SaleStatusPending, "Sem glúten", prods.combos[0].Price, nil},
			saleSpec{12, []sales.SaleItem{{ProductID: prods.combos[2].ID, Quantity: 1, UnitPrice: prods.combos[2].Price}}, sales.SaleStatusCanceled, "", prods.combos[2].Price, nil},
			saleSpec{13, []sales.SaleItem{{ProductID: prods.combos[1].ID, Quantity: 1, UnitPrice: prods.combos[1].Price}}, sales.SaleStatusRefunded, "", prods.combos[1].Price, strPtr("SEED-MP-008")},
		)
	}

	for i := 14; i < 22 && i < len(users) && len(prods.kits) > 0; i++ {
		k := prods.kits[i%len(prods.kits)]
		st := sales.SaleStatusPaid
		var mp *string
		if i%3 == 0 {
			st = sales.SaleStatusPending
		} else {
			mp = strPtr(fmt.Sprintf("SEED-MP-%03d", 10+i))
		}
		specs = append(specs, saleSpec{
			i,
			[]sales.SaleItem{{ProductID: k.ID, Quantity: 1, UnitPrice: k.Price, IsPickedUp: st == sales.SaleStatusPaid}},
			st, "", k.Price, mp,
		})
	}

	for _, spec := range specs {
		if spec.userIdx >= len(users) {
			continue
		}
		u := users[spec.userIdx]
		sale := sales.Sale{
			SaleUserNumber: u.UserNumber, Status: spec.status, TotalAmount: spec.total,
			PaymentMethod: "PIX", MercadoPagoID: spec.mpID, DietaryRestrictions: spec.dietary,
			QRCode: fmt.Sprintf("SEED-QR-%d", u.UserNumber),
		}
		if err := db.Create(&sale).Error; err != nil {
			log.Fatalf("Sale user %d: %v", u.UserNumber, err)
		}
		for j := range spec.items {
			spec.items[j].SaleID = sale.ID
		}
		if err := db.Create(&spec.items).Error; err != nil {
			log.Fatalf("SaleItems sale %d: %v", sale.ID, err)
		}
		if spec.status == sales.SaleStatusPending || spec.status == sales.SaleStatusPaid {
			for _, item := range spec.items {
				p := findProduct(prods, item.ProductID)
				if p == nil || (p.Type != product.ProductTypeCoffee && p.Type != product.ProductTypeCombo) {
					continue
				}
				ci := sales.ConsumedItem{UserNumber: u.UserNumber, ProductID: item.ProductID, SourceSaleID: sale.ID}
				if err := db.Clauses(clause.OnConflict{DoNothing: true}).Create(&ci).Error; err != nil {
					log.Fatalf("ConsumedItem sale %d product %d: %v", sale.ID, item.ProductID, err)
				}
			}
		}
	}
	log.Printf("Sales: %d inseridos", len(specs))
}

func findProduct(prods productCatalog, id uint) *product.Product {
	for i := range prods.kits {
		if prods.kits[i].ID == id {
			return &prods.kits[i]
		}
	}
	for i := range prods.coffees {
		if prods.coffees[i].ID == id {
			return &prods.coffees[i]
		}
	}
	for i := range prods.combos {
		if prods.combos[i].ID == id {
			return &prods.combos[i]
		}
	}
	return nil
}

// ── riddles ────────────────────────────────────────────────────────────────

func seedRiddles(db *gorm.DB) {
	var n int64
	db.Model(&riddle.Riddle{}).Where("hint1 LIKE ?", "[SEED]%").Count(&n)
	if skip("Riddles", n) {
		return
	}

	rows := []riddle.Riddle{
		{Hint1: "[SEED] Sou um lugar cheio de livros mas ninguém fala alto.", Hint2: "Você me encontra no campus, entre os estudantes.", Answer: "biblioteca", IsActive: true},
		{Hint1: "[SEED] Processo dados sem descanso, mas não sou humano.", Hint2: "Sem mim, não há software.", Answer: "computador", IsActive: true},
		{Hint1: "[SEED] Sou invisível mas estou em todo lugar onde há conexão.", Hint2: "Sem fio, conecto o mundo.", Answer: "wifi", IsActive: true},
		{Hint1: "[SEED] Resolvo problemas passo a passo.", Hint2: "Sou a alma de qualquer programa.", Answer: "algoritmo", IsActive: true},
		{Hint1: "[SEED] Leio código e o transformo em linguagem que a máquina entende.", Hint2: "Sou o tradutor entre o programador e o processador.", Answer: "compilador", IsActive: true},
		{Hint1: "[SEED] Guardo informações de forma organizada e estruturada.", Hint2: "Tabelas, linhas e colunas são minha morada.", Answer: "banco de dados", IsActive: true},
		{Hint1: "[SEED] Para me entender, você precisa primeiro me entender.", Hint2: "Funções que chamam a si mesmas conhecem meu nome.", Answer: "recursão", IsActive: true},
		{Hint1: "[SEED] Sou um ponto de salvamento na história do seu projeto.", Hint2: "Sem mim, git log não teria nada para mostrar.", Answer: "commit", IsActive: true},
		{Hint1: "[SEED] Alguns me temem, outros não conseguem viver sem mim.", Hint2: "Digitar comandos é a minha especialidade.", Answer: "terminal", IsActive: true},
		{Hint1: "[SEED] Guardo dados temporariamente para te poupar tempo.", Hint2: "Entre o processador e a memória RAM, eu existo.", Answer: "cache", IsActive: true},
		{Hint1: "[SEED] Tenho chaves mas não abro portas.", Hint2: "Estou em todas as mesas dos programadores.", Answer: "teclado", IsActive: true},
		{Hint1: "[SEED] Processo pedidos e devolvo respostas.", Hint2: "REST e GraphQL me usam.", Answer: "api", IsActive: true},
		{Hint1: "[SEED] Escondo complexidade atrás de uma interface simples.", Hint2: "Sou um princípio fundamental da OOP.", Answer: "abstração", IsActive: true},
		{Hint1: "[SEED] Sou pequeno, mas guardo todo o seu trabalho.", Hint2: "Me insira numa porta USB.", Answer: "pendrive", IsActive: false},
		{Hint1: "[SEED] Garanto que apenas uma thread por vez entre no quarto.", Hint2: "Concorrência sem mim vira caos.", Answer: "mutex", IsActive: false},
	}

	if err := db.Create(&rows).Error; err != nil {
		log.Fatalf("Riddles: %v", err)
	}
	log.Printf("Riddles: %d inseridos", len(rows))
}

// ── teams ──────────────────────────────────────────────────────────────────

func seedTeams(db *gorm.DB, users []user.User) {
	var n int64
	db.Table("teams").Where("name LIKE ?", "[SEED]%").Count(&n)
	if skip("Teams", n) {
		return
	}
	if len(users) < 5 {
		return
	}

	now := time.Now()
	finished := now.Add(-2 * time.Hour)
	type teamRow struct {
		Name               string     `gorm:"column:name"`
		Code               string     `gorm:"column:code"`
		CurrentRiddleIndex uint       `gorm:"column:current_riddle_index"`
		FinishedAt         *time.Time `gorm:"column:finished_at"`
	}

	teams := []teamRow{
		{"[SEED] Equipe Alpha", "SEEDALPH", 5, nil},
		{"[SEED] Equipe Beta", "SEEDBETA", 3, nil},
		{"[SEED] Equipe Gamma", "SEEDGAMM", 13, &finished},
		{"[SEED] Equipe Delta", "SEEDDELT", 0, nil},
		{"[SEED] Equipe Epsilon", "SEEDEPSL", 8, nil},
	}

	var teamIDs []int64
	for _, t := range teams {
		if err := db.Table("teams").Create(&t).Error; err != nil {
			log.Fatalf("Team %s: %v", t.Name, err)
		}
		var id int64
		db.Table("teams").Where("code = ?", t.Code).Select("id").Scan(&id)
		teamIDs = append(teamIDs, id)
	}

	memberGroups := [][]int{{0, 1, 2, 3, 4}, {5, 6, 7}, {8, 9, 10, 11}, {12}, {13, 14}}
	type memberRow struct {
		TeamID     int64     `gorm:"column:team_id"`
		UserNumber uint      `gorm:"column:user_number"`
		JoinedAt   time.Time `gorm:"column:joined_at"`
	}
	for i, group := range memberGroups {
		if i >= len(teamIDs) {
			break
		}
		for _, uIdx := range group {
			if uIdx >= len(users) {
				continue
			}
			m := memberRow{TeamID: teamIDs[i], UserNumber: users[uIdx].UserNumber, JoinedAt: now}
			if err := db.Table("team_members").Clauses(clause.OnConflict{DoNothing: true}).Create(&m).Error; err != nil {
				log.Printf("TeamMember team=%d user=%d: %v", teamIDs[i], users[uIdx].UserNumber, err)
			}
		}
	}
	log.Printf("Teams: %d inseridos com membros", len(teams))
}

// ── sponsors ───────────────────────────────────────────────────────────────

func seedSponsors(db *gorm.DB) {
	var n int64
	db.Model(&sponsor.Sponsor{}).Where("name LIKE ?", "[SEED]%").Count(&n)
	if skip("Sponsors", n) {
		return
	}

	type entry struct {
		s    sponsor.Sponsor
		pkgs []sponsor.SponsorPackage
	}
	data := []entry{
		{
			sponsor.Sponsor{CNPJ: "00000000000191", Name: "[SEED] TechCorp Brasil", Website: "https://techcorp.example.com", Clicks: 142},
			[]sponsor.SponsorPackage{{SponsorCNPJ: "00000000000191", Year: 2024, Package: "Prata"}, {SponsorCNPJ: "00000000000191", Year: 2025, Package: "Ouro"}},
		},
		{
			sponsor.Sponsor{CNPJ: "33333333000191", Name: "[SEED] MegaByte Corp", Website: "https://megabyte.example.com", Clicks: 0},
			[]sponsor.SponsorPackage{{SponsorCNPJ: "33333333000191", Year: 2025, Package: "Ouro"}},
		},
		{
			sponsor.Sponsor{CNPJ: "11111111000191", Name: "[SEED] DataSoft Solutions", Website: "https://datasoft.example.com", Clicks: 87},
			[]sponsor.SponsorPackage{{SponsorCNPJ: "11111111000191", Year: 2025, Package: "Prata"}},
		},
		{
			sponsor.Sponsor{CNPJ: "44444444000191", Name: "[SEED] InfraCloud Ltda", Website: "https://infracloud.example.com", Clicks: 0},
			[]sponsor.SponsorPackage{{SponsorCNPJ: "44444444000191", Year: 2024, Package: "Bronze"}, {SponsorCNPJ: "44444444000191", Year: 2025, Package: "Prata"}},
		},
		{
			sponsor.Sponsor{CNPJ: "22222222000191", Name: "[SEED] CloudNet Startup", Website: "https://cloudnet.example.com", Clicks: 55},
			[]sponsor.SponsorPackage{{SponsorCNPJ: "22222222000191", Year: 2025, Package: "Bronze"}},
		},
		{
			sponsor.Sponsor{CNPJ: "55555555000191", Name: "[SEED] ByteForce Consultoria", Website: "https://byteforce.example.com", Clicks: 310},
			[]sponsor.SponsorPackage{{SponsorCNPJ: "55555555000191", Year: 2025, Package: "Bronze"}},
		},
		{
			sponsor.Sponsor{CNPJ: "66666666000191", Name: "[SEED] PixelDev Agency", Website: "https://pixeldev.example.com", Clicks: 203},
			[]sponsor.SponsorPackage{{SponsorCNPJ: "66666666000191", Year: 2025, Package: "Bronze"}},
		},
	}

	sponsorsInserted := int64(0)
	pkgsInserted := int64(0)
	for _, d := range data {
		sp := d.s
		res := db.Clauses(clause.OnConflict{DoNothing: true}).Create(&sp)
		if res.Error != nil {
			log.Fatalf("Sponsor %s: %v", sp.Name, res.Error)
		}
		sponsorsInserted += res.RowsAffected
		for _, pkg := range d.pkgs {
			p := pkg
			res := db.Clauses(clause.OnConflict{DoNothing: true}).Create(&p)
			pkgsInserted += res.RowsAffected
		}
	}
	log.Printf("Sponsors: %d sponsors + %d pacotes inseridos", sponsorsInserted, pkgsInserted)
}

// ── notices ────────────────────────────────────────────────────────────────

func seedNotices(db *gorm.DB) {
	var n int64
	db.Model(&notice.Notice{}).Where("title LIKE ?", "[SEED]%").Count(&n)
	if skip("Notices", n) {
		return
	}

	rows := []notice.Notice{
		{Title: "[SEED] Bem-vindos à Semcomp 29!", Content: "Este é o portal oficial da 29ª edição da Semana da Computação do ICMC-USP. Fique atento ao cronograma!", DateTime: dt(2025, 10, 1, 9, 0)},
		{Title: "[SEED] Credenciamento aberto", Content: "O credenciamento está aberto no Hall do ICMC das 08h às 18h durante a semana do evento.", DateTime: dt(2025, 10, 6, 8, 0)},
		{Title: "[SEED] Loja online disponível", Content: "A loja online está aberta! Adquira seu kit, babylook e coffee antes que esgotem.", DateTime: dt(2025, 10, 5, 12, 0)},
		{Title: "[SEED] Vagas limitadas - Minicursos", Content: "Os minicursos de Go e Machine Learning têm vagas limitadas. Garanta a sua inscrição!", DateTime: dt(2025, 10, 4, 10, 0)},
		{Title: "[SEED] Regras do Jogo de Riddles", Content: "O jogo de riddles começa na abertura. Forme sua equipe de até 5 pessoas e resolva os riddles em ordem.", DateTime: dt(2025, 10, 3, 15, 0)},
		{Title: "[SEED] Certificados de participação", Content: "Certificados serão emitidos para participantes com taxa de presença ≥ 75%.", DateTime: dt(2025, 10, 2, 11, 0)},
		{Title: "[SEED] Resultado do Concurso de Programação", Content: "Os resultados serão anunciados na cerimônia de encerramento na sexta-feira às 19h.", DateTime: dt(2025, 10, 9, 19, 0)},
		{Title: "[SEED] Prazo para envio de PAPFE", Content: "Lembrete: o prazo para envio do comprovante PAPFE encerra em 48 horas.", DateTime: dt(2025, 10, 7, 12, 0)},
		{Title: "[SEED] Atualização: formulário de presença", Content: "O formulário de presença foi atualizado. Verifique sua taxa de presença no portal.", DateTime: dt(2025, 10, 8, 14, 0)},
		{Title: "[SEED] Luau confirmado!", Content: "O luau de quinta-feira à noite está confirmado. Local: área externa do ICMC.", DateTime: dt(2025, 10, 8, 18, 0)},
	}

	for i := range rows {
		if err := db.Create(&rows[i]).Error; err != nil {
			log.Fatalf("Notice %s: %v", rows[i].Title, err)
		}
	}
	log.Printf("Notices: %d inseridos", len(rows))
}

// ── papfe documents ────────────────────────────────────────────────────────

func seedPapfeDocs(db *gorm.DB, users []user.User) {
	var n int64
	db.Model(&user.PapfeDocument{}).Where("file_path LIKE ?", "uploads/papfe/seed_%").Count(&n)
	if skip("PapfeDocs", n) {
		return
	}

	var papfeUsers []user.User
	for _, u := range users {
		if u.HasPapfe {
			papfeUsers = append(papfeUsers, u)
		}
	}
	if len(papfeUsers) == 0 {
		return
	}

	approved := true
	rejected := false
	statuses := []*bool{nil, &approved, &rejected, nil, &approved, &approved, &rejected, nil, &approved, nil}
	reasons := []string{"", "", "Documento ilegível. Envie uma foto mais nítida.", "", "", "", "Comprovante fora do prazo de validade.", "", "", ""}

	now := time.Now()
	var rows []user.PapfeDocument
	for i, u := range papfeUsers {
		idx := i % len(statuses)
		var rejReason *string
		if statuses[idx] != nil && !*statuses[idx] && reasons[idx] != "" {
			rejReason = strPtr(reasons[idx])
		}
		rows = append(rows, user.PapfeDocument{
			UserEmail:   u.Email,
			Filename:    fmt.Sprintf("seed_%s_papfe.pdf", sanitizeEmail(u.Email)),
			ContentType: "application/pdf",
			FilePath:    fmt.Sprintf("uploads/papfe/seed_%s_papfe.pdf", sanitizeEmail(u.Email)),
			UploadedAt:  now.AddDate(0, 0, -(i + 1)),
			IsApproved:  statuses[idx],
			RejectionReason: rejReason,
		})
	}

	res := db.Clauses(clause.OnConflict{DoNothing: true}).Create(&rows)
	if res.Error != nil {
		log.Fatalf("PapfeDocs: %v", res.Error)
	}
	log.Printf("PapfeDocs: %d inseridos", res.RowsAffected)
}

// ── absence justifications ─────────────────────────────────────────────────

func seedAbsenceJustifications(db *gorm.DB, users []user.User, events []event.Event) {
	var n int64
	db.Model(&absenceJustification.AbsenceJustification{}).Where("attachment_file_path LIKE ?", "uploads/absence-justifications/seed_%").Count(&n)
	if skip("AbsenceJustifications", n) {
		return
	}
	if len(users) == 0 || len(events) == 0 {
		return
	}

	statuses := []string{
		absenceJustification.StatusEmAnalise, absenceJustification.StatusAprovado,
		absenceJustification.StatusNegado, absenceJustification.StatusDocumentoInvalido,
		absenceJustification.StatusEmAnalise, absenceJustification.StatusAprovado,
		absenceJustification.StatusNegado, absenceJustification.StatusEmAnalise,
		absenceJustification.StatusAprovado, absenceJustification.StatusDocumentoInvalido,
	}
	rejReasons := []string{"", "", "Justificativa não aceita.", "", "", "", "Documento não corresponde à data do evento.", "", "", ""}

	now := time.Now()
	var rows []absenceJustification.AbsenceJustification
	for i, u := range users {
		if i >= len(statuses) {
			break
		}
		ev := events[i%len(events)]
		st := statuses[i]
		var rejReason *string
		if st == absenceJustification.StatusNegado && rejReasons[i] != "" {
			rejReason = strPtr(rejReasons[i])
		}
		rows = append(rows, absenceJustification.AbsenceJustification{
			UserEmail:             u.Email,
			EventName:             ev.Name,
			EventInitDate:         ev.InitDate,
			Reason:                fmt.Sprintf("Motivo de ausência: compromisso inadiável de %s.", u.Name),
			AttachmentFilename:    fmt.Sprintf("seed_%s_justificativa.pdf", sanitizeEmail(u.Email)),
			AttachmentContentType: "application/pdf",
			AttachmentFilePath:    fmt.Sprintf("uploads/absence-justifications/seed_%s_justificativa.pdf", sanitizeEmail(u.Email)),
			SubmittedAt:           now.AddDate(0, 0, -(i + 1)),
			Status:                st,
			RejectionReason:       rejReason,
		})
	}

	res := db.Clauses(clause.OnConflict{DoNothing: true}).Create(&rows)
	if res.Error != nil {
		log.Fatalf("AbsenceJustifications: %v", res.Error)
	}
	log.Printf("AbsenceJustifications: %d inseridos", res.RowsAffected)
}

// ── util ───────────────────────────────────────────────────────────────────

func sanitizeEmail(email string) string {
	out := make([]byte, 0, len(email))
	for i := 0; i < len(email); i++ {
		c := email[i]
		if (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') {
			out = append(out, c)
		} else {
			out = append(out, '_')
		}
	}
	return string(out)
}
