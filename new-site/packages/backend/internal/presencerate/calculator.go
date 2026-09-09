package presencerate

import (
	"math"
	"time"

	"backend/internal/event"
	"backend/internal/presence"
	"backend/internal/presencesettings"
	"backend/internal/user"

	"gorm.io/gorm"
)

type ComputeInput struct {
	Events         []event.Event
	Presences      []presence.Presence
	Weights        map[uint]float64
	JustifiedUsers map[int64]bool
}

// Compute calcula a taxa de presença (0–100, com 2 casas decimais) de cada
// usuário que possui presença registrada.
//
// Regras:
//   - Um evento é "contável" quando seu PresenceTypeID está configurado em Weights
//     e HasAttendance é true.
//   - Denominador = soma dos pesos de todos os eventos contáveis.
//   - Presença direta em um evento contável credita o próprio peso.
//   - Presença em um evento NÃO contável credita todos os eventos contáveis
//     concomitantes (interseção parcial de horário).
//   - Cada evento contável credita no máximo uma vez por usuário (união).
//   - Evento sem nenhum contável concomitante não vale presença.
func Compute(input ComputeInput) map[int64]float64 {
	countable := make(map[int]float64)
	denominator := 0.0

	for i, e := range input.Events {
		if e.PresenceTypeID == nil || !e.HasAttendance {
			continue
		}
		w, ok := input.Weights[*e.PresenceTypeID]
		if !ok {
			continue
		}
		countable[i] = w
		denominator += w
	}

	eventIndex := make(map[string]int, len(input.Events))
	for i, e := range input.Events {
		eventIndex[eventKey(e.Name, e.InitDate)] = i
	}

	credits := make(map[int64]map[int]bool)

	for _, p := range input.Presences {
		idx, ok := eventIndex[eventKey(p.EventName, p.EventInitDate)]
		if !ok {
			continue
		}
		userCredits, seen := credits[p.UserNumber]
		if !seen {
			userCredits = make(map[int]bool)
			credits[p.UserNumber] = userCredits
		}

		if _, isCountable := countable[idx]; isCountable {
			userCredits[idx] = true
			continue
		}

		attended := input.Events[idx]
		for j := range countable {
			if overlaps(attended, input.Events[j]) {
				userCredits[j] = true
			}
		}
	}

	rates := make(map[int64]float64, len(credits))
	if denominator <= 0 {
		return rates
	}

	for userNumber, userCredits := range credits {
		sum := 0.0
		for idx := range userCredits {
			sum += countable[idx]
		}
		rates[userNumber] = math.Round((sum/denominator)*100*100) / 100
	}

	// Usuários com justificativa de ausência aprovada recebem 100%
	// independentemente das presenças registradas.
	for userNumber := range input.JustifiedUsers {
		rates[userNumber] = 100.0
	}

	return rates
}

func eventKey(name string, initDate time.Time) string {
	return name + "\x00" + initDate.Format(time.RFC3339Nano)
}

func overlaps(a, b event.Event) bool {
	return a.InitDate.Before(b.EndDate) && b.InitDate.Before(a.EndDate)
}

type Calculator struct {
	db *gorm.DB
}

func NewCalculator(db *gorm.DB) *Calculator {
	return &Calculator{db: db}
}

// RecalculateUsers recalcula a taxa dos usuários informados. Sem argumentos,
// não faz nada.
func (c *Calculator) RecalculateUsers(userNumbers ...int64) error {
	if c == nil || c.db == nil || len(userNumbers) == 0 {
		return nil
	}

	input, err := c.loadInput()
	if err != nil {
		return err
	}

	var presences []presence.Presence
	if err := c.db.Where("user_number IN ?", userNumbers).Find(&presences).Error; err != nil {
		return err
	}
	input.Presences = presences

	// Filtrar justificativas apenas para os usuários solicitados
	filtered := make(map[int64]bool)
	for _, n := range userNumbers {
		if input.JustifiedUsers[n] {
			filtered[n] = true
		}
	}
	input.JustifiedUsers = filtered

	rates := Compute(input)

	return c.persist(userNumbers, rates)
}

// RecalculateAll recalcula a taxa de todos os usuários do sistema.
func (c *Calculator) RecalculateAll() error {
	if c == nil || c.db == nil {
		return nil
	}

	input, err := c.loadInput()
	if err != nil {
		return err
	}

	var allNumbers []int64
	if err := c.db.Model(&presence.Presence{}).
		Distinct().
		Pluck("user_number", &allNumbers).Error; err != nil {
		return err
	}

	var userNumbers []int64
	if err := c.db.Model(&user.User{}).Pluck("user_number", &userNumbers).Error; err != nil {
		return err
	}

	targets := make(map[int64]bool, len(userNumbers))
	for _, n := range userNumbers {
		targets[n] = true
	}
	for _, n := range allNumbers {
		targets[n] = true
	}
	// Incluir usuários justificados nos targets de recálculo
	for n := range input.JustifiedUsers {
		targets[n] = true
	}

	var presences []presence.Presence
	if err := c.db.Find(&presences).Error; err != nil {
		return err
	}
	input.Presences = presences

	rates := Compute(input)

	numbers := make([]int64, 0, len(targets))
	for n := range targets {
		numbers = append(numbers, n)
	}

	return c.persist(numbers, rates)
}

func (c *Calculator) loadInput() (ComputeInput, error) {
	var weights []presencesettings.PresenceTypeWeight
	if err := c.db.Find(&weights).Error; err != nil {
		return ComputeInput{}, err
	}

	weightMap := make(map[uint]float64, len(weights))
	for _, w := range weights {
		weightMap[w.ID] = w.Weight
	}

	var events []event.Event
	if err := c.db.Find(&events).Error; err != nil {
		return ComputeInput{}, err
	}

	// Justificativas de ausência aprovadas: buscar user_numbers via JOIN
	type justifiedRow struct{ UserNumber int64 }
	var justified []justifiedRow
	if err := c.db.Raw(
		`SELECT u.user_number FROM absence_justifications aj
		 JOIN users u ON u.email = aj.user_email
		 WHERE aj.status = 'aprovado'`,
	).Scan(&justified).Error; err != nil {
		return ComputeInput{}, err
	}
	justifiedMap := make(map[int64]bool, len(justified))
	for _, j := range justified {
		justifiedMap[j.UserNumber] = true
	}

	return ComputeInput{Events: events, Weights: weightMap, JustifiedUsers: justifiedMap}, nil
}

func (c *Calculator) persist(userNumbers []int64, rates map[int64]float64) error {
	return c.db.Transaction(func(tx *gorm.DB) error {
		for _, n := range userNumbers {
			rate := rates[n]
			if err := tx.Model(&user.User{}).
				Where("user_number = ?", n).
				Update("presence_rate", rate).Error; err != nil {
				return err
			}
		}
		return nil
	})
}
