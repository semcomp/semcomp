// Script de seed do banco de dados — use apenas localmente.
//
// Popula o banco com dados de exemplo: usuários Semcomp, eventos, patrocinadores,
// produtos (kit, coffee, combo), avisos e riddles.
//
// Uso:
//
//	go run ./cmd/seed        (dentro do diretório backend/)
package main

import (
	"fmt"
	"log"
	"time"

	"backend/internal/database"
	"backend/internal/event"
	"backend/internal/notice"
	"backend/internal/presencesettings"
	"backend/internal/product"
	"backend/internal/riddle"
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

	log.Println("=== Iniciando seed do banco de dados ===")

	seedPresenceTypeWeights(db)
	seedUsers(db)
	seedEvents(db)
	seedSponsors(db)
	seedProducts(db)
	seedNotices(db)
	seedRiddles(db)

	log.Println("=== Seed finalizado com sucesso! ===")
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

func hashPassword(plain string) string {
	h, err := bcrypt.GenerateFromPassword([]byte(plain), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Erro ao gerar hash de senha: %v", err)
	}
	return string(h)
}

func strPtr(s string) *string { return &s }

func dt(year, month, day, hour, min int) time.Time {
	return time.Date(year, time.Month(month), day, hour, min, 0, 0, time.UTC)
}

// ─── Pesos de tipo de presença ─────────────────────────────────────────────────

func seedPresenceTypeWeights(db *gorm.DB) {
	log.Println("[presencesettings] Inserindo pesos de tipo de presença...")

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
		result := db.Where(presencesettings.PresenceTypeWeight{TypeName: weights[i].TypeName}).
			FirstOrCreate(&weights[i])
		if result.Error != nil {
			log.Fatalf("[presencesettings] Erro ao inserir '%s': %v", weights[i].TypeName, result.Error)
		}
	}
	log.Printf("[presencesettings] %d pesos inseridos/verificados.", len(weights))
}

// ─── Usuários Semcomp ──────────────────────────────────────────────────────────

func seedUsers(db *gorm.DB) {
	log.Println("[users] Inserindo usuários de exemplo...")

	// Senha padrão para todos os usuários de seed: senha1234
	pw := hashPassword("senha1234")

	users := []user.User{
		{
			UserNumber:               1,
			Name:                     "Alice Pereira",
			Email:                    "alice@example.com",
			PasswordHash:             pw,
			Age:                      21,
			Gender:                   "Feminino",
			City:                     "São Carlos",
			Education:                "Graduação",
			HasPapfe:                 true,
			Disabilities:             "",
			Profession:               strPtr("Estudante"),
			Linkedin:                 strPtr("https://linkedin.com/in/alice"),
			EmailVerified:            true,
			PresenceRate:             0.0,
			QuerCracha:               true,
			AutorizaCompartilhamento: true,
		},
		{
			UserNumber:               2,
			Name:                     "Bruno Santos",
			Email:                    "bruno@example.com",
			PasswordHash:             pw,
			Age:                      23,
			Gender:                   "Masculino",
			City:                     "Ribeirão Preto",
			Education:                "Pós-graduação",
			HasPapfe:                 false,
			Disabilities:             "",
			Telegram:                 strPtr("@brunosantos"),
			EmailVerified:            true,
			PresenceRate:             0.0,
			QuerCracha:               true,
			AutorizaCompartilhamento: false,
		},
		{
			UserNumber:               3,
			Name:                     "Carla Oliveira",
			Email:                    "carla@example.com",
			PasswordHash:             pw,
			Age:                      19,
			Gender:                   "Feminino",
			City:                     "São Paulo",
			Education:                "Graduação",
			HasPapfe:                 false,
			Disabilities:             "Deficiência visual parcial",
			EmailVerified:            true,
			PresenceRate:             0.0,
			QuerCracha:               false,
			AutorizaCompartilhamento: true,
		},
		{
			UserNumber:               4,
			Name:                     "Daniel Rocha",
			Email:                    "daniel@example.com",
			PasswordHash:             pw,
			Age:                      25,
			Gender:                   "Masculino",
			City:                     "Campinas",
			Education:                "Pós-graduação",
			HasPapfe:                 true,
			Disabilities:             "",
			Profession:               strPtr("Engenheiro de Software"),
			Linkedin:                 strPtr("https://linkedin.com/in/danielrocha"),
			Telegram:                 strPtr("@danielrocha"),
			EmailVerified:            true,
			PresenceRate:             0.0,
			QuerCracha:               true,
			AutorizaCompartilhamento: true,
		},
		{
			UserNumber:               5,
			Name:                     "Eva Lima",
			Email:                    "eva@example.com",
			PasswordHash:             pw,
			Age:                      20,
			Gender:                   "Feminino",
			City:                     "Araraquara",
			Education:                "Ensino Médio",
			HasPapfe:                 false,
			Disabilities:             "",
			EmailVerified:            false,
			PresenceRate:             0.0,
			QuerCracha:               false,
			AutorizaCompartilhamento: false,
		},
		{
			UserNumber:               6,
			Name:                     "Felipe Cardoso",
			Email:                    "felipe@example.com",
			PasswordHash:             pw,
			Age:                      22,
			Gender:                   "Masculino",
			City:                     "São Carlos",
			Education:                "Graduação",
			HasPapfe:                 true,
			Disabilities:             "",
			Profession:               strPtr("Estagiário de Dados"),
			Linkedin:                 strPtr("https://linkedin.com/in/felipecardoso"),
			EmailVerified:            true,
			PresenceRate:             0.0,
			QuerCracha:               true,
			AutorizaCompartilhamento: true,
		},
		{
			UserNumber:               7,
			Name:                     "Gabriela Mendes",
			Email:                    "gabriela@example.com",
			PasswordHash:             pw,
			Age:                      24,
			Gender:                   "Feminino",
			City:                     "Bauru",
			Education:                "Graduação",
			HasPapfe:                 false,
			Disabilities:             "Deficiência auditiva leve",
			Telegram:                 strPtr("@gabriela_m"),
			EmailVerified:            true,
			PresenceRate:             0.0,
			QuerCracha:               true,
			AutorizaCompartilhamento: true,
		},
		{
			UserNumber:               8,
			Name:                     "Henrique Souza",
			Email:                    "henrique@example.com",
			PasswordHash:             pw,
			Age:                      27,
			Gender:                   "Masculino",
			City:                     "São José do Rio Preto",
			Education:                "Técnico",
			HasPapfe:                 false,
			Disabilities:             "",
			Profession:               strPtr("Analista de Sistemas"),
			EmailVerified:            true,
			PresenceRate:             0.0,
			QuerCracha:               false,
			AutorizaCompartilhamento: false,
		},
		{
			UserNumber:               9,
			Name:                     "Isabela Teixeira",
			Email:                    "isabela@example.com",
			PasswordHash:             pw,
			Age:                      18,
			Gender:                   "Feminino",
			City:                     "Piracicaba",
			Education:                "Graduação",
			HasPapfe:                 true,
			Disabilities:             "",
			Linkedin:                 strPtr("https://linkedin.com/in/isabelateixeira"),
			EmailVerified:            true,
			PresenceRate:             0.0,
			QuerCracha:               true,
			AutorizaCompartilhamento: true,
		},
		{
			UserNumber:               10,
			Name:                     "João Vitor Nunes",
			Email:                    "joaovitor@example.com",
			PasswordHash:             pw,
			Age:                      26,
			Gender:                   "Masculino",
			City:                     "São Carlos",
			Education:                "Pós-graduação",
			HasPapfe:                 true,
			Disabilities:             "",
			Profession:               strPtr("Pesquisador"),
			Linkedin:                 strPtr("https://linkedin.com/in/joaovitornunes"),
			Telegram:                 strPtr("@joaovnunes"),
			EmailVerified:            true,
			PresenceRate:             0.0,
			QuerCracha:               true,
			AutorizaCompartilhamento: true,
		},
		{
			UserNumber:               11,
			Name:                     "Larissa Ferreira",
			Email:                    "larissa@example.com",
			PasswordHash:             pw,
			Age:                      21,
			Gender:                   "Feminino",
			City:                     "Franca",
			Education:                "Graduação",
			HasPapfe:                 false,
			Disabilities:             "",
			EmailVerified:            true,
			PresenceRate:             0.0,
			QuerCracha:               true,
			AutorizaCompartilhamento: false,
		},
		{
			UserNumber:               12,
			Name:                     "Marcos Alves",
			Email:                    "marcos@example.com",
			PasswordHash:             pw,
			Age:                      30,
			Gender:                   "Masculino",
			City:                     "Presidente Prudente",
			Education:                "Pós-graduação",
			HasPapfe:                 false,
			Disabilities:             "Mobilidade reduzida",
			EmailVerified:            false,
			PresenceRate:             0.0,
			QuerCracha:               false,
			AutorizaCompartilhamento: false,
		},
	}

	result := db.Clauses(clause.OnConflict{DoNothing: true}).Create(&users)
	if result.Error != nil {
		log.Fatalf("[users] Erro ao inserir usuários: %v", result.Error)
	}
	log.Printf("[users] %d usuários inseridos/verificados.", len(users))
}

// ─── Eventos ───────────────────────────────────────────────────────────────────

func seedEvents(db *gorm.DB) {
	log.Println("[events] Inserindo eventos de exemplo...")

	// Carrega IDs dos tipos de presença
	typeIDs := map[string]*uint{}
	for _, name := range []string{"Palestra", "Vitrine", "Minicurso", "Rodas de conversa",
		"Gamenight", "Coffee", "Concursos", "Oficina", "Luau", "Jogos de rua", "Abertura", "Encerramento"} {
		var w presencesettings.PresenceTypeWeight
		db.Where("type_name = ?", name).First(&w)
		if w.ID != 0 {
			id := w.ID
			typeIDs[name] = &id
		}
	}

	// 06/10 (seg) até 10/10 (sex) de 2025
	events := []event.Event{
		// ── Segunda-feira 06/10 ──────────────────────────────────────────────
		{
			Name:            "Abertura Semcomp 29",
			InitDate:        dt(2025, 10, 6, 19, 0),
			EndDate:         dt(2025, 10, 6, 21, 0),
			PresenceTypeID:  typeIDs["Abertura"],
			Type:            "Abertura",
			Location:        "Auditório Fernandinho - ICMC",
			Description:     "Cerimônia de abertura da 29ª edição da Semcomp com apresentações e boas-vindas da organização.",
			HasAttendance:   false,
			HasSignin:       false,
			MaxParticipants: 0,
		},
		{
			Name:            "Coffee de Abertura",
			InitDate:        dt(2025, 10, 6, 21, 0),
			EndDate:         dt(2025, 10, 6, 22, 0),
			PresenceTypeID:  typeIDs["Coffee"],
			Type:            "Coffee",
			Location:        "Hall do ICMC",
			Description:     "Coffee de confraternização após a cerimônia de abertura.",
			HasAttendance:   false,
			HasSignin:       false,
			MaxParticipants: 0,
		},

		// ── Terça-feira 07/10 ────────────────────────────────────────────────
		{
			Name:            "Minicurso: Go para Iniciantes",
			InitDate:        dt(2025, 10, 7, 10, 0),
			EndDate:         dt(2025, 10, 7, 12, 0),
			PresenceTypeID:  typeIDs["Minicurso"],
			Type:            "Minicurso",
			Location:        "Sala 5-001 - ICMC",
			Description:     "Introdução à linguagem Go com foco em APIs REST e concorrência.",
			HasAttendance:   false,
			HasSignin:       true,
			MaxParticipants: 30,
		},
		{
			Name:            "Coffee da manhã - Terça",
			InitDate:        dt(2025, 10, 7, 9, 0),
			EndDate:         dt(2025, 10, 7, 9, 30),
			PresenceTypeID:  typeIDs["Coffee"],
			Type:            "Coffee",
			Location:        "Hall do ICMC",
			Description:     "Coffee break matinal do segundo dia.",
			HasAttendance:   false,
			HasSignin:       false,
			MaxParticipants: 0,
		},
		{
			Name:            "Palestra: Inteligência Artificial na Prática",
			InitDate:        dt(2025, 10, 7, 14, 0),
			EndDate:         dt(2025, 10, 7, 15, 30),
			PresenceTypeID:  typeIDs["Palestra"],
			Type:            "Palestra",
			Location:        "Auditório Fernandinho - ICMC",
			Description:     "Aplicações reais de IA em produtos de grande escala: de modelos de linguagem a visão computacional.",
			HasAttendance:   true,
			HasSignin:       false,
			MaxParticipants: 0,
		},
		{
			Name:            "Oficina: Docker do Zero",
			InitDate:        dt(2025, 10, 7, 16, 0),
			EndDate:         dt(2025, 10, 7, 18, 0),
			PresenceTypeID:  typeIDs["Oficina"],
			Type:            "Oficina",
			Location:        "Laboratório de Sistemas - ICMC",
			Description:     "Oficina prática de containerização de aplicações com Docker e Docker Compose.",
			HasAttendance:   false,
			HasSignin:       true,
			MaxParticipants: 25,
		},
		{
			Name:            "Rodas de Conversa: Carreira em Tech",
			InitDate:        dt(2025, 10, 7, 18, 30),
			EndDate:         dt(2025, 10, 7, 20, 0),
			PresenceTypeID:  typeIDs["Rodas de conversa"],
			Type:            "Rodas de conversa",
			Location:        "Sala 3-010 - ICMC",
			Description:     "Bate-papo aberto sobre carreira em tecnologia com profissionais da área.",
			HasAttendance:   false,
			HasSignin:       false,
			MaxParticipants: 0,
		},

		// ── Quarta-feira 08/10 ───────────────────────────────────────────────
		{
			Name:            "Coffee da manhã - Quarta",
			InitDate:        dt(2025, 10, 8, 9, 0),
			EndDate:         dt(2025, 10, 8, 9, 30),
			PresenceTypeID:  typeIDs["Coffee"],
			Type:            "Coffee",
			Location:        "Hall do ICMC",
			Description:     "Coffee break matinal do terceiro dia.",
			HasAttendance:   false,
			HasSignin:       false,
			MaxParticipants: 0,
		},
		{
			Name:            "Minicurso: Machine Learning com Python",
			InitDate:        dt(2025, 10, 8, 10, 0),
			EndDate:         dt(2025, 10, 8, 12, 0),
			PresenceTypeID:  typeIDs["Minicurso"],
			Type:            "Minicurso",
			Location:        "Sala 5-002 - ICMC",
			Description:     "Introdução ao aprendizado de máquina com scikit-learn e pandas.",
			HasAttendance:   false,
			HasSignin:       true,
			MaxParticipants: 35,
		},
		{
			Name:            "Vitrine de Empresas",
			InitDate:        dt(2025, 10, 8, 13, 0),
			EndDate:         dt(2025, 10, 8, 17, 0),
			PresenceTypeID:  typeIDs["Vitrine"],
			Type:            "Vitrine",
			Location:        "Hall do ICMC",
			Description:     "Stands de empresas parceiras com oportunidades de estágio, emprego e networking.",
			HasAttendance:   true,
			HasSignin:       false,
			MaxParticipants: 0,
		},
		{
			Name:            "Palestra: Segurança em APIs REST",
			InitDate:        dt(2025, 10, 8, 16, 0),
			EndDate:         dt(2025, 10, 8, 17, 30),
			PresenceTypeID:  typeIDs["Palestra"],
			Type:            "Palestra",
			Location:        "Auditório Fernandinho - ICMC",
			Description:     "Boas práticas de segurança para APIs modernas: autenticação, autorização e proteção contra ataques comuns.",
			HasAttendance:   true,
			HasSignin:       false,
			MaxParticipants: 0,
		},
		{
			Name:            "Gamenight",
			InitDate:        dt(2025, 10, 8, 19, 0),
			EndDate:         dt(2025, 10, 8, 22, 0),
			PresenceTypeID:  typeIDs["Gamenight"],
			Type:            "Gamenight",
			Location:        "Corredor do ICMC",
			Description:     "Noite de jogos de tabuleiro, card games e videogame. Traga seus amigos!",
			HasAttendance:   false,
			HasSignin:       true,
			MaxParticipants: 60,
		},

		// ── Quinta-feira 09/10 ───────────────────────────────────────────────
		{
			Name:            "Coffee da manhã - Quinta",
			InitDate:        dt(2025, 10, 9, 9, 0),
			EndDate:         dt(2025, 10, 9, 9, 30),
			PresenceTypeID:  typeIDs["Coffee"],
			Type:            "Coffee",
			Location:        "Hall do ICMC",
			Description:     "Coffee break matinal do quarto dia.",
			HasAttendance:   false,
			HasSignin:       false,
			MaxParticipants: 0,
		},
		{
			Name:            "Palestra: Sistemas Distribuídos na Nuvem",
			InitDate:        dt(2025, 10, 9, 10, 0),
			EndDate:         dt(2025, 10, 9, 11, 30),
			PresenceTypeID:  typeIDs["Palestra"],
			Type:            "Palestra",
			Location:        "Auditório Fernandinho - ICMC",
			Description:     "Arquiteturas modernas de microsserviços, orquestração com Kubernetes e observabilidade.",
			HasAttendance:   true,
			HasSignin:       false,
			MaxParticipants: 0,
		},
		{
			Name:            "Oficina: Git Avançado",
			InitDate:        dt(2025, 10, 9, 14, 0),
			EndDate:         dt(2025, 10, 9, 16, 0),
			PresenceTypeID:  typeIDs["Oficina"],
			Type:            "Oficina",
			Location:        "Laboratório de Sistemas - ICMC",
			Description:     "Dominando rebase, cherry-pick, hooks e workflows colaborativos com Git.",
			HasAttendance:   false,
			HasSignin:       true,
			MaxParticipants: 25,
		},
		{
			Name:            "Concurso de Programação",
			InitDate:        dt(2025, 10, 9, 14, 0),
			EndDate:         dt(2025, 10, 9, 18, 0),
			PresenceTypeID:  typeIDs["Concursos"],
			Type:            "Concursos",
			Location:        "Laboratório de Computação - ICMC",
			Description:     "Maratona de programação com problemas de dificuldade variada. Premiação para os três primeiros colocados.",
			HasAttendance:   false,
			HasSignin:       true,
			MaxParticipants: 50,
		},
		{
			Name:            "Palestra: Open Source: Como Contribuir",
			InitDate:        dt(2025, 10, 9, 16, 30),
			EndDate:         dt(2025, 10, 9, 18, 0),
			PresenceTypeID:  typeIDs["Palestra"],
			Type:            "Palestra",
			Location:        "Auditório Fernandinho - ICMC",
			Description:     "Como encontrar projetos open source, entender o código e fazer sua primeira contribuição.",
			HasAttendance:   true,
			HasSignin:       false,
			MaxParticipants: 0,
		},
		{
			Name:            "Luau Semcomp",
			InitDate:        dt(2025, 10, 9, 20, 0),
			EndDate:         dt(2025, 10, 9, 23, 59),
			PresenceTypeID:  typeIDs["Luau"],
			Type:            "Luau",
			Location:        "Área externa do ICMC",
			Description:     "Luau de integração com música ao vivo, jogos e muita festa.",
			HasAttendance:   false,
			HasSignin:       true,
			MaxParticipants: 200,
		},

		// ── Sexta-feira 10/10 ────────────────────────────────────────────────
		{
			Name:            "Coffee da manhã - Sexta",
			InitDate:        dt(2025, 10, 10, 9, 0),
			EndDate:         dt(2025, 10, 10, 9, 30),
			PresenceTypeID:  typeIDs["Coffee"],
			Type:            "Coffee",
			Location:        "Hall do ICMC",
			Description:     "Coffee break matinal do último dia.",
			HasAttendance:   false,
			HasSignin:       false,
			MaxParticipants: 0,
		},
		{
			Name:            "Palestra: Empreendedorismo em Tech",
			InitDate:        dt(2025, 10, 10, 10, 0),
			EndDate:         dt(2025, 10, 10, 11, 30),
			PresenceTypeID:  typeIDs["Palestra"],
			Type:            "Palestra",
			Location:        "Auditório Fernandinho - ICMC",
			Description:     "Da ideia ao produto: lições aprendidas por fundadores de startups de tecnologia.",
			HasAttendance:   true,
			HasSignin:       false,
			MaxParticipants: 0,
		},
		{
			Name:            "Jogos de Rua",
			InitDate:        dt(2025, 10, 10, 14, 0),
			EndDate:         dt(2025, 10, 10, 17, 0),
			PresenceTypeID:  typeIDs["Jogos de rua"],
			Type:            "Jogos de rua",
			Location:        "Área externa do ICMC",
			Description:     "Gincana e jogos de rua para encerrar a semana com energia!",
			HasAttendance:   false,
			HasSignin:       true,
			MaxParticipants: 80,
		},
		{
			Name:            "Encerramento Semcomp 29",
			InitDate:        dt(2025, 10, 10, 19, 0),
			EndDate:         dt(2025, 10, 10, 21, 0),
			PresenceTypeID:  typeIDs["Encerramento"],
			Type:            "Encerramento",
			Location:        "Auditório Fernandinho - ICMC",
			Description:     "Cerimônia de encerramento com premiações da maratona, reconhecimento de voluntários e retrospectiva da edição.",
			HasAttendance:   false,
			HasSignin:       false,
			MaxParticipants: 0,
		},
	}

	inserted := 0
	for i := range events {
		result := db.
			Where("name = ? AND init_date = ?", events[i].Name, events[i].InitDate).
			FirstOrCreate(&events[i])
		if result.Error != nil {
			log.Printf("[events] Erro ao inserir '%s': %v", events[i].Name, result.Error)
			continue
		}
		if result.RowsAffected > 0 {
			inserted++
		}
	}
	log.Printf("[events] %d/%d eventos inseridos/verificados.", inserted, len(events))
}

// ─── Patrocinadores ────────────────────────────────────────────────────────────

func seedSponsors(db *gorm.DB) {
	log.Println("[sponsors] Inserindo patrocinadores de exemplo...")

	type entry struct {
		s    sponsor.Sponsor
		pkgs []sponsor.SponsorPackage
	}

	data := []entry{
		// ── Nível Ouro ──────────────────────────────────────────────────────
		{
			s: sponsor.Sponsor{
				CNPJ: "00000000000191", Name: "TechCorp Brasil",
				Website: "https://techcorp.example.com", Logo: "", Clicks: 0,
			},
			pkgs: []sponsor.SponsorPackage{
				{SponsorCNPJ: "00000000000191", Year: 2024, Package: "Prata"},
				{SponsorCNPJ: "00000000000191", Year: 2025, Package: "Ouro"},
			},
		},
		{
			s: sponsor.Sponsor{
				CNPJ: "33333333000191", Name: "MegaByte Corp",
				Website: "https://megabyte.example.com", Logo: "", Clicks: 0,
			},
			pkgs: []sponsor.SponsorPackage{
				{SponsorCNPJ: "33333333000191", Year: 2025, Package: "Ouro"},
			},
		},

		// ── Nível Prata ──────────────────────────────────────────────────────
		{
			s: sponsor.Sponsor{
				CNPJ: "11111111000191", Name: "DataSoft Solutions",
				Website: "https://datasoft.example.com", Logo: "", Clicks: 0,
			},
			pkgs: []sponsor.SponsorPackage{
				{SponsorCNPJ: "11111111000191", Year: 2025, Package: "Prata"},
			},
		},
		{
			s: sponsor.Sponsor{
				CNPJ: "44444444000191", Name: "InfraCloud Ltda",
				Website: "https://infracloud.example.com", Logo: "", Clicks: 0,
			},
			pkgs: []sponsor.SponsorPackage{
				{SponsorCNPJ: "44444444000191", Year: 2024, Package: "Bronze"},
				{SponsorCNPJ: "44444444000191", Year: 2025, Package: "Prata"},
			},
		},

		// ── Nível Bronze ─────────────────────────────────────────────────────
		{
			s: sponsor.Sponsor{
				CNPJ: "22222222000191", Name: "CloudNet Startup",
				Website: "https://cloudnet.example.com", Logo: "", Clicks: 0,
			},
			pkgs: []sponsor.SponsorPackage{
				{SponsorCNPJ: "22222222000191", Year: 2025, Package: "Bronze"},
			},
		},
		{
			s: sponsor.Sponsor{
				CNPJ: "55555555000191", Name: "ByteForce Consultoria",
				Website: "https://byteforce.example.com", Logo: "", Clicks: 0,
			},
			pkgs: []sponsor.SponsorPackage{
				{SponsorCNPJ: "55555555000191", Year: 2025, Package: "Bronze"},
			},
		},
		{
			s: sponsor.Sponsor{
				CNPJ: "66666666000191", Name: "PixelDev Agency",
				Website: "https://pixeldev.example.com", Logo: "", Clicks: 0,
			},
			pkgs: []sponsor.SponsorPackage{
				{SponsorCNPJ: "66666666000191", Year: 2025, Package: "Bronze"},
			},
		},
	}

	for _, d := range data {
		sp := d.s
		result := db.Where(sponsor.Sponsor{CNPJ: sp.CNPJ}).FirstOrCreate(&sp)
		if result.Error != nil {
			log.Printf("[sponsors] Erro ao inserir '%s': %v", sp.Name, result.Error)
		}
		for _, pkg := range d.pkgs {
			p := pkg
			db.Clauses(clause.OnConflict{DoNothing: true}).Create(&p)
		}
	}
	log.Printf("[sponsors] %d patrocinadores inseridos/verificados.", len(data))
}

// ─── Produtos ──────────────────────────────────────────────────────────────────

func seedProducts(db *gorm.DB) {
	log.Println("[products] Inserindo produtos de exemplo...")

	// ── Kits ────────────────────────────────────────────────────────────────
	type kitSpec struct {
		productName string
		desc        string
		size        string
		color       string
		babylook    bool
		price       float64
		selling     bool
	}

	kitSpecs := []kitSpec{
		{"Kit Semcomp 29 - Camiseta P", "Camiseta tamanho P (corte masculino).", "P", "Preta", false, 59.90, true},
		{"Kit Semcomp 29 - Camiseta M", "Camiseta tamanho M (corte masculino).", "M", "Preta", false, 59.90, true},
		{"Kit Semcomp 29 - Camiseta G", "Camiseta tamanho G (corte masculino).", "G", "Preta", false, 59.90, true},
		{"Kit Semcomp 29 - Camiseta GG", "Camiseta tamanho GG (corte masculino).", "GG", "Preta", false, 59.90, false},
		{"Kit Semcomp 29 - Babylook P", "Babylook tamanho P.", "P", "Preta", true, 59.90, true},
		{"Kit Semcomp 29 - Babylook M", "Babylook tamanho M.", "M", "Preta", true, 59.90, true},
		{"Kit Semcomp 29 - Babylook G", "Babylook tamanho G.", "G", "Preta", true, 59.90, true},
	}

	kitProducts := map[string]*product.Product{}
	for _, ks := range kitSpecs {
		p := product.Product{
			Type: product.ProductTypeKit, Name: ks.productName,
			IsSelling: ks.selling, Price: ks.price, Description: ks.desc,
		}
		createProduct(db, &p)
		if p.ID != 0 {
			detail := product.Kit{ID: p.ID, Name: "Camiseta Semcomp 29", Size: ks.size, Color: ks.color, IsBabylook: ks.babylook}
			db.Clauses(clause.OnConflict{DoNothing: true}).Create(&detail)
			kitProducts[ks.productName] = &p
		}
	}

	// ── Coffees ──────────────────────────────────────────────────────────────
	type coffeeSpec struct {
		productName string
		desc        string
		detailName  string
		dateTime    time.Time
		price       float64
	}

	coffeeSpecs := []coffeeSpec{
		{"Coffee - Dia 07/10 (manhã)", "Coffee break da manhã do segundo dia.", "Coffee Manhã 07/10", dt(2025, 10, 7, 9, 0), 15.00},
		{"Coffee - Dia 08/10 (manhã)", "Coffee break da manhã do terceiro dia.", "Coffee Manhã 08/10", dt(2025, 10, 8, 9, 0), 15.00},
		{"Coffee - Dia 09/10 (manhã)", "Coffee break da manhã do quarto dia.", "Coffee Manhã 09/10", dt(2025, 10, 9, 9, 0), 15.00},
		{"Coffee - Dia 10/10 (manhã)", "Coffee break da manhã do último dia.", "Coffee Manhã 10/10", dt(2025, 10, 10, 9, 0), 15.00},
		{"Coffee Noturno - Abertura", "Coffee especial servido após a cerimônia de abertura.", "Coffee Noturno 06/10", dt(2025, 10, 6, 21, 0), 20.00},
	}

	coffeeProducts := map[string]*product.Product{}
	for _, cs := range coffeeSpecs {
		p := product.Product{
			Type: product.ProductTypeCoffee, Name: cs.productName,
			IsSelling: true, Price: cs.price, Description: cs.desc,
		}
		createProduct(db, &p)
		if p.ID != 0 {
			detail := product.Coffee{ID: p.ID, Name: cs.detailName, DateTime: cs.dateTime}
			db.Clauses(clause.OnConflict{DoNothing: true}).Create(&detail)
			coffeeProducts[cs.productName] = &p
		}
	}

	// ── Combos ───────────────────────────────────────────────────────────────
	type comboSpec struct {
		name  string
		desc  string
		price float64
		items []struct {
			key string
			qty int
		}
	}

	kitM := kitProducts["Kit Semcomp 29 - Camiseta M"]
	kitBP := kitProducts["Kit Semcomp 29 - Babylook P"]
	kitBM := kitProducts["Kit Semcomp 29 - Babylook M"]
	coffee07 := coffeeProducts["Coffee - Dia 07/10 (manhã)"]
	coffee08 := coffeeProducts["Coffee - Dia 08/10 (manhã)"]
	coffee09 := coffeeProducts["Coffee - Dia 09/10 (manhã)"]
	coffeeAbertura := coffeeProducts["Coffee Noturno - Abertura"]

	// Combo 1: Kit M + Coffee manhã 07
	if kitM != nil && coffee07 != nil {
		combo := product.Product{
			Type: product.ProductTypeCombo, Name: "Combo Clássico (Kit M + Coffee 07/10)",
			IsSelling: true, Price: 69.90,
			Description: "Kit camiseta M + coffee da manhã do segundo dia com desconto.",
		}
		createProduct(db, &combo)
		if combo.ID != 0 {
			items := []product.ComboItem{
				{ComboID: combo.ID, ItemID: kitM.ID, Quantity: 1},
				{ComboID: combo.ID, ItemID: coffee07.ID, Quantity: 1},
			}
			db.Clauses(clause.OnConflict{DoNothing: true}).Create(&items)
		}
	}

	// Combo 2: Kit Babylook P + Coffee manhã 08
	if kitBP != nil && coffee08 != nil {
		combo := product.Product{
			Type: product.ProductTypeCombo, Name: "Combo Babylook (Babylook P + Coffee 08/10)",
			IsSelling: true, Price: 69.90,
			Description: "Kit babylook P + coffee da manhã do terceiro dia com desconto.",
		}
		createProduct(db, &combo)
		if combo.ID != 0 {
			items := []product.ComboItem{
				{ComboID: combo.ID, ItemID: kitBP.ID, Quantity: 1},
				{ComboID: combo.ID, ItemID: coffee08.ID, Quantity: 1},
			}
			db.Clauses(clause.OnConflict{DoNothing: true}).Create(&items)
		}
	}

	// Combo 3: Kit Babylook M + 2 coffees (08 e 09)
	if kitBM != nil && coffee08 != nil && coffee09 != nil {
		combo := product.Product{
			Type: product.ProductTypeCombo, Name: "Combo Full Week (Babylook M + 2 Coffees)",
			IsSelling: true, Price: 84.90,
			Description: "Kit babylook M + coffee de dois dias com desconto especial.",
		}
		createProduct(db, &combo)
		if combo.ID != 0 {
			items := []product.ComboItem{
				{ComboID: combo.ID, ItemID: kitBM.ID, Quantity: 1},
				{ComboID: combo.ID, ItemID: coffee08.ID, Quantity: 1},
				{ComboID: combo.ID, ItemID: coffee09.ID, Quantity: 1},
			}
			db.Clauses(clause.OnConflict{DoNothing: true}).Create(&items)
		}
	}

	// Combo 4: Coffee abertura + Coffee 07 (sem kit, apenas coffees)
	if coffeeAbertura != nil && coffee07 != nil {
		combo := product.Product{
			Type: product.ProductTypeCombo, Name: "Combo Café (Abertura + Manhã 07/10)",
			IsSelling: true, Price: 29.90,
			Description: "Coffee noturno da abertura + coffee da manhã do segundo dia.",
		}
		createProduct(db, &combo)
		if combo.ID != 0 {
			items := []product.ComboItem{
				{ComboID: combo.ID, ItemID: coffeeAbertura.ID, Quantity: 1},
				{ComboID: combo.ID, ItemID: coffee07.ID, Quantity: 1},
			}
			db.Clauses(clause.OnConflict{DoNothing: true}).Create(&items)
		}
	}

	log.Println("[products] Produtos inseridos/verificados.")
}

func createProduct(db *gorm.DB, p *product.Product) {
	result := db.Where(product.Product{Name: p.Name, Type: p.Type}).FirstOrCreate(p)
	if result.Error != nil {
		log.Printf("[products] Erro ao inserir '%s': %v", p.Name, result.Error)
	}
}

// ─── Avisos ────────────────────────────────────────────────────────────────────

func seedNotices(db *gorm.DB) {
	log.Println("[notices] Inserindo avisos de exemplo...")

	notices := []notice.Notice{
		{
			Title:    "Bem-vindos à Semcomp 29!",
			Content:  "Este é o portal oficial da 29ª edição da Semana da Computação do ICMC-USP. Fique atento ao cronograma e aproveite todos os eventos!",
			DateTime: dt(2025, 10, 1, 9, 0),
		},
		{
			Title:    "Credenciamento aberto",
			Content:  "O credenciamento está aberto no Hall do ICMC das 08h às 18h de segunda a sexta durante a semana do evento. Apresente seu QR code de inscrição.",
			DateTime: dt(2025, 10, 6, 8, 0),
		},
		{
			Title:    "Loja online disponível",
			Content:  "A loja online está aberta! Adquira seu kit, babylook e coffee antes que esgotem. Os combos têm desconto especial.",
			DateTime: dt(2025, 10, 5, 12, 0),
		},
		{
			Title:    "Vagas limitadas - Minicursos",
			Content:  "Os minicursos de Go e Machine Learning têm vagas limitadas. Garanta a sua inscrição pelo portal o quanto antes!",
			DateTime: dt(2025, 10, 4, 10, 0),
		},
		{
			Title:    "Regras do Jogo de Riddles",
			Content:  "O jogo de riddles começa na abertura. Forme sua equipe de até 5 pessoas, crie um time pelo portal e resolva os riddles em ordem. A equipe que resolver todos primeiro ganha!",
			DateTime: dt(2025, 10, 3, 15, 0),
		},
		{
			Title:    "Certificados de participação",
			Content:  "Certificados serão emitidos digitalmente após o evento para participantes com taxa de presença ≥ 75%. Acompanhe sua presença pelo portal.",
			DateTime: dt(2025, 10, 2, 11, 0),
		},
		{
			Title:    "Resultado do Concurso de Programação",
			Content:  "Parabéns aos finalistas do Concurso de Programação! Os resultados serão anunciados na cerimônia de encerramento na sexta-feira às 19h.",
			DateTime: dt(2025, 10, 9, 19, 0),
		},
	}

	for i := range notices {
		result := db.Where(notice.Notice{Title: notices[i].Title}).FirstOrCreate(&notices[i])
		if result.Error != nil {
			log.Printf("[notices] Erro ao inserir '%s': %v", notices[i].Title, result.Error)
		}
	}
	log.Printf("[notices] %d avisos inseridos/verificados.", len(notices))
}

// ─── Riddles ───────────────────────────────────────────────────────────────────

func seedRiddles(db *gorm.DB) {
	log.Println("[riddles] Inserindo riddles de exemplo...")

	riddles := []riddle.Riddle{
		{
			Hint1:    "Sou um lugar cheio de livros mas ninguém fala alto.",
			Hint2:    "Você me encontra no campus, entre os estudantes.",
			Answer:   "biblioteca",
			ImageURL: "",
			IsActive: true,
		},
		{
			Hint1:    "Processo dados sem descanso, mas não sou humano.",
			Hint2:    "Sem mim, não há software.",
			Answer:   "computador",
			ImageURL: "",
			IsActive: true,
		},
		{
			Hint1:    "Sou invisível mas estou em todo lugar onde há conexão.",
			Hint2:    "Sem fio, conecto o mundo.",
			Answer:   "wifi",
			ImageURL: "",
			IsActive: true,
		},
		{
			Hint1:    "Resolvo problemas passo a passo.",
			Hint2:    "Sou a alma de qualquer programa.",
			Answer:   "algoritmo",
			ImageURL: "",
			IsActive: true,
		},
		{
			Hint1:    "Leio código e o transformo em linguagem que a máquina entende.",
			Hint2:    "Sou o tradutor entre o programador e o processador.",
			Answer:   "compilador",
			ImageURL: "",
			IsActive: true,
		},
		{
			Hint1:    "Guardo informações de forma organizada e estruturada.",
			Hint2:    "Tabelas, linhas e colunas são minha morada.",
			Answer:   "banco de dados",
			ImageURL: "",
			IsActive: true,
		},
		{
			Hint1:    "Para me entender, você precisa primeiro me entender.",
			Hint2:    "Funções que chamam a si mesmas conhecem meu nome.",
			Answer:   "recursão",
			ImageURL: "",
			IsActive: true,
		},
		{
			Hint1:    "Sou um ponto de salvamento na história do seu projeto.",
			Hint2:    "Sem mim, git log não teria nada para mostrar.",
			Answer:   "commit",
			ImageURL: "",
			IsActive: true,
		},
		{
			Hint1:    "Alguns me temem, outros não conseguem viver sem mim.",
			Hint2:    "Digitar comandos é a minha especialidade.",
			Answer:   "terminal",
			ImageURL: "",
			IsActive: true,
		},
		{
			Hint1:    "Guardo dados temporariamente para te poupar tempo.",
			Hint2:    "Entre o processador e a memória RAM, eu existo.",
			Answer:   "cache",
			ImageURL: "",
			IsActive: true,
		},
		{
			Hint1:    "Sou pequeno, mas guardo todo o seu trabalho.",
			Hint2:    "Me insira numa porta USB.",
			Answer:   "pendrive",
			ImageURL: "",
			IsActive: false,
		},
		{
			Hint1:    "Garanto que apenas uma thread por vez entre no quarto.",
			Hint2:    "Concorrência sem mim vira caos.",
			Answer:   "mutex",
			ImageURL: "",
			IsActive: false,
		},
	}

	inserted := 0
	for i := range riddles {
		result := db.Where(riddle.Riddle{Hint1: riddles[i].Hint1}).FirstOrCreate(&riddles[i])
		if result.Error != nil {
			log.Printf("[riddles] Erro ao inserir riddle %d: %v", i+1, result.Error)
			continue
		}
		if result.RowsAffected > 0 {
			inserted++
		}
	}
	log.Printf("[riddles] %d/%d riddles inseridos/verificados.", inserted, len(riddles))
}

func init() {
	fmt.Println("Seed: carregando configurações do .env...")
}
