package dashboardbackoffice

import (
	"strings"

	"backend/internal/apierrors"
)

type DashboardService struct {
	repo *DashboardRepository
}

func NewDashboardService(repo *DashboardRepository) *DashboardService {
	return &DashboardService{repo: repo}
}

// GetDashboard monta a resposta agregada do dashboard. Quando nenhuma seção é
// especificada em DashboardQuery.Sections, todas as seções são retornadas.
func (s *DashboardService) GetDashboard(query DashboardQuery) (*DashboardResponse, error) {
	requested := query.Sections
	all := len(requested) == 0

	want := func(section string) bool {
		if all {
			return true
		}
		for _, s := range requested {
			if strings.TrimSpace(s) == section {
				return true
			}
		}
		return false
	}

	resp := &DashboardResponse{}

	if want("users") {
		users, err := s.repo.GetUsersStats()
		if err != nil {
			return nil, apierrors.InternalServerError("Erro ao calcular estatísticas de usuários", err)
		}
		resp.Users = users
	}

	if want("events") {
		events, err := s.repo.GetEventsStats()
		if err != nil {
			return nil, apierrors.InternalServerError("Erro ao calcular estatísticas de eventos", err)
		}
		resp.Events = events
	}

	if want("kits") {
		kits, err := s.repo.GetKitSalesStats()
		if err != nil {
			return nil, apierrors.InternalServerError("Erro ao calcular estatísticas de vendas de kits", err)
		}
		resp.Kits = kits
	}

	if want("coffees") {
		coffees, err := s.repo.GetCoffeeSalesStats()
		if err != nil {
			return nil, apierrors.InternalServerError("Erro ao calcular estatísticas de vendas de coffes", err)
		}
		resp.Coffees = coffees
	}

	if want("combos") {
		combos, err := s.repo.GetComboSalesStats()
		if err != nil {
			return nil, apierrors.InternalServerError("Erro ao calcular estatísticas de vendas de combos", err)
		}
		resp.Combos = combos
	}

	if want("sales") {
		sales, err := s.repo.GetSalesOverview()
		if err != nil {
			return nil, apierrors.InternalServerError("Erro ao calcular panorama de vendas", err)
		}

		topProducts, err := s.repo.GetTopProducts()
		if err != nil {
			return nil, apierrors.InternalServerError("Erro ao calcular ranking de produtos", err)
		}
		sales.TopProducts = topProducts

		resp.Sales = sales
	}

	return resp, nil
}