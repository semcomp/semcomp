package presencerate

import (
	"testing"
	"time"

	"backend/internal/event"
	"backend/internal/presence"
)

func at(hour, min int) time.Time {
	return time.Date(2026, 9, 14, hour, min, 0, 0, time.UTC)
}

var typeIDs = map[string]uint{
	"palestra":  1,
	"vitrine":   2,
	"minicurso": 3,
	"oficina":   4,
	"workshop":  5,
}

func makeEvent(name, typeName string, initHour, initMin, endHour, endMin int, hasAttendance bool) event.Event {
	id := typeIDs[typeName]
	return event.Event{
		Name:           name,
		InitDate:       at(initHour, initMin),
		EndDate:        at(endHour, endMin),
		PresenceTypeID: &id,
		HasAttendance:  hasAttendance,
	}
}

func defaultWeights() map[uint]float64 {
	return map[uint]float64{
		1: 1.0,
		2: 0.5,
	}
}

func assertRate(t *testing.T, rates map[int64]float64, userNumber int64, expected float64) {
	t.Helper()
	got, ok := rates[userNumber]
	if !ok {
		t.Fatalf("esperava taxa para usuário %d, recebeu nada", userNumber)
	}
	if got != expected {
		t.Errorf("usuário %d: esperava %v, recebeu %v", userNumber, expected, got)
	}
}

func TestCompute_BasicWeights(t *testing.T) {
	events := []event.Event{
		makeEvent("Palestra A", "palestra", 9, 0, 10, 30, true),
		makeEvent("Palestra B", "palestra", 14, 0, 15, 30, true),
		makeEvent("Vitrine X", "vitrine", 10, 0, 11, 0, true),
	}
	presences := []presence.Presence{
		{UserNumber: 1, EventName: "Palestra A", EventInitDate: at(9, 0)},
		{UserNumber: 2, EventName: "Vitrine X", EventInitDate: at(10, 0)},
		{UserNumber: 3, EventName: "Palestra B", EventInitDate: at(14, 0)},
	}

	rates := Compute(ComputeInput{Events: events, Presences: presences, Weights: defaultWeights()})

	assertRate(t, rates, 1, 40.0)
	assertRate(t, rates, 2, 20.0)
	assertRate(t, rates, 3, 40.0)
}

func TestCompute_MinicursoHerdaPalestraEVitrine(t *testing.T) {
	events := []event.Event{
		makeEvent("Minicurso Go", "minicurso", 9, 0, 12, 0, true),
		makeEvent("Palestra Interna", "palestra", 10, 0, 11, 0, true),
		makeEvent("Vitrine Empresas", "vitrine", 11, 0, 11, 30, true),
	}
	presences := []presence.Presence{
		{UserNumber: 1, EventName: "Minicurso Go", EventInitDate: at(9, 0)},
		{UserNumber: 2, EventName: "Palestra Interna", EventInitDate: at(10, 0)},
	}

	rates := Compute(ComputeInput{Events: events, Presences: presences, Weights: defaultWeights()})

	assertRate(t, rates, 1, 100.0)
	assertRate(t, rates, 2, 66.67)
}

func TestCompute_DedupeUniaoDiretaEConcomitancia(t *testing.T) {
	events := []event.Event{
		makeEvent("Minicurso Go", "minicurso", 9, 0, 12, 0, true),
		makeEvent("Palestra Interna", "palestra", 10, 0, 11, 0, true),
		makeEvent("Vitrine Empresas", "vitrine", 11, 0, 11, 30, true),
	}
	presences := []presence.Presence{
		{UserNumber: 1, EventName: "Minicurso Go", EventInitDate: at(9, 0)},
		{UserNumber: 1, EventName: "Palestra Interna", EventInitDate: at(10, 0)},
	}

	rates := Compute(ComputeInput{Events: events, Presences: presences, Weights: defaultWeights()})

	assertRate(t, rates, 1, 100.0)
}

func TestCompute_EventoIsoladoValeZero(t *testing.T) {
	events := []event.Event{
		makeEvent("Workshop Isolado", "workshop", 13, 0, 17, 0, true),
		makeEvent("Palestra Tarde", "palestra", 18, 0, 19, 0, true),
	}
	presences := []presence.Presence{
		{UserNumber: 1, EventName: "Workshop Isolado", EventInitDate: at(13, 0)},
		{UserNumber: 2, EventName: "Palestra Tarde", EventInitDate: at(18, 0)},
	}

	rates := Compute(ComputeInput{Events: events, Presences: presences, Weights: defaultWeights()})

	if rate, ok := rates[1]; ok && rate != 0 {
		t.Errorf("usuário sem crédito contável não deveria aparecer com taxa > 0, recebeu %v", rate)
	}
	assertRate(t, rates, 2, 100.0)
}

func TestCompute_DenominadorSomenteHasAttendance(t *testing.T) {
	events := []event.Event{
		makeEvent("Palestra Com Chamada", "palestra", 9, 0, 10, 0, true),
		makeEvent("Palestra Sem Chamada", "palestra", 11, 0, 12, 0, false),
	}
	presences := []presence.Presence{
		{UserNumber: 1, EventName: "Palestra Com Chamada", EventInitDate: at(9, 0)},
	}

	rates := Compute(ComputeInput{Events: events, Presences: presences, Weights: defaultWeights()})

	assertRate(t, rates, 1, 100.0)
}

func TestCompute_OverlapParcialEBordas(t *testing.T) {
	events := []event.Event{
		makeEvent("Oficina Corta Palestra", "oficina", 9, 30, 10, 30, true),
		makeEvent("Palestra Manha", "palestra", 10, 0, 11, 0, true),
		makeEvent("Oficina Encosta", "oficina", 8, 0, 9, 0, true),
		makeEvent("Palestra Tarde", "palestra", 14, 0, 15, 0, true),
	}
	presences := []presence.Presence{
		{UserNumber: 1, EventName: "Oficina Corta Palestra", EventInitDate: at(9, 30)},
		{UserNumber: 2, EventName: "Oficina Encosta", EventInitDate: at(8, 0)},
	}

	rates := Compute(ComputeInput{Events: events, Presences: presences, Weights: defaultWeights()})

	assertRate(t, rates, 1, 50.0)

	if rate, ok := rates[2]; ok && rate != 0 {
		t.Errorf("eventos que só se encostam no fim/início não são concomitantes; taxa = %v", rate)
	}
}

func TestCompute_DenominadorZero(t *testing.T) {
	events := []event.Event{
		makeEvent("Workshop Solto", "workshop", 9, 0, 10, 0, true),
	}
	presences := []presence.Presence{
		{UserNumber: 1, EventName: "Workshop Solto", EventInitDate: at(9, 0)},
	}

	rates := Compute(ComputeInput{Events: events, Presences: presences, Weights: defaultWeights()})

	if len(rates) != 0 {
		t.Errorf("sem palestras/vitrines válidas ninguém deve ter taxa, recebeu %v", rates)
	}
}

func TestCompute_PresencaOrfaIgnorada(t *testing.T) {
	events := []event.Event{
		makeEvent("Palestra Unica", "palestra", 9, 0, 10, 0, true),
	}
	presences := []presence.Presence{
		{UserNumber: 1, EventName: "Evento Removido", EventInitDate: at(9, 0), EmailAdmin: "a@b.com"},
		{UserNumber: 1, EventName: "Palestra Unica", EventInitDate: at(9, 0)},
	}

	rates := Compute(ComputeInput{Events: events, Presences: presences, Weights: defaultWeights()})

	assertRate(t, rates, 1, 100.0)
}

func TestCompute_SemPresencas(t *testing.T) {
	events := []event.Event{
		makeEvent("Palestra Unica", "palestra", 9, 0, 10, 0, true),
	}

	rates := Compute(ComputeInput{Events: events, Presences: nil, Weights: defaultWeights()})

	if len(rates) != 0 {
		t.Errorf("esperava mapa vazio, recebeu %v", rates)
	}
}

func TestCompute_NilPresenceTypeIDIgnorado(t *testing.T) {
	id := typeIDs["palestra"]
	events := []event.Event{
		{Name: "Sem Tipo", InitDate: at(9, 0), EndDate: at(10, 0), PresenceTypeID: nil, HasAttendance: true},
		{Name: "Com Tipo", InitDate: at(14, 0), EndDate: at(15, 0), PresenceTypeID: &id, HasAttendance: true},
	}
	presences := []presence.Presence{
		{UserNumber: 1, EventName: "Sem Tipo", EventInitDate: at(9, 0)},
		{UserNumber: 2, EventName: "Com Tipo", EventInitDate: at(14, 0)},
	}

	rates := Compute(ComputeInput{Events: events, Presences: presences, Weights: defaultWeights()})

	if rate, ok := rates[1]; ok && rate != 0 {
		t.Errorf("evento sem PresenceTypeID não deveria ter taxa > 0, recebeu %v", rate)
	}
	assertRate(t, rates, 2, 100.0)
}

func TestCompute_JustifiedUserGets100(t *testing.T) {
	events := []event.Event{
		makeEvent("Palestra A", "palestra", 9, 0, 10, 30, true),
		makeEvent("Palestra B", "palestra", 14, 0, 15, 30, true),
		makeEvent("Vitrine X", "vitrine", 10, 0, 11, 0, true),
	}
	// Usuário 1 não tem nenhuma presença mas está justificado
	presences := []presence.Presence{
		{UserNumber: 2, EventName: "Palestra A", EventInitDate: at(9, 0)},
	}

	rates := Compute(ComputeInput{
		Events:         events,
		Presences:      presences,
		Weights:        defaultWeights(),
		JustifiedUsers: map[int64]bool{1: true},
	})

	assertRate(t, rates, 1, 100.0)
	assertRate(t, rates, 2, 40.0)
}

func TestCompute_JustifiedUserWithPresences(t *testing.T) {
	events := []event.Event{
		makeEvent("Palestra A", "palestra", 9, 0, 10, 30, true),
		makeEvent("Palestra B", "palestra", 14, 0, 15, 30, true),
		makeEvent("Vitrine X", "vitrine", 10, 0, 11, 0, true),
	}
	// Usuário 1 tem presença parcial (40%) mas está justificado -> 100%
	presences := []presence.Presence{
		{UserNumber: 1, EventName: "Palestra A", EventInitDate: at(9, 0)},
	}

	rates := Compute(ComputeInput{
		Events:         events,
		Presences:      presences,
		Weights:        defaultWeights(),
		JustifiedUsers: map[int64]bool{1: true},
	})

	assertRate(t, rates, 1, 100.0)
}

func TestCompute_JustifiedUserDenominatorZero(t *testing.T) {
	// Sem eventos contáveis -> denominador = 0 -> mapa vazio mesmo justificado
	events := []event.Event{
		makeEvent("Workshop Solto", "workshop", 9, 0, 10, 0, true),
	}

	rates := Compute(ComputeInput{
		Events:         events,
		Presences:      nil,
		Weights:        defaultWeights(),
		JustifiedUsers: map[int64]bool{1: true},
	})

	if len(rates) != 0 {
		t.Errorf("sem denominador, ninguém deve ter taxa, recebeu %v", rates)
	}
}
