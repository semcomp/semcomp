package riddle

import (
	"errors"
	"testing"
	"time"

	"backend/internal/apierrors"
)

// mockRiddleRepository implementa RiddleRepository com funções injetáveis.
// Os testes de ranking só precisam de ListActiveRiddleIDs e ListTeamsWithMembers;
// os demais métodos existem apenas para satisfazer a interface e entram em
// pânico se forem chamados por engano.
type mockRiddleRepository struct {
	ListActiveRiddleIDsFunc  func() ([]uint, error)
	ListTeamsWithMembersFunc func() ([]Team, error)
}

func (m *mockRiddleRepository) Create(*Riddle) error          { panic("não usado") }
func (m *mockRiddleRepository) GetByID(uint) (*Riddle, error) { panic("não usado") }
func (m *mockRiddleRepository) Update(uint, *Riddle) error    { panic("não usado") }
func (m *mockRiddleRepository) SoftDelete(uint) error         { panic("não usado") }
func (m *mockRiddleRepository) GetRiddles(RiddleListQuery) (*RiddleListResult, error) {
	panic("não usado")
}
func (m *mockRiddleRepository) ReplaceAll([]*Riddle) ([]Riddle, error) { panic("não usado") }
func (m *mockRiddleRepository) GetNextActiveRiddle(uint) (*Riddle, error) {
	panic("não usado")
}
func (m *mockRiddleRepository) CreateTeam(string, string, uint) (*Team, error) {
	panic("não usado")
}
func (m *mockRiddleRepository) GetTeamByUserNumber(uint) (*Team, error) { panic("não usado") }
func (m *mockRiddleRepository) GetTeamByCode(string) (*Team, error)     { panic("não usado") }
func (m *mockRiddleRepository) AddMember(uint, uint) error              { panic("não usado") }
func (m *mockRiddleRepository) AdvanceRiddle(uint, uint, uint) (bool, error) {
	panic("não usado")
}
func (m *mockRiddleRepository) SetFinished(uint) error             { panic("não usado") }
func (m *mockRiddleRepository) HasTeamsInProgress() (bool, error)  { panic("não usado") }
func (m *mockRiddleRepository) CountActiveRiddles() (int64, error) { panic("não usado") }

func (m *mockRiddleRepository) ListActiveRiddleIDs() ([]uint, error) {
	return m.ListActiveRiddleIDsFunc()
}

func (m *mockRiddleRepository) ListTeamsWithMembers() ([]Team, error) {
	return m.ListTeamsWithMembersFunc()
}

// garante em tempo de compilação que o mock cobre a interface inteira
var _ RiddleRepository = (*mockRiddleRepository)(nil)

func assertAPIError(t *testing.T, err error, expectedCode string) {
	t.Helper()
	var apiErr *apierrors.APIError
	if !errors.As(err, &apiErr) {
		t.Fatalf("esperava *apierrors.APIError, got %T: %v", err, err)
	}
	if apiErr.Code != expectedCode {
		t.Errorf("esperava code=%q, got %q", expectedCode, apiErr.Code)
	}
}

// rankingService monta um service com o mock já configurado para o ranking.
func rankingService(activeIDs []uint, teams []Team) RiddleService {
	repo := &mockRiddleRepository{
		ListActiveRiddleIDsFunc:  func() ([]uint, error) { return activeIDs, nil },
		ListTeamsWithMembersFunc: func() ([]Team, error) { return teams, nil },
	}
	return NewRiddleService(repo)
}

// sequentialIDs monta uma fila de riddles ativos sem buracos: 1..n. Os testes
// que não são sobre soft delete usam isso para o índice bater com a contagem.
func sequentialIDs(n int) []uint {
	ids := make([]uint, 0, n)
	for i := 1; i <= n; i++ {
		ids = append(ids, uint(i))
	}
	return ids
}

// assertOrder confere nome + posição de cada linha, na ordem esperada.
func assertOrder(t *testing.T, entries []TeamRankingEntry, expectedNames []string) {
	t.Helper()
	if len(entries) != len(expectedNames) {
		t.Fatalf("esperava %d equipes, got %d", len(expectedNames), len(entries))
	}
	for i, name := range expectedNames {
		if entries[i].Name != name {
			t.Errorf("posição %d: esperava %q, got %q", i+1, name, entries[i].Name)
		}
		if entries[i].Position != i+1 {
			t.Errorf("equipe %q: esperava Position=%d, got %d", name, i+1, entries[i].Position)
		}
	}
}

func ptrTime(t time.Time) *time.Time { return &t }

// --- GetTeamsRanking: ordenação ---

// Regra 1 + 2: quem terminou vem antes de quem está em andamento, mesmo que a
// equipe em andamento tenha índice maior que o momento de conclusão sugeriria.
func TestGetTeamsRanking_FinishedBeforeInProgress(t *testing.T) {
	base := time.Date(2026, 9, 9, 12, 0, 0, 0, time.UTC)
	teams := []Team{
		{ID: 1, Name: "Em andamento", CurrentRiddleIndex: 9},
		{ID: 2, Name: "Terminou", CurrentRiddleIndex: 3, FinishedAt: ptrTime(base)},
	}

	ranking, err := rankingService(sequentialIDs(10), teams).GetTeamsRanking()
	if err != nil {
		t.Fatalf("esperava nil, got %v", err)
	}

	assertOrder(t, ranking.Teams, []string{"Terminou", "Em andamento"})
	if !ranking.Teams[0].Finished {
		t.Error("esperava Finished=true na equipe que concluiu")
	}
	if ranking.Teams[1].Finished {
		t.Error("esperava Finished=false na equipe em andamento")
	}
}

// Regra 1: entre as equipes que terminaram, FinishedAt crescente.
func TestGetTeamsRanking_FinishedOrderedByFinishedAtAsc(t *testing.T) {
	base := time.Date(2026, 9, 9, 12, 0, 0, 0, time.UTC)
	teams := []Team{
		{ID: 1, Name: "Terceira", CurrentRiddleIndex: 10, FinishedAt: ptrTime(base.Add(2 * time.Hour))},
		{ID: 2, Name: "Primeira", CurrentRiddleIndex: 10, FinishedAt: ptrTime(base)},
		{ID: 3, Name: "Segunda", CurrentRiddleIndex: 10, FinishedAt: ptrTime(base.Add(time.Hour))},
	}

	ranking, err := rankingService(sequentialIDs(10), teams).GetTeamsRanking()
	if err != nil {
		t.Fatalf("esperava nil, got %v", err)
	}

	assertOrder(t, ranking.Teams, []string{"Primeira", "Segunda", "Terceira"})
}

// Regra 2: entre as equipes em andamento, CurrentRiddleIndex decrescente.
func TestGetTeamsRanking_InProgressOrderedByIndexDesc(t *testing.T) {
	teams := []Team{
		{ID: 1, Name: "Lenta", CurrentRiddleIndex: 1},
		{ID: 2, Name: "Rápida", CurrentRiddleIndex: 7},
		{ID: 3, Name: "Média", CurrentRiddleIndex: 4},
	}

	ranking, err := rankingService(sequentialIDs(10), teams).GetTeamsRanking()
	if err != nil {
		t.Fatalf("esperava nil, got %v", err)
	}

	assertOrder(t, ranking.Teams, []string{"Rápida", "Média", "Lenta"})
}

// --- GetTeamsRanking: empates ---

// Empate no CurrentRiddleIndex é desempatado pelo ID crescente, para o ranking
// não ficar trocando de ordem entre dois refreshes do polling do backoffice.
func TestGetTeamsRanking_TieOnProgressBrokenByTeamID(t *testing.T) {
	teams := []Team{
		{ID: 30, Name: "C", CurrentRiddleIndex: 5},
		{ID: 10, Name: "A", CurrentRiddleIndex: 5},
		{ID: 20, Name: "B", CurrentRiddleIndex: 5},
	}

	ranking, err := rankingService(sequentialIDs(10), teams).GetTeamsRanking()
	if err != nil {
		t.Fatalf("esperava nil, got %v", err)
	}

	assertOrder(t, ranking.Teams, []string{"A", "B", "C"})
}

// Empate no FinishedAt exato (mesmo instante) também cai no ID crescente.
func TestGetTeamsRanking_TieOnFinishedAtBrokenByTeamID(t *testing.T) {
	sameInstant := time.Date(2026, 9, 9, 12, 0, 0, 0, time.UTC)
	teams := []Team{
		{ID: 42, Name: "B", CurrentRiddleIndex: 10, FinishedAt: ptrTime(sameInstant)},
		{ID: 7, Name: "A", CurrentRiddleIndex: 10, FinishedAt: ptrTime(sameInstant)},
	}

	ranking, err := rankingService(sequentialIDs(10), teams).GetTeamsRanking()
	if err != nil {
		t.Fatalf("esperava nil, got %v", err)
	}

	assertOrder(t, ranking.Teams, []string{"A", "B"})
}

// --- GetTeamsRanking: casos de borda ---

// Equipe sem progresso (índice 0) e equipe sem membros não podem quebrar nada:
// entram no ranking normalmente, no fim da fila e com MembersCount = 0.
func TestGetTeamsRanking_TeamWithoutProgressOrMembers(t *testing.T) {
	teams := []Team{
		{ID: 1, Name: "Sem progresso e sem membros", CurrentRiddleIndex: 0},
		{
			ID: 2, Name: "Com progresso",
			CurrentRiddleIndex: 3,
			Members:            []TeamMember{{TeamID: 2, UserNumber: 100}, {TeamID: 2, UserNumber: 101}},
		},
	}

	ranking, err := rankingService(sequentialIDs(10), teams).GetTeamsRanking()
	if err != nil {
		t.Fatalf("esperava nil, got %v", err)
	}

	assertOrder(t, ranking.Teams, []string{"Com progresso", "Sem progresso e sem membros"})

	if ranking.Teams[0].MembersCount != 2 {
		t.Errorf("esperava MembersCount=2, got %d", ranking.Teams[0].MembersCount)
	}
	if ranking.Teams[1].MembersCount != 0 {
		t.Errorf("esperava MembersCount=0, got %d", ranking.Teams[1].MembersCount)
	}
	if ranking.Teams[1].SolvedCount != 0 {
		t.Errorf("esperava SolvedCount=0, got %d", ranking.Teams[1].SolvedCount)
	}
	if ranking.Teams[1].FinishedAt != nil {
		t.Errorf("esperava FinishedAt=nil, got %v", ranking.Teams[1].FinishedAt)
	}
}

// Sem equipes cadastradas: lista vazia (não nil) e nenhum erro.
func TestGetTeamsRanking_NoTeams(t *testing.T) {
	ranking, err := rankingService(sequentialIDs(10), []Team{}).GetTeamsRanking()
	if err != nil {
		t.Fatalf("esperava nil, got %v", err)
	}

	if len(ranking.Teams) != 0 {
		t.Errorf("esperava 0 equipes, got %d", len(ranking.Teams))
	}
	if ranking.RiddlesTotal != 10 {
		t.Errorf("esperava RiddlesTotal=10, got %d", ranking.RiddlesTotal)
	}
}

// RiddlesTotal é propagado para cada linha (o front renderiza "resolvidos / total").
func TestGetTeamsRanking_PropagatesRiddlesTotal(t *testing.T) {
	teams := []Team{
		{ID: 1, Name: "A", CurrentRiddleIndex: 2},
		{ID: 2, Name: "B", CurrentRiddleIndex: 1},
	}

	ranking, err := rankingService(sequentialIDs(7), teams).GetTeamsRanking()
	if err != nil {
		t.Fatalf("esperava nil, got %v", err)
	}

	if ranking.RiddlesTotal != 7 {
		t.Errorf("esperava RiddlesTotal=7, got %d", ranking.RiddlesTotal)
	}
	for _, entry := range ranking.Teams {
		if entry.RiddlesTotal != 7 {
			t.Errorf("equipe %q: esperava RiddlesTotal=7, got %d", entry.Name, entry.RiddlesTotal)
		}
	}
}

// Sem nenhum riddle ativo o ranking ainda responde, com total 0.
func TestGetTeamsRanking_NoActiveRiddles(t *testing.T) {
	teams := []Team{{ID: 1, Name: "A", CurrentRiddleIndex: 0}}

	ranking, err := rankingService(sequentialIDs(0), teams).GetTeamsRanking()
	if err != nil {
		t.Fatalf("esperava nil, got %v", err)
	}

	if ranking.RiddlesTotal != 0 {
		t.Errorf("esperava RiddlesTotal=0, got %d", ranking.RiddlesTotal)
	}
	if ranking.Teams[0].Position != 1 {
		t.Errorf("esperava Position=1, got %d", ranking.Teams[0].Position)
	}
}

// --- GetTeamsRanking: progresso exibido (SolvedCount) ---

// Fila sem buracos: o número exibido coincide com o índice, que é o caso fácil.
func TestGetTeamsRanking_SolvedCountWithoutGaps(t *testing.T) {
	teams := []Team{{ID: 1, Name: "A", CurrentRiddleIndex: 4}}

	ranking, err := rankingService(sequentialIDs(10), teams).GetTeamsRanking()
	if err != nil {
		t.Fatalf("esperava nil, got %v", err)
	}

	if ranking.Teams[0].SolvedCount != 4 {
		t.Errorf("esperava SolvedCount=4, got %d", ranking.Teams[0].SolvedCount)
	}
}

// O caso que motiva SolvedCount existir: riddle 3 desativado (soft delete) no
// meio da fila. Com CurrentRiddleIndex=5 a equipe passou por 1, 2, 4 e 5 — são
// 4 enigmas ativos resolvidos, não 5. Exibir o índice cru inflaria o progresso.
func TestGetTeamsRanking_SolvedCountIgnoresSoftDeletedRiddleInTheMiddle(t *testing.T) {
	activeIDs := []uint{1, 2, 4, 5, 6, 7} // riddle 3 desativado
	teams := []Team{{ID: 1, Name: "A", CurrentRiddleIndex: 5}}

	ranking, err := rankingService(activeIDs, teams).GetTeamsRanking()
	if err != nil {
		t.Fatalf("esperava nil, got %v", err)
	}

	entry := ranking.Teams[0]
	if entry.SolvedCount != 4 {
		t.Errorf("esperava SolvedCount=4 (ativos 1,2,4,5), got %d", entry.SolvedCount)
	}
	if entry.RiddlesTotal != 6 {
		t.Errorf("esperava RiddlesTotal=6 (só os ativos), got %d", entry.RiddlesTotal)
	}
}

// Vários buracos, inclusive no começo da fila (riddles 1 e 2 desativados).
func TestGetTeamsRanking_SolvedCountWithMultipleGaps(t *testing.T) {
	activeIDs := []uint{3, 4, 8, 9} // 1, 2, 5, 6 e 7 desativados
	teams := []Team{
		{ID: 1, Name: "Passou de 8", CurrentRiddleIndex: 8},
		{ID: 2, Name: "Parou em 4", CurrentRiddleIndex: 4},
		{ID: 3, Name: "Índice em buraco", CurrentRiddleIndex: 6},
		{ID: 4, Name: "Nem começou", CurrentRiddleIndex: 0},
	}

	ranking, err := rankingService(activeIDs, teams).GetTeamsRanking()
	if err != nil {
		t.Fatalf("esperava nil, got %v", err)
	}

	expected := map[string]int{
		"Passou de 8": 3, // ativos <= 8: 3, 4, 8
		"Parou em 4":  2, // ativos <= 4: 3, 4
		// Índice caiu num ID que foi desativado (o riddle 6 sumiu depois de
		// resolvido): conta os ativos que ficaram para trás — 3 e 4.
		"Índice em buraco": 2,
		"Nem começou":      0,
	}
	for _, entry := range ranking.Teams {
		if entry.SolvedCount != expected[entry.Name] {
			t.Errorf("equipe %q: esperava SolvedCount=%d, got %d",
				entry.Name, expected[entry.Name], entry.SolvedCount)
		}
	}
}

// Equipe que terminou o jogo aparece com o progresso cheio (X de X), mesmo com
// buracos na fila — é o que o admin espera ver ao lado do status "Finalizado".
func TestGetTeamsRanking_SolvedCountForFinishedTeamIsTotal(t *testing.T) {
	activeIDs := []uint{1, 2, 4, 7} // 3, 5 e 6 desativados
	finishedAt := time.Date(2026, 9, 9, 12, 0, 0, 0, time.UTC)
	teams := []Team{
		{ID: 1, Name: "Campeã", CurrentRiddleIndex: 7, FinishedAt: ptrTime(finishedAt)},
	}

	ranking, err := rankingService(activeIDs, teams).GetTeamsRanking()
	if err != nil {
		t.Fatalf("esperava nil, got %v", err)
	}

	entry := ranking.Teams[0]
	if entry.SolvedCount != 4 || entry.RiddlesTotal != 4 {
		t.Errorf("esperava 4/4, got %d/%d", entry.SolvedCount, entry.RiddlesTotal)
	}
}

// A ordenação continua vindo do índice, não de SolvedCount: duas equipes com o
// mesmo número de enigmas resolvidos, mas índices diferentes, mantêm a ordem
// pelo índice — quem está com o índice maior fica na frente.
func TestGetTeamsRanking_OrderStillFollowsIndexNotSolvedCount(t *testing.T) {
	activeIDs := []uint{1, 2} // 3 em diante desativados
	teams := []Team{
		{ID: 1, Name: "Índice menor", CurrentRiddleIndex: 2},
		{ID: 2, Name: "Índice maior", CurrentRiddleIndex: 9},
	}

	ranking, err := rankingService(activeIDs, teams).GetTeamsRanking()
	if err != nil {
		t.Fatalf("esperava nil, got %v", err)
	}

	assertOrder(t, ranking.Teams, []string{"Índice maior", "Índice menor"})
	// Ambas contam 2 resolvidos: o empate visual não altera a ordenação.
	for _, entry := range ranking.Teams {
		if entry.SolvedCount != 2 {
			t.Errorf("equipe %q: esperava SolvedCount=2, got %d", entry.Name, entry.SolvedCount)
		}
	}
}

// --- GetTeamsRanking: erros do repositório ---

func TestGetTeamsRanking_ListActiveRiddleIDsError(t *testing.T) {
	repo := &mockRiddleRepository{
		ListActiveRiddleIDsFunc: func() ([]uint, error) { return nil, errors.New("db error") },
	}

	_, err := NewRiddleService(repo).GetTeamsRanking()
	assertAPIError(t, err, "internal_server_error")
}

func TestGetTeamsRanking_ListTeamsError(t *testing.T) {
	repo := &mockRiddleRepository{
		ListActiveRiddleIDsFunc:  func() ([]uint, error) { return sequentialIDs(5), nil },
		ListTeamsWithMembersFunc: func() ([]Team, error) { return nil, errors.New("db error") },
	}

	_, err := NewRiddleService(repo).GetTeamsRanking()
	assertAPIError(t, err, "internal_server_error")
}
