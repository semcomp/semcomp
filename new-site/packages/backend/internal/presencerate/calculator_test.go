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

func makeEvent(name, typeName string, initHour, initMin, endHour, endMin int, hasAttendance bool) event.Event {
	return event.Event{
		Name:          name,
		InitDate:      at(initHour, initMin),
		EndDate:       at(endHour, endMin),
		Type:          typeName,
		HasAttendance: hasAttendance,
	}
}

func defaultWeights() map[string]float64 {
	return map[string]float64{
		"palestra": 1.0,
		"vitrine":  0.5,
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
		makeEvent("Palestra A", "Palestra", 9, 0, 10, 30, true),
		makeEvent("Palestra B", "Palestra", 14, 0, 15, 30, true),
		makeEvent("Vitrine X", "Vitrine", 10, 0, 11, 0, true),
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
		makeEvent("Minicurso Go", "Minicurso", 9, 0, 12, 0, true),
		makeEvent("Palestra Interna", "Palestra", 10, 0, 11, 0, true),
		makeEvent("Vitrine Empresas", "Vitrine", 11, 0, 11, 30, true),
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
		makeEvent("Minicurso Go", "Minicurso", 9, 0, 12, 0, true),
		makeEvent("Palestra Interna", "Palestra", 10, 0, 11, 0, true),
		makeEvent("Vitrine Empresas", "Vitrine", 11, 0, 11, 30, true),
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
		makeEvent("Workshop Isolado", "Workshop", 13, 0, 17, 0, true),
		makeEvent("Palestra Tarde", "Palestra", 18, 0, 19, 0, true),
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
		makeEvent("Palestra Com Chamada", "Palestra", 9, 0, 10, 0, true),
		makeEvent("Palestra Sem Chamada", "Palestra", 11, 0, 12, 0, false),
	}
	presences := []presence.Presence{
		{UserNumber: 1, EventName: "Palestra Com Chamada", EventInitDate: at(9, 0)},
	}

	rates := Compute(ComputeInput{Events: events, Presences: presences, Weights: defaultWeights()})

	assertRate(t, rates, 1, 100.0)
}

func TestCompute_OverlapParcialEBordas(t *testing.T) {
	events := []event.Event{
		makeEvent("Oficina Corta Palestra", "Oficina", 9, 30, 10, 30, true),
		makeEvent("Palestra Manha", "Palestra", 10, 0, 11, 0, true),
		makeEvent("Oficina Encosta", "Oficina", 8, 0, 9, 0, true),
		makeEvent("Palestra Tarde", "Palestra", 14, 0, 15, 0, true),
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
		makeEvent("Workshop Solto", "Workshop", 9, 0, 10, 0, true),
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
		makeEvent("Palestra Unica", "Palestra", 9, 0, 10, 0, true),
	}
	presences := []presence.Presence{
		{UserNumber: 1, EventName: "Evento Removido", EventInitDate: at(9, 0), EmailAdmin: "a@b.com"},
		{UserNumber: 1, EventName: "Palestra Unica", EventInitDate: at(9, 0)},
	}

	rates := Compute(ComputeInput{Events: events, Presences: presences, Weights: defaultWeights()})

	assertRate(t, rates, 1, 100.0)
}

func TestNormalizeTypeName_MatchCaseInsensitive(t *testing.T) {
	events := []event.Event{
		makeEvent("Palestra Espacada", "  PALESTRA  ", 9, 0, 10, 0, true),
	}
	presences := []presence.Presence{
		{UserNumber: 1, EventName: "Palestra Espacada", EventInitDate: at(9, 0)},
	}

	rates := Compute(ComputeInput{Events: events, Presences: presences, Weights: map[string]float64{"palestra": 1.0}})

	assertRate(t, rates, 1, 100.0)
}

func TestCompute_SemPresencas(t *testing.T) {
	events := []event.Event{
		makeEvent("Palestra Unica", "Palestra", 9, 0, 10, 0, true),
	}

	rates := Compute(ComputeInput{Events: events, Presences: nil, Weights: defaultWeights()})

	if len(rates) != 0 {
		t.Errorf("esperava mapa vazio, recebeu %v", rates)
	}
}
