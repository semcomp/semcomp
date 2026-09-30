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
		log.Fatalf("failed to connect: %v", err)
	}

	log.Println("=== seed start ===")

	pwHash := mustHash("senha123")
	adminEmail := getenv("ADMIN_EMAIL", "adm@semcomp.com")

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

func skip(label string, n int64) bool {
	if n > 0 {
		log.Printf("%s: já seedado (%d registros), pulando", label, n)
		return true
	}
	return false
}

// ── presence types (criados pelo InitializeDefaults na startup) ────────────

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

	rows := buildUsers(pwHash)

	if !skip("Users", n) {
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

func buildUsers(pwHash string) []user.User {
	type row struct {
		name         string
		email        string
		age          int
		gender       string
		city         string
		education    string
		hasPapfe     bool
		disabilities string
		profession   *string
		linkedin     *string
		telegram     *string
		cracha       bool
		compartilha  bool
		verified     bool
	}

	data := []row{
		{"Ana Oliveira", "seed.user01@teste.semcomp.com", 20, "Feminino", "São Carlos", "Graduação", false, "", strPtr("Estudante"), strPtr("linkedin.com/in/ana"), strPtr("@ana_sc"), true, true, true},
		{"Bruno Souza", "seed.user02@teste.semcomp.com", 22, "Masculino", "São Paulo", "Graduação", true, "", strPtr("Desenvolvedor"), nil, nil, false, false, true},
		{"Carla Matos", "seed.user03@teste.semcomp.com", 19, "Feminino", "Campinas", "Graduação", false, "Deficiência auditiva leve", nil, nil, strPtr("@carla_matos"), true, false, true},
		{"Diego Lima", "seed.user04@teste.semcomp.com", 25, "Masculino", "Ribeirão Preto", "Pós-graduação", true, "", strPtr("Engenheiro de Software"), strPtr("linkedin.com/in/diego"), nil, false, true, true},
		{"Eva Santos", "seed.user05@teste.semcomp.com", 21, "Feminino", "Bauru", "Graduação", false, "", nil, nil, nil, true, true, false},
		{"Felipe Costa", "seed.user06@teste.semcomp.com", 23, "Masculino", "São José do Rio Preto", "Graduação", false, "Deficiência visual parcial", strPtr("Designer"), strPtr("linkedin.com/in/felipe"), strPtr("@felipe_dev"), false, false, true},
		{"Gabriela Ramos", "seed.user07@teste.semcomp.com", 20, "Feminino", "São Carlos", "Graduação", true, "", strPtr("Pesquisadora"), strPtr("linkedin.com/in/gabi"), nil, true, true, true},
		{"Henrique Alves", "seed.user08@teste.semcomp.com", 28, "Masculino", "Brasília", "Pós-graduação", false, "", strPtr("Cientista de Dados"), nil, strPtr("@henrique_ds"), false, true, true},
		{"Isabela Nunes", "seed.user09@teste.semcomp.com", 22, "Feminino", "Florianópolis", "Graduação", false, "Ansiedade (laudo)", nil, nil, nil, true, false, false},
		{"João Pedro", "seed.user10@teste.semcomp.com", 18, "Masculino", "Londrina", "Ensino Médio", false, "", nil, nil, strPtr("@jp_londrina"), false, false, true},
		{"Kamila Ferreira", "seed.user11@teste.semcomp.com", 24, "Feminino", "São Carlos", "Pós-graduação", true, "", strPtr("Professora"), strPtr("linkedin.com/in/kamila"), nil, true, true, true},
		{"Lucas Pereira", "seed.user12@teste.semcomp.com", 21, "Masculino", "Piracicaba", "Graduação", false, "", strPtr("Estagiário"), nil, nil, false, true, true},
		{"Marina Teixeira", "seed.user13@teste.semcomp.com", 26, "Feminino", "Porto Alegre", "Pós-graduação", true, "Mobilidade reduzida", strPtr("Analista"), strPtr("linkedin.com/in/marina"), strPtr("@marina_poa"), true, false, true},
		{"Nicolas Barbosa", "seed.user14@teste.semcomp.com", 20, "Outro", "São Paulo", "Graduação", false, "", nil, nil, nil, false, true, true},
		{"Olivia Gomes", "seed.user15@teste.semcomp.com", 23, "Feminino", "Curitiba", "Graduação", false, "", strPtr("Desenvolvedora Frontend"), strPtr("linkedin.com/in/olivia"), strPtr("@olivia_dev"), true, true, false},
		{"Paulo Martins", "seed.user16@teste.semcomp.com", 30, "Masculino", "Recife", "Pós-graduação", true, "Dislexia", strPtr("Arquiteto de Software"), strPtr("linkedin.com/in/paulo"), nil, false, false, true},
		{"Rafaela Carvalho", "seed.user17@teste.semcomp.com", 19, "Feminino", "São Carlos", "Graduação", false, "", nil, nil, strPtr("@rafa_sc"), true, true, true},
		{"Samuel Rocha", "seed.user18@teste.semcomp.com", 22, "Masculino", "Fortaleza", "Graduação", false, "", strPtr("Backend Dev"), strPtr("linkedin.com/in/samuel"), strPtr("@samuel_for"), false, false, true},
		{"Tatiane Vieira", "seed.user19@teste.semcomp.com", 27, "Feminino", "Belo Horizonte", "Pós-graduação", true, "", strPtr("DevOps"), nil, nil, true, true, true},
		{"Victor Nascimento", "seed.user20@teste.semcomp.com", 21, "Masculino", "São Carlos", "Graduação", false, "TDAH (laudo)", nil, nil, strPtr("@victor_sc"), false, true, true},
		{"Wendy Azevedo", "seed.user21@teste.semcomp.com", 24, "Feminino", "Manaus", "Graduação", false, "", strPtr("Pesquisadora UX"), strPtr("linkedin.com/in/wendy"), nil, true, false, true},
		{"Xavier Moreira", "seed.user22@teste.semcomp.com", 29, "Masculino", "Salvador", "Pós-graduação", true, "", strPtr("Engenheiro de ML"), strPtr("linkedin.com/in/xavier"), strPtr("@xavier_ml"), false, true, true},
	}

	out := make([]user.User, len(data))
	for i, d := range data {
		out[i] = user.User{
			Name:                     d.name,
			Email:                    d.email,
			PasswordHash:             pwHash,
			Age:                      d.age,
			Gender:                   d.gender,
			City:                     d.city,
			Education:                d.education,
			HasPapfe:                 d.hasPapfe,
			Disabilities:             d.disabilities,
			Profession:               d.profession,
			Linkedin:                 d.linkedin,
			Telegram:                 d.telegram,
			QuerCracha:               d.cracha,
			AutorizaCompartilhamento: d.compartilha,
			EmailVerified:            d.verified,
		}
	}
	return out
}

// ── events ─────────────────────────────────────────────────────────────────

func seedEvents(db *gorm.DB, ptypes []presencesettings.PresenceTypeWeight) []event.Event {
	var n int64
	db.Model(&event.Event{}).Where("name LIKE ?", "[SEED]%").Count(&n)

	rows := buildEvents(ptypes)

	if !skip("Events", n) {
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

func buildEvents(ptypes []presencesettings.PresenceTypeWeight) []event.Event {
	now := time.Now()
	past := func(daysAgo int, h int) time.Time {
		return now.AddDate(0, 0, -daysAgo).Truncate(24 * time.Hour).Add(time.Duration(h) * time.Hour)
	}
	future := func(daysAhead int, h int) time.Time {
		return now.AddDate(0, 0, daysAhead).Truncate(24 * time.Hour).Add(time.Duration(h) * time.Hour)
	}

	palestraID := ptypeID(ptypes, "Palestra")
	vitrineID := ptypeID(ptypes, "Vitrine")
	minicursoID := ptypeID(ptypes, "Minicurso")
	luauID := ptypeID(ptypes, "Luau")
	concursosID := ptypeID(ptypes, "Concursos")

	return []event.Event{
		{Name: "[SEED] Palestra: Inteligência Artificial", InitDate: past(10, 14), EndDate: past(10, 16), Type: "Palestra", PresenceTypeID: palestraID, Location: "Auditório Fernão Stella", Description: "Introdução a IA e LLMs.", HasAttendance: true, HasSignin: false},
		{Name: "[SEED] Palestra: Computação Quântica", InitDate: past(9, 9), EndDate: past(9, 11), Type: "Palestra", PresenceTypeID: palestraID, Location: "Auditório A", Description: "Fundamentos de computação quântica.", HasAttendance: true, HasSignin: true, MaxParticipants: 80},
		{Name: "[SEED] Palestra: Segurança da Informação", InitDate: past(8, 14), EndDate: past(8, 16), Type: "Palestra", PresenceTypeID: palestraID, Location: "Sala 5-001", Description: "CTFs e hacking ético.", HasAttendance: true, HasSignin: false},
		{Name: "[SEED] Vitrine: Startups de Tecnologia", InitDate: past(7, 10), EndDate: past(7, 12), Type: "Vitrine", PresenceTypeID: vitrineID, Location: "Hall Principal", Description: "Apresentação de startups locais.", HasAttendance: true, HasSignin: true, MaxParticipants: 50},
		{Name: "[SEED] Minicurso: Docker e Kubernetes", InitDate: past(6, 13), EndDate: past(6, 17), Type: "Minicurso", PresenceTypeID: minicursoID, Location: "Laboratório 4", Description: "Hands-on com containers.", HasAttendance: false, HasSignin: true, MaxParticipants: 30},
		{Name: "[SEED] Minicurso: Machine Learning com Python", InitDate: past(5, 9), EndDate: past(5, 13), Type: "Minicurso", PresenceTypeID: minicursoID, Location: "Laboratório 2", Description: "Sklearn e pandas na prática.", HasAttendance: false, HasSignin: true, MaxParticipants: 25},
		{Name: "[SEED] Rodas de Conversa: Mercado de Trabalho", InitDate: past(4, 16), EndDate: past(4, 18), Type: "Rodas de conversa", PresenceTypeID: nil, Location: "Sala de Reuniões", Description: "Carreira em tecnologia.", HasAttendance: false, HasSignin: false},
		{Name: "[SEED] Concurso: Hackathon 24h", InitDate: past(3, 9), EndDate: past(2, 9), Type: "Concursos", PresenceTypeID: concursosID, Location: "Bloco Didático", Description: "24 horas de desenvolvimento.", HasAttendance: false, HasSignin: true, MaxParticipants: 100},
		{Name: "[SEED] Palestra: Sistemas Distribuídos", InitDate: past(2, 14), EndDate: past(2, 16), Type: "Palestra", PresenceTypeID: palestraID, Location: "Auditório B", Description: "CAP theorem e consistência eventual.", HasAttendance: true, HasSignin: false},
		{Name: "[SEED] Palestra: Open Source e Comunidade", InitDate: past(1, 10), EndDate: past(1, 12), Type: "Palestra", PresenceTypeID: palestraID, Location: "Auditório Fernão Stella", Description: "Contribuindo com projetos open source.", HasAttendance: true, HasSignin: true, MaxParticipants: 120},
		{Name: "[SEED] Vitrine: Empresas Parceiras", InitDate: past(1, 14), EndDate: past(1, 17), Type: "Vitrine", PresenceTypeID: vitrineID, Location: "Hall Principal", Description: "Oportunidades de estágio e emprego.", HasAttendance: true, HasSignin: false},
		{Name: "[SEED] Luau de Encerramento", InitDate: past(0, 20), EndDate: past(0, 23), Type: "Luau", PresenceTypeID: luauID, Location: "Área Externa ICMC", Description: "Encerramento da Semcomp com música ao vivo.", HasAttendance: false, HasSignin: true, MaxParticipants: 200},
		{Name: "[SEED] Palestra: Arquitetura de Microsserviços", InitDate: future(1, 14), EndDate: future(1, 16), Type: "Palestra", PresenceTypeID: palestraID, Location: "Auditório A", Description: "Design patterns para microsserviços.", HasAttendance: true, HasSignin: true, MaxParticipants: 80},
		{Name: "[SEED] Minicurso: React e TypeScript", InitDate: future(2, 9), EndDate: future(2, 13), Type: "Minicurso", PresenceTypeID: minicursoID, Location: "Laboratório 3", Description: "Construindo interfaces modernas.", HasAttendance: false, HasSignin: true, MaxParticipants: 20},
		{Name: "[SEED] Palestra: Web3 e Blockchain", InitDate: future(3, 14), EndDate: future(3, 16), Type: "Palestra", PresenceTypeID: palestraID, Location: "Auditório B", Description: "Fundamentos de blockchain.", HasAttendance: true, HasSignin: false},
		{Name: "[SEED] Vitrine: Pesquisa Acadêmica", InitDate: future(4, 10), EndDate: future(4, 12), Type: "Vitrine", PresenceTypeID: vitrineID, Location: "Hall Principal", Description: "Projetos de pesquisa do ICMC.", HasAttendance: true, HasSignin: true, MaxParticipants: 60},
		{Name: "[SEED] Concurso: Maratona de Programação", InitDate: future(5, 8), EndDate: future(5, 18), Type: "Concursos", PresenceTypeID: concursosID, Location: "Bloco A", Description: "Maratona ICMC de programação competitiva.", HasAttendance: false, HasSignin: true, MaxParticipants: 150},
		{Name: "[SEED] Rodas de Conversa: Diversidade em Tech", InitDate: future(6, 16), EndDate: future(6, 18), Type: "Rodas de conversa", PresenceTypeID: nil, Location: "Sala 4-001", Description: "Inclusão e diversidade na área de TI.", HasAttendance: false, HasSignin: false},
		{Name: "[SEED] Palestra: Computação em Nuvem", InitDate: future(7, 14), EndDate: future(7, 16), Type: "Palestra", PresenceTypeID: palestraID, Location: "Auditório Fernão Stella", Description: "AWS, GCP e Azure na prática.", HasAttendance: true, HasSignin: true, MaxParticipants: 100},
		{Name: "[SEED] Palestra: DevOps e CI/CD", InitDate: future(8, 14), EndDate: future(8, 16), Type: "Palestra", PresenceTypeID: palestraID, Location: "Auditório A", Description: "Pipelines modernos de deploy.", HasAttendance: true, HasSignin: false},
	}
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

func insertKits(db *gorm.DB) []product.Product {
	type kitRow struct{ name, size, color string; babylook, selling bool; price float64; pic, desc string }
	rows := []kitRow{
		{"[SEED] Kit Semcomp 2025 - P", "P", "Preto", false, true, 79.90, "", "Kit oficial da Semcomp 2025 tamanho P."},
		{"[SEED] Kit Semcomp 2025 - M", "M", "Preto", false, true, 79.90, "", "Kit oficial da Semcomp 2025 tamanho M."},
		{"[SEED] Kit Semcomp 2025 - G", "G", "Preto", false, true, 79.90, "", "Kit oficial da Semcomp 2025 tamanho G."},
		{"[SEED] Kit Semcomp 2025 - GG", "GG", "Preto", false, false, 79.90, "", "Kit oficial da Semcomp 2025 tamanho GG."},
		{"[SEED] Kit Semcomp Baby - P", "P", "Branco", true, true, 79.90, "", "Kit babylook da Semcomp tamanho P."},
		{"[SEED] Kit Semcomp Baby - M", "M", "Branco", true, true, 79.90, "", "Kit babylook da Semcomp tamanho M."},
		{"[SEED] Kit Semcomp Baby - G", "G", "Branco", true, false, 79.90, "", "Kit babylook da Semcomp tamanho G."},
		{"[SEED] Kit Semcomp Azul - M", "M", "Azul", false, true, 84.90, "", "Edição especial azul tamanho M."},
	}

	var out []product.Product
	for _, r := range rows {
		p := product.Product{
			Type: product.ProductTypeKit, Name: r.name,
			IsSelling: r.selling, Price: r.price,
			PictureURL: r.pic, Description: r.desc,
			Kit: &product.Kit{Name: r.name, Size: r.size, Color: r.color, IsBabylook: r.babylook},
		}
		if err := db.Create(&p).Error; err != nil {
			log.Fatalf("Kit %s: %v", r.name, err)
		}
		out = append(out, p)
	}
	return out
}

func insertCoffees(db *gorm.DB) []product.Product {
	now := time.Now()
	type coffeeRow struct{ name string; dt time.Time; selling bool; price float64; desc string }
	rows := []coffeeRow{
		{"[SEED] Coffee Break Manhã - Dia 1", now.AddDate(0, 0, 1).Truncate(24*time.Hour).Add(9 * time.Hour), true, 25.00, "Coffee break da manhã do primeiro dia."},
		{"[SEED] Coffee Break Tarde - Dia 1", now.AddDate(0, 0, 1).Truncate(24*time.Hour).Add(15 * time.Hour), true, 25.00, "Coffee break da tarde do primeiro dia."},
		{"[SEED] Coffee Break Manhã - Dia 2", now.AddDate(0, 0, 2).Truncate(24*time.Hour).Add(9 * time.Hour), true, 25.00, "Coffee break da manhã do segundo dia."},
		{"[SEED] Coffee Break Tarde - Dia 2", now.AddDate(0, 0, 2).Truncate(24*time.Hour).Add(15 * time.Hour), true, 25.00, "Coffee break da tarde do segundo dia."},
		{"[SEED] Coffee Break Manhã - Dia 3", now.AddDate(0, 0, 3).Truncate(24*time.Hour).Add(9 * time.Hour), false, 25.00, "Coffee break da manhã do terceiro dia."},
		{"[SEED] Coffee Break Especial", now.AddDate(0, 0, 4).Truncate(24*time.Hour).Add(12 * time.Hour), true, 35.00, "Coffee break especial com mesa farta."},
	}

	var out []product.Product
	for _, r := range rows {
		p := product.Product{
			Type: product.ProductTypeCoffee, Name: r.name,
			IsSelling: r.selling, Price: r.price, Description: r.desc,
			Coffee: &product.Coffee{Name: r.name, DateTime: r.dt},
		}
		if err := db.Create(&p).Error; err != nil {
			log.Fatalf("Coffee %s: %v", r.name, err)
		}
		out = append(out, p)
	}
	return out
}

func insertCombos(db *gorm.DB, kits, coffees []product.Product) []product.Product {
	type comboRow struct {
		name    string
		price   float64
		desc    string
		selling bool
		items   []product.ComboItem
	}

	rows := []comboRow{
		{
			"[SEED] Combo Kit + Coffee Manhã", 99.90, "Kit tamanho M + coffee da manhã do dia 1.", true,
			[]product.ComboItem{{ItemID: kits[1].ID, Quantity: 1}, {ItemID: coffees[0].ID, Quantity: 1}},
		},
		{
			"[SEED] Combo Kit + 2 Coffees", 119.90, "Kit tamanho M + coffees dos dois primeiros dias.", true,
			[]product.ComboItem{{ItemID: kits[1].ID, Quantity: 1}, {ItemID: coffees[0].ID, Quantity: 1}, {ItemID: coffees[2].ID, Quantity: 1}},
		},
		{
			"[SEED] Combo Baby + Coffee Especial", 109.90, "Kit babylook P + coffee especial.", false,
			[]product.ComboItem{{ItemID: kits[4].ID, Quantity: 1}, {ItemID: coffees[5].ID, Quantity: 1}},
		},
		{
			"[SEED] Combo Completo", 149.90, "Kit G + todos os 4 coffees dos dias 1 e 2.", true,
			[]product.ComboItem{
				{ItemID: kits[2].ID, Quantity: 1},
				{ItemID: coffees[0].ID, Quantity: 1},
				{ItemID: coffees[1].ID, Quantity: 1},
				{ItemID: coffees[2].ID, Quantity: 1},
				{ItemID: coffees[3].ID, Quantity: 1},
			},
		},
	}

	var out []product.Product
	for _, r := range rows {
		p := product.Product{
			Type: product.ProductTypeCombo, Name: r.name,
			IsSelling: r.selling, Price: r.price, Description: r.desc,
			ComboItems: r.items,
		}
		if err := db.Create(&p).Error; err != nil {
			log.Fatalf("Combo %s: %v", r.name, err)
		}
		out = append(out, p)
	}
	return out
}

// ── signin events ──────────────────────────────────────────────────────────

func seedSigninEvents(db *gorm.DB, users []user.User, events []event.Event) {
	var n int64
	db.Model(&signinEvent.SigninEvent{}).
		Joins("JOIN events ON events.name = signin_events.event_name AND events.init_date = signin_events.event_init_date").
		Where("signin_events.event_name LIKE ?", "[SEED]%").Count(&n)
	if skip("SigninEvents", n) {
		return
	}

	var signinEvents []event.Event
	for _, e := range events {
		if e.HasSignin {
			signinEvents = append(signinEvents, e)
		}
	}
	if len(signinEvents) == 0 || len(users) == 0 {
		log.Println("SigninEvents: sem eventos com has_signin ou sem usuários, pulando")
		return
	}

	statuses := []signinEvent.RegistrationStatus{
		signinEvent.StatusRegistered,
		signinEvent.StatusRegistered,
		signinEvent.StatusRegistered,
		signinEvent.StatusWaitListed,
		signinEvent.StatusWaitingDonation,
		signinEvent.StatusCancelled,
	}

	var rows []signinEvent.SigninEvent
	used := map[string]bool{}
	pos := uint(1)

	for i, u := range users {
		ev := signinEvents[i%len(signinEvents)]
		key := fmt.Sprintf("%d|%s|%v", u.UserNumber, ev.Name, ev.InitDate)
		if used[key] {
			continue
		}
		used[key] = true

		st := statuses[i%len(statuses)]
		waitPos := uint(0)
		if st == signinEvent.StatusWaitListed {
			waitPos = pos
			pos++
		}
		rows = append(rows, signinEvent.SigninEvent{
			UserNumber:           u.UserNumber,
			EventName:            ev.Name,
			EventInitDate:        ev.InitDate,
			Status:               st,
			UserWaitListPosition: waitPos,
		})
	}

	// distribui usuários em diferentes eventos para ter diversidade
	for i, u := range users {
		if i >= len(signinEvents) {
			break
		}
		ev := signinEvents[(i+3)%len(signinEvents)]
		key := fmt.Sprintf("%d|%s|%v", u.UserNumber, ev.Name, ev.InitDate)
		if used[key] {
			continue
		}
		used[key] = true
		rows = append(rows, signinEvent.SigninEvent{
			UserNumber: u.UserNumber, EventName: ev.Name,
			EventInitDate: ev.InitDate, Status: signinEvent.StatusRegistered,
		})
	}

	res := db.Clauses(clause.OnConflict{DoNothing: true}).CreateInBatches(rows, 50)
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

	var attendanceEvents []event.Event
	for _, e := range events {
		if e.HasAttendance {
			attendanceEvents = append(attendanceEvents, e)
		}
	}
	if len(attendanceEvents) == 0 || len(users) == 0 {
		return
	}

	var rows []presence.Presence
	used := map[string]bool{}
	for i, u := range users {
		ev := attendanceEvents[i%len(attendanceEvents)]
		key := fmt.Sprintf("%d|%s|%v", u.UserNumber, ev.Name, ev.InitDate)
		if used[key] {
			continue
		}
		used[key] = true
		rows = append(rows, presence.Presence{
			UserNumber:    int64(u.UserNumber),
			EventName:     ev.Name,
			EventInitDate: ev.InitDate,
			EmailAdmin:    adminEmail,
		})

		// segundo evento por usuário para cobrir mais casos
		if len(attendanceEvents) > 1 {
			ev2 := attendanceEvents[(i+2)%len(attendanceEvents)]
			key2 := fmt.Sprintf("%d|%s|%v", u.UserNumber, ev2.Name, ev2.InitDate)
			if !used[key2] {
				used[key2] = true
				rows = append(rows, presence.Presence{
					UserNumber:    int64(u.UserNumber),
					EventName:     ev2.Name,
					EventInitDate: ev2.InitDate,
					EmailAdmin:    adminEmail,
				})
			}
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
	if len(users) == 0 || (len(prods.kits) == 0 && len(prods.coffees) == 0) {
		log.Println("Sales: sem usuários ou produtos, pulando")
		return
	}

	type saleSpec struct {
		userIdx   int
		items     []sales.SaleItem
		status    sales.SaleStatus
		method    string
		dietary   string
		total     float64
		mpID      *string
		isPickedUp bool
	}

	var specs []saleSpec

	// kit avulso - PAGO
	if len(prods.kits) >= 3 {
		specs = append(specs,
			saleSpec{0, []sales.SaleItem{{ProductID: prods.kits[0].ID, Quantity: 1, UnitPrice: prods.kits[0].Price, IsPickedUp: true}}, sales.SaleStatusPaid, "PIX", "", prods.kits[0].Price, strPtr("SEED-MP-001"), true},
			saleSpec{1, []sales.SaleItem{{ProductID: prods.kits[1].ID, Quantity: 1, UnitPrice: prods.kits[1].Price}}, sales.SaleStatusPaid, "PIX", "", prods.kits[1].Price, strPtr("SEED-MP-002"), false},
			saleSpec{2, []sales.SaleItem{{ProductID: prods.kits[2].ID, Quantity: 1, UnitPrice: prods.kits[2].Price, IsPickedUp: true}}, sales.SaleStatusPaid, "PIX", "", prods.kits[2].Price, strPtr("SEED-MP-003"), true},
			saleSpec{3, []sales.SaleItem{{ProductID: prods.kits[0].ID, Quantity: 1, UnitPrice: prods.kits[0].Price}}, sales.SaleStatusPending, "PIX", "", prods.kits[0].Price, nil, false},
			saleSpec{4, []sales.SaleItem{{ProductID: prods.kits[1].ID, Quantity: 1, UnitPrice: prods.kits[1].Price}}, sales.SaleStatusCanceled, "PIX", "", prods.kits[1].Price, nil, false},
		)
	}

	// coffee avulso - vários status
	if len(prods.coffees) >= 4 {
		total1 := prods.coffees[0].Price
		total2 := prods.coffees[1].Price + prods.coffees[2].Price
		specs = append(specs,
			saleSpec{5, []sales.SaleItem{{ProductID: prods.coffees[0].ID, Quantity: 1, UnitPrice: prods.coffees[0].Price}}, sales.SaleStatusPaid, "PIX", "Sem glúten", total1, strPtr("SEED-MP-004"), false},
			saleSpec{6, []sales.SaleItem{
				{ProductID: prods.coffees[1].ID, Quantity: 1, UnitPrice: prods.coffees[1].Price},
				{ProductID: prods.coffees[2].ID, Quantity: 1, UnitPrice: prods.coffees[2].Price},
			}, sales.SaleStatusPaid, "PIX", "Vegetariano", total2, strPtr("SEED-MP-005"), false},
			saleSpec{7, []sales.SaleItem{{ProductID: prods.coffees[3].ID, Quantity: 1, UnitPrice: prods.coffees[3].Price}}, sales.SaleStatusPending, "PIX", "Sem lactose", prods.coffees[3].Price, nil, false},
			saleSpec{8, []sales.SaleItem{{ProductID: prods.coffees[0].ID, Quantity: 1, UnitPrice: prods.coffees[0].Price}}, sales.SaleStatusRejected, "PIX", "", prods.coffees[0].Price, strPtr("SEED-MP-006"), false},
			saleSpec{9, []sales.SaleItem{{ProductID: prods.coffees[1].ID, Quantity: 1, UnitPrice: prods.coffees[1].Price}}, sales.SaleStatusExpired, "PIX", "", prods.coffees[1].Price, nil, false},
		)
	}

	// combo - vários status
	if len(prods.combos) >= 3 {
		specs = append(specs,
			saleSpec{10, []sales.SaleItem{{ProductID: prods.combos[0].ID, Quantity: 1, UnitPrice: prods.combos[0].Price}}, sales.SaleStatusPaid, "PIX", "Vegano", prods.combos[0].Price, strPtr("SEED-MP-007"), true},
			saleSpec{11, []sales.SaleItem{{ProductID: prods.combos[1].ID, Quantity: 1, UnitPrice: prods.combos[1].Price}}, sales.SaleStatusPaid, "PIX", "Sem restrições", prods.combos[1].Price, strPtr("SEED-MP-008"), false},
			saleSpec{12, []sales.SaleItem{{ProductID: prods.combos[0].ID, Quantity: 1, UnitPrice: prods.combos[0].Price}}, sales.SaleStatusPending, "PIX", "Sem glúten e sem lactose", prods.combos[0].Price, nil, false},
			saleSpec{13, []sales.SaleItem{{ProductID: prods.combos[2].ID, Quantity: 1, UnitPrice: prods.combos[2].Price}}, sales.SaleStatusCanceled, "PIX", "", prods.combos[2].Price, nil, false},
			saleSpec{14, []sales.SaleItem{{ProductID: prods.combos[1].ID, Quantity: 1, UnitPrice: prods.combos[1].Price}}, sales.SaleStatusRefunded, "PIX", "", prods.combos[1].Price, strPtr("SEED-MP-009"), false},
		)
	}

	// mais vendas de kit para usuários restantes
	if len(prods.kits) > 0 {
		for i := 15; i < 22 && i < len(users); i++ {
			k := prods.kits[i%len(prods.kits)]
			st := sales.SaleStatusPaid
			if i%3 == 0 {
				st = sales.SaleStatusPending
			}
			var mp *string
			if st == sales.SaleStatusPaid {
				mp = strPtr(fmt.Sprintf("SEED-MP-%03d", 10+i))
			}
			specs = append(specs, saleSpec{i, []sales.SaleItem{{ProductID: k.ID, Quantity: 1, UnitPrice: k.Price}}, st, "PIX", "", k.Price, mp, st == sales.SaleStatusPaid})
		}
	}

	for _, spec := range specs {
		if spec.userIdx >= len(users) {
			continue
		}
		u := users[spec.userIdx]
		sale := sales.Sale{
			SaleUserNumber: u.UserNumber,
			Status:         spec.status,
			TotalAmount:    spec.total,
			PaymentMethod:  spec.method,
			MercadoPagoID:  spec.mpID,
			DietaryRestrictions: spec.dietary,
			QRCode:         fmt.Sprintf("SEED-QR-%d", u.UserNumber),
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
				ci := sales.ConsumedItem{
					UserNumber:   users[spec.userIdx].UserNumber,
					ProductID:    item.ProductID,
					SourceSaleID: sale.ID,
				}
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

func seedRiddles(db *gorm.DB) []riddle.Riddle {
	var n int64
	db.Model(&riddle.Riddle{}).Where("hint1 LIKE ?", "[SEED]%").Count(&n)
	if skip("Riddles", n) {
		var out []riddle.Riddle
		db.Where("hint1 LIKE ?", "[SEED]%").Find(&out)
		return out
	}

	rows := []riddle.Riddle{
		{Hint1: "[SEED] Enigma 1: Sou invisível mas faço tudo funcionar", Hint2: "Você me usa todo dia sem me ver.", Answer: "eletricidade", ImageURL: "", IsActive: true},
		{Hint1: "[SEED] Enigma 2: Tenho chaves mas não abro portas", Hint2: "Estou em todas as mesas dos programadores.", Answer: "teclado", ImageURL: "https://example.com/seed/keyboard.jpg", IsActive: true},
		{Hint1: "[SEED] Enigma 3: Falo muitos idiomas mas não tenho boca", Hint2: "Sou a base da comunicação digital.", Answer: "protocolo", ImageURL: "", IsActive: true},
		{Hint1: "[SEED] Enigma 4: Nasço pequeno e posso crescer infinitamente", Hint2: "Desenvolvedores me temem quando fico grande demais.", Answer: "recursao", ImageURL: "https://example.com/seed/recursion.png", IsActive: true},
		{Hint1: "[SEED] Enigma 5: Tenho começo, meio e fim, mas nenhum tamanho fixo", Hint2: "Você me percorre para encontrar elementos.", Answer: "lista", ImageURL: "", IsActive: true},
		{Hint1: "[SEED] Enigma 6: Sou vermelho quando algo dá errado", Hint2: "Aparecço no terminal quando o código quebra.", Answer: "erro", ImageURL: "https://example.com/seed/error.png", IsActive: true},
		{Hint1: "[SEED] Enigma 7: Guardo segredos entre chave e valor", Hint2: "Em Python me chamam de dict, em JS de objeto.", Answer: "mapa", ImageURL: "", IsActive: true},
		{Hint1: "[SEED] Enigma 8: Posso ser público ou privado, mas sempre cuido de dados", Hint2: "Sou o 'B' do CRUD.", Answer: "banco de dados", ImageURL: "https://example.com/seed/db.jpg", IsActive: true},
		{Hint1: "[SEED] Enigma 9: Sou a arte de escrever instruções para máquinas", Hint2: "Turing foi um dos meus pioneiros.", Answer: "programacao", ImageURL: "", IsActive: true},
		{Hint1: "[SEED] Enigma 10: Posso ser git clone mas não git original", Hint2: "Sou uma cópia fiel do repositório.", Answer: "fork", ImageURL: "https://example.com/seed/fork.png", IsActive: true},
		{Hint1: "[SEED] Enigma 11: Processo pedidos e devolvo respostas", Hint2: "REST e GraphQL me usam.", Answer: "api", ImageURL: "", IsActive: true},
		{Hint1: "[SEED] Enigma 12: Sou a caixa preta entre o hardware e o software", Hint2: "Linux, Windows e macOS são meus exemplos.", Answer: "sistema operacional", ImageURL: "", IsActive: true},
		{Hint1: "[SEED] Enigma 13: Escondo complexidade atrás de uma interface simples", Hint2: "Sou um princípio fundamental da OOP.", Answer: "abstracao", ImageURL: "", IsActive: true},
		{Hint1: "[SEED] Enigma INATIVO: Desafio bônus", Hint2: "Não ativo no jogo atual.", Answer: "bonus", ImageURL: "", IsActive: false},
		{Hint1: "[SEED] Enigma INATIVO: Teste interno", Hint2: "Usado só para testes internos.", Answer: "teste", ImageURL: "", IsActive: false},
	}

	if err := db.Create(&rows).Error; err != nil {
		log.Fatalf("Riddles: %v", err)
	}
	log.Printf("Riddles: %d inseridos", len(rows))
	return rows
}

// ── teams ──────────────────────────────────────────────────────────────────

func seedTeams(db *gorm.DB, users []user.User) {
	var n int64
	db.Table("teams").Where("name LIKE ?", "[SEED]%").Count(&n)
	if skip("Teams", n) {
		return
	}
	if len(users) < 5 {
		log.Println("Teams: usuários insuficientes, pulando")
		return
	}

	type teamRow struct {
		Name               string    `gorm:"column:name"`
		Code               string    `gorm:"column:code"`
		CurrentRiddleIndex uint      `gorm:"column:current_riddle_index"`
		FinishedAt         *time.Time `gorm:"column:finished_at"`
	}

	now := time.Now()
	finished := now.Add(-2 * time.Hour)

	teams := []teamRow{
		{"[SEED] Equipe Alpha", "SEEDALPH", 5, nil},
		{"[SEED] Equipe Beta", "SEEDBETA", 3, nil},
		{"[SEED] Equipe Gamma", "SEEDGAMM", 13, &finished},
		{"[SEED] Equipe Delta", "SEEDDELT", 0, nil},
		{"[SEED] Equipe Epsilon", "SEEDEPSL", 8, nil},
	}

	var teamIDs []int64
	for _, t := range teams {
		res := db.Table("teams").Create(&t)
		if res.Error != nil {
			log.Fatalf("Team %s: %v", t.Name, res.Error)
		}
		var id int64
		db.Table("teams").Where("code = ?", t.Code).Select("id").Scan(&id)
		teamIDs = append(teamIDs, id)
	}

	// membros por equipe: 5, 3, 4, 1, 2
	memberGroups := [][]int{
		{0, 1, 2, 3, 4},
		{5, 6, 7},
		{8, 9, 10, 11},
		{12},
		{13, 14},
	}

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
			res := db.Table("team_members").Clauses(clause.OnConflict{DoNothing: true}).Create(&m)
			if res.Error != nil {
				log.Printf("TeamMember team=%d user=%d: %v", teamIDs[i], users[uIdx].UserNumber, res.Error)
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

	sponsors := []sponsor.Sponsor{
		{CNPJ: "00000000000001", Name: "[SEED] TechCorp Brasil", Website: "https://techcorp.example.com", Logo: "uploads/sponsors/seed_techcorp.png", Clicks: 142},
		{CNPJ: "00000000000002", Name: "[SEED] DataSoft", Website: "https://datasoft.example.com", Logo: "uploads/sponsors/seed_datasoft.png", Clicks: 87},
		{CNPJ: "00000000000003", Name: "[SEED] CloudSystems", Website: "https://cloud.example.com", Logo: "", Clicks: 0},
		{CNPJ: "00000000000004", Name: "[SEED] DevHouse", Website: "https://devhouse.example.com", Logo: "uploads/sponsors/seed_devhouse.png", Clicks: 310},
		{CNPJ: "00000000000005", Name: "[SEED] InnovateTech", Website: "https://innovate.example.com", Logo: "", Clicks: 55},
		{CNPJ: "00000000000006", Name: "[SEED] OpenSource Co", Website: "https://opensource.example.com", Logo: "uploads/sponsors/seed_opensource.png", Clicks: 203},
	}

	sponsorsRes := db.Clauses(clause.OnConflict{DoNothing: true}).Create(&sponsors)
	if sponsorsRes.Error != nil {
		log.Fatalf("Sponsors: %v", sponsorsRes.Error)
	}

	packages := []sponsor.SponsorPackage{
		{SponsorCNPJ: "00000000000001", Year: 2025, Package: "Ouro"},
		{SponsorCNPJ: "00000000000001", Year: 2024, Package: "Prata"},
		{SponsorCNPJ: "00000000000002", Year: 2025, Package: "Prata"},
		{SponsorCNPJ: "00000000000002", Year: 2025, Package: "Apoio"},
		{SponsorCNPJ: "00000000000003", Year: 2025, Package: "Bronze"},
		{SponsorCNPJ: "00000000000004", Year: 2025, Package: "Diamante"},
		{SponsorCNPJ: "00000000000004", Year: 2024, Package: "Ouro"},
		{SponsorCNPJ: "00000000000004", Year: 2023, Package: "Prata"},
		{SponsorCNPJ: "00000000000005", Year: 2025, Package: "Apoio"},
		{SponsorCNPJ: "00000000000006", Year: 2025, Package: "Prata"},
		{SponsorCNPJ: "00000000000006", Year: 2024, Package: "Bronze"},
	}

	packagesRes := db.Clauses(clause.OnConflict{DoNothing: true}).Create(&packages)
	if packagesRes.Error != nil {
		log.Fatalf("SponsorPackages: %v", packagesRes.Error)
	}
	log.Printf("Sponsors: %d sponsors + %d pacotes inseridos", sponsorsRes.RowsAffected, packagesRes.RowsAffected)
}

// ── notices ────────────────────────────────────────────────────────────────

func seedNotices(db *gorm.DB) {
	var n int64
	db.Model(&notice.Notice{}).Where("title LIKE ?", "[SEED]%").Count(&n)
	if skip("Notices", n) {
		return
	}

	now := time.Now()
	type noticeRow struct{ title, content string; daysOffset int }
	rows := []noticeRow{
		{"[SEED] Bem-vindos à Semcomp 2025!", "A Semcomp 2025 começa hoje. Confira a programação completa no site.", -10},
		{"[SEED] Credenciamento aberto", "O credenciamento está disponível na entrada do ICMC das 8h às 18h.", -9},
		{"[SEED] Palestra de IA com vagas esgotadas", "A palestra de IA esgotou todas as vagas. Fique atento às próximas edições.", -8},
		{"[SEED] Alteração de sala: Minicurso Docker", "O Minicurso de Docker foi transferido para o Laboratório 4.", -7},
		{"[SEED] Resultado do Hackathon", "Os vencedores do hackathon foram anunciados. Parabéns aos times classificados!", -6},
		{"[SEED] Coffee break disponível", "O coffee break do primeiro dia já está disponível para retirada.", -5},
		{"[SEED] Riddle: primeira equipe a terminar", "A equipe Alpha foi a primeira a resolver todos os enigmas. Parabéns!", -4},
		{"[SEED] Inscrições abertas para workshops", "Novos workshops foram abertos. Garanta sua vaga pelo site.", -3},
		{"[SEED] Prazo para envio de PAPFE", "Lembrete: o prazo para envio do comprovante PAPFE encerra em 48 horas.", -2},
		{"[SEED] Atualização: formulário de presença", "O formulário de presença foi atualizado. Verifique sua taxa de presença.", -1},
		{"[SEED] Programação de hoje", "Confira a programação completa de hoje no site ou no app.", 0},
		{"[SEED] Vagas disponíveis: palestra amanhã", "Ainda há vagas para a palestra de amanhã. Inscreva-se!", 0},
		{"[SEED] Aviso: manutenção do sistema", "O sistema ficará em manutenção neste sábado das 2h às 4h.", 1},
		{"[SEED] Novos patrocinadores confirmados", "Dois novos patrocinadores foram confirmados para este ano.", 2},
		{"[SEED] Lembrete: encerramento da Semcomp", "O evento de encerramento acontece nesta sexta às 19h na área externa.", 3},
	}

	for _, r := range rows {
		n := notice.Notice{
			Title:    r.title,
			Content:  r.content,
			DateTime: now.AddDate(0, 0, r.daysOffset),
		}
		if err := db.Create(&n).Error; err != nil {
			log.Fatalf("Notice %s: %v", r.title, err)
		}
	}
	log.Printf("Notices: %d inseridos", len(rows))
}

// ── papfe documents ────────────────────────────────────────────────────────

func seedPapfeDocs(db *gorm.DB, users []user.User) {
	var n int64
	db.Model(&user.PapfeDocument{}).
		Where("file_path LIKE ?", "uploads/papfe/seed_%").Count(&n)
	if skip("PapfeDocs", n) {
		return
	}

	// apenas usuários com HasPapfe = true
	var papfeUsers []user.User
	for _, u := range users {
		if u.HasPapfe {
			papfeUsers = append(papfeUsers, u)
		}
	}
	if len(papfeUsers) == 0 {
		log.Println("PapfeDocs: nenhum usuário com HasPapfe, pulando")
		return
	}

	now := time.Now()
	approved := true
	rejected := false

	statuses := []*bool{nil, &approved, &rejected, nil, &approved, &approved, &rejected, nil, &approved, nil}
	reasons := []string{"", "", "Documento ilegível. Envie uma foto mais nítida.", "", "", "", "Comprovante fora do prazo de validade.", "", "", ""}

	var rows []user.PapfeDocument
	for i, u := range papfeUsers {
		idx := i % len(statuses)
		var rejReason *string
		if statuses[idx] != nil && !*statuses[idx] && reasons[idx] != "" {
			rejReason = strPtr(reasons[idx])
		}
		rows = append(rows, user.PapfeDocument{
			UserEmail:       u.Email,
			Filename:        fmt.Sprintf("seed_%s_papfe.pdf", sanitizeEmail(u.Email)),
			ContentType:     "application/pdf",
			FilePath:        fmt.Sprintf("uploads/papfe/seed_%s_papfe.pdf", sanitizeEmail(u.Email)),
			UploadedAt:      now.AddDate(0, 0, -(i + 1)),
			IsApproved:      statuses[idx],
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
	db.Model(&absenceJustification.AbsenceJustification{}).
		Where("attachment_file_path LIKE ?", "uploads/absence-justifications/seed_%").Count(&n)
	if skip("AbsenceJustifications", n) {
		return
	}
	if len(users) == 0 || len(events) == 0 {
		return
	}

	statuses := []string{
		absenceJustification.StatusEmAnalise,
		absenceJustification.StatusAprovado,
		absenceJustification.StatusNegado,
		absenceJustification.StatusDocumentoInvalido,
		absenceJustification.StatusEmAnalise,
		absenceJustification.StatusAprovado,
		absenceJustification.StatusNegado,
		absenceJustification.StatusEmAnalise,
		absenceJustification.StatusAprovado,
		absenceJustification.StatusDocumentoInvalido,
	}
	rejectionReasons := []string{
		"", "", "Justificativa não aceita pela organização.", "", "", "",
		"Documento não corresponde à data do evento.", "", "", "",
	}

	now := time.Now()
	var rows []absenceJustification.AbsenceJustification
	for i, u := range users {
		if i >= len(statuses) {
			break
		}
		ev := events[i%len(events)]
		st := statuses[i]
		var rejReason *string
		if st == absenceJustification.StatusNegado && rejectionReasons[i] != "" {
			rejReason = strPtr(rejectionReasons[i])
		}
		rows = append(rows, absenceJustification.AbsenceJustification{
			UserEmail:             u.Email,
			EventName:             ev.Name,
			EventInitDate:         ev.InitDate,
			Reason:                fmt.Sprintf("Motivo de ausência do participante %s: compromisso inadiável.", u.Name),
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
