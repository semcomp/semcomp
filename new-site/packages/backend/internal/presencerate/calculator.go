package presencerate

import (
	"math"
	"strings"
	"time"

	"backend/internal/event"
	"backend/internal/presence"
	"backend/internal/presencesettings"
	"backend/internal/user"

	"gorm.io/gorm"
)

// NormalizeTypeName padroniza o nome de um tipo de evento para comparação
// (minúsculas, sem espaços nas bordas).
func NormalizeTypeName(typeName string) string {
	return strings.ToLower(strings.TrimSpace(typeName))
}

type ComputeInput struct {
	Events    []event.Event
	Presences []presence.Presence
	Weights   map[string]float64
}

// Compute calcula a taxa de presença (0–100, com 2 casas decimais) de cada
// usuário que possui presença registrada.
//
// Regras:
//   - Um evento é "contável" quando seu tipo está configurado em Weights e
//     HasAttendance é true.
//   - Denominador = soma dos pesos de todos os eventos contáveis.
//   - Presença direta em um evento contável credita o próprio peso.
//   - Presença em um evento NÃO contável credita todos os eventos contáveis
//     concomitantes (interseção parcial de horário). Ex.: minicurso herda a
//     palestra e a vitrine que ocorrem durante ele.
//   - Cada evento contável credita no máximo uma vez por usuário (união).
//   - Evento sem nenhum contável concomitante não vale presença.
func Compute(input ComputeInput) map[int64]float64 {
	countable := make(map[int]float64)
	denominator := 0.0

	for i, e := range input.Events {
		w, ok := input.Weights[NormalizeTypeName(e.Type)]
		if !ok || !e.HasAttendance {
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

	weightMap := make(map[string]float64, len(weights))
	for _, w := range weights {
		weightMap[NormalizeTypeName(w.TypeName)] = w.Weight
	}

	var events []event.Event
	if err := c.db.Find(&events).Error; err != nil {
		return ComputeInput{}, err
	}

	return ComputeInput{Events: events, Weights: weightMap}, nil
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
