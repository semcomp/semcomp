package dashboardbackoffice

import (
	"time"

	"gorm.io/gorm"
)

// DashboardRepository encapsula todas as queries de agregação para o dashboard.
// As queries fazem JOINs e GROUP BYs diretamente nas tabelas existentes - não
// há tabela própria deste módulo.
type DashboardRepository struct {
	db *gorm.DB
}

func NewDashboardRepository(db *gorm.DB) *DashboardRepository {
	return &DashboardRepository{db: db}
}

// Usuários -------------------------------------------------------------------

func (r *DashboardRepository) GetUsersStats() (*UsersStats, error) {
	now := time.Now()
	stats := &UsersStats{LastUpdate: now}

	// Total de usuários e confirmados
	if err := r.db.Raw(`
		SELECT
			COUNT(*)                                       AS total,
			COUNT(*) FILTER (WHERE email_verified = true)  AS confirmed,
			COUNT(*) FILTER (WHERE email_verified = false) AS unconfirmed,
			COUNT(*) FILTER (WHERE has_papfe = true)       AS total_with_papfe
		FROM users
	`).Scan(stats).Error; err != nil {
		return nil, err
	}

	// Justificativas de ausência
	if err := r.db.Raw(`
		SELECT
			COUNT(*) FILTER (WHERE status = 'aprovado')    AS justified_absences,
			COUNT(*) FILTER (WHERE status = 'em_analise')  AS pending_absences,
			COUNT(*) FILTER (WHERE status = 'negado')      AS not_justified
		FROM absence_justifications
	`).Scan(stats).Error; err != nil {
		return nil, err
	}

	// Média de presença (excluindo usuários com justificativa aprovada)
	if err := r.db.Raw(`
		SELECT COALESCE(AVG(u.presence_rate), 0) AS mean_rate
		FROM users u
		WHERE u.email NOT IN (
			SELECT aj.user_email FROM absence_justifications aj WHERE aj.status = 'aprovado'
		)
	`).Scan(stats).Error; err != nil {
		return nil, err
	}

	return stats, nil
}

// Eventos --------------------------------------------------------------------

func (r *DashboardRepository) GetEventsStats() (*EventsSummary, error) {
	now := time.Now()
	summary := &EventsSummary{LastUpdate: now}

	// Total de eventos
	if err := r.db.Raw(`SELECT COUNT(*) FROM events`).Scan(&summary.TotalEvents).Error; err != nil {
		return nil, err
	}

	// Total de inscrições
	if err := r.db.Raw(`SELECT COUNT(*) FROM signin_events`).Scan(&summary.TotalSignins).Error; err != nil {
		return nil, err
	}

	// Total de presenças
	if err := r.db.Raw(`SELECT COUNT(*) FROM presences`).Scan(&summary.TotalPresences).Error; err != nil {
		return nil, err
	}

	// Taxa de presença geral
	if summary.TotalSignins > 0 {
		summary.OverallAttendance = float64(summary.TotalPresences) / float64(summary.TotalSignins)
	}

	// Contagem de eventos por tipo
	var eventsByType []LabelCount
	if err := r.db.Raw(`
		SELECT type AS label, COUNT(*) AS count
		FROM events
		WHERE type IS NOT NULL AND type != ''
		GROUP BY type
		ORDER BY count DESC
	`).Scan(&eventsByType).Error; err != nil {
		return nil, err
	}
	summary.EventsByType = eventsByType

	// Detalhamento por evento
	var events []EventStats
	if err := r.db.Raw(`
		SELECT
			e.name                                                                 AS event_name,
			e.type                                                                 AS event_type,
			e.init_date                                                            AS event_date,
			COALESCE(s.total, 0)                                                   AS total,
			COALESCE(p.present, 0)                                                 AS present,
			COALESCE(s.total, 0) - COALESCE(p.present, 0)                          AS absent,
			CASE WHEN COALESCE(s.total, 0) > 0
				THEN COALESCE(p.present, 0)::float / s.total
				ELSE 0
			END                                                                    AS mean_rate,
			COALESCE(s.wait_listed, 0)                                             AS wait_listed
		FROM events e
		LEFT JOIN (
			SELECT event_name, event_init_date,
				COUNT(*)                                                      AS total,
				COUNT(*) FILTER (WHERE status = 'Lista de Espera')            AS wait_listed
			FROM signin_events
			GROUP BY event_name, event_init_date
		) s ON s.event_name = e.name AND s.event_init_date = e.init_date
		LEFT JOIN (
			SELECT event_name, event_init_date, COUNT(*) AS present
			FROM presences
			GROUP BY event_name, event_init_date
		) p ON p.event_name = e.name AND p.event_init_date = e.init_date
		ORDER BY e.init_date
	`).Scan(&events).Error; err != nil {
		return nil, err
	}

	// Atribui LastUpdate a cada evento
	for i := range events {
		events[i].LastUpdate = now
	}
	summary.Events = events

	return summary, nil
}

// Kits -------------------------------------------------------------------

func (r *DashboardRepository) GetKitSalesStats() (*KitSalesStats, error) {
	now := time.Now()
	stats := &KitSalesStats{LastUpdate: now}

	// Totais gerais de kits vendidos/pendentes/retirados e receita
	// Considera sale_items que apontam diretamente para um KIT OU
	// sale_items que apontam para um COMBO com kit_product_id preenchido.
	if err := r.db.Raw(`
		SELECT
			COALESCE(SUM(si.quantity) FILTER (WHERE s.status = 'PAGO'), 0)                       AS total_sold,
			COALESCE(SUM(si.quantity) FILTER (WHERE s.status = 'PENDENTE'), 0)                   AS total_pending,
			COUNT(*) FILTER (WHERE si.is_picked_up = true AND s.status = 'PAGO')                 AS total_picked_up,
			COALESCE(SUM(si.unit_price * si.quantity) FILTER (WHERE s.status = 'PAGO'), 0)       AS total_revenue
		FROM sale_items si
		JOIN sales s ON s.id = si.sale_id
		JOIN products p ON p.id = si.product_id
		WHERE p.type = 'KIT'
	`).Scan(stats).Error; err != nil {
		return nil, err
	}

	// Distribuição por cor (vendas pagas)
	var byColor []LabelCount
	if err := r.db.Raw(`
		SELECT k.color AS label, COALESCE(SUM(si.quantity), 0) AS count
		FROM sale_items si
		JOIN sales s ON s.id = si.sale_id
		JOIN products p ON p.id = si.product_id
		JOIN kits k ON k.id = p.id
		WHERE p.type = 'KIT' AND s.status = 'PAGO'
		GROUP BY k.color
		ORDER BY count DESC
	`).Scan(&byColor).Error; err != nil {
		return nil, err
	}
	stats.ByColor = byColor

	// Distribuição por tamanho
	var bySize []LabelCount
	if err := r.db.Raw(`
		SELECT k.size AS label, COALESCE(SUM(si.quantity), 0) AS count
		FROM sale_items si
		JOIN sales s ON s.id = si.sale_id
		JOIN products p ON p.id = si.product_id
		JOIN kits k ON k.id = p.id
		WHERE p.type = 'KIT' AND s.status = 'PAGO'
		GROUP BY k.size
		ORDER BY count DESC
	`).Scan(&bySize).Error; err != nil {
		return nil, err
	}
	stats.BySize = bySize

	// Distribuição por corte (babylook vs. tradicional)
	var byCut []LabelCount
	if err := r.db.Raw(`
		SELECT
			CASE WHEN k.is_babylook THEN 'Babylook' ELSE 'Tradicional' END AS label,
			COALESCE(SUM(si.quantity), 0) AS count
		FROM sale_items si
		JOIN sales s ON s.id = si.sale_id
		JOIN products p ON p.id = si.product_id
		JOIN kits k ON k.id = p.id
		WHERE p.type = 'KIT' AND s.status = 'PAGO'
		GROUP BY k.is_babylook
		ORDER BY count DESC
	`).Scan(&byCut).Error; err != nil {
		return nil, err
	}
	stats.ByCut = byCut

	// Cruzamento cor × tamanho × corte
	var byVariant []KitVariantStat
	if err := r.db.Raw(`
		SELECT k.color, k.size, k.is_babylook, COALESCE(SUM(si.quantity), 0) AS count
		FROM sale_items si
		JOIN sales s ON s.id = si.sale_id
		JOIN products p ON p.id = si.product_id
		JOIN kits k ON k.id = p.id
		WHERE p.type = 'KIT' AND s.status = 'PAGO'
		GROUP BY k.color, k.size, k.is_babylook
		ORDER BY count DESC
	`).Scan(&byVariant).Error; err != nil {
		return nil, err
	}
	stats.ByColorAndSize = byVariant

	return stats, nil
}

// Coffes -------------------------------------------------------------------

func (r *DashboardRepository) GetCoffeeSalesStats() (*CoffeeSalesStats, error) {
	now := time.Now()
	stats := &CoffeeSalesStats{LastUpdate: now}

	// Totais gerais
	if err := r.db.Raw(`
		SELECT
			COALESCE(SUM(si.quantity) FILTER (WHERE s.status = 'PAGO'), 0)                   AS total_sold,
			COALESCE(SUM(si.quantity) FILTER (WHERE s.status = 'PENDENTE'), 0)               AS total_pending,
			COALESCE(SUM(si.unit_price * si.quantity) FILTER (WHERE s.status = 'PAGO'), 0)   AS total_revenue
		FROM sale_items si
		JOIN sales s ON s.id = si.sale_id
		JOIN products p ON p.id = si.product_id
		WHERE p.type = 'COFFEE'
	`).Scan(stats).Error; err != nil {
		return nil, err
	}

	// Detalhamento por coffee
	var byCoffee []CoffeeStat
	if err := r.db.Raw(`
		SELECT
			p.id                                                                             AS coffee_id,
			c.name                                                                           AS coffee_name,
			c.date_time                                                                      AS date_time,
			COALESCE(SUM(si.quantity) FILTER (WHERE s.status = 'PAGO'), 0)                   AS sold,
			COALESCE(SUM(si.quantity) FILTER (WHERE s.status = 'PENDENTE'), 0)               AS pending,
			COALESCE(SUM(si.unit_price * si.quantity) FILTER (WHERE s.status = 'PAGO'), 0)   AS revenue
		FROM products p
		JOIN coffees c ON c.id = p.id
		LEFT JOIN sale_items si ON si.product_id = p.id
		LEFT JOIN sales s ON s.id = si.sale_id
		WHERE p.type = 'COFFEE'
		GROUP BY p.id, c.name, c.date_time
		ORDER BY c.date_time
	`).Scan(&byCoffee).Error; err != nil {
		return nil, err
	}
	stats.ByCoffee = byCoffee

	return stats, nil
}

// Vendas Gerais --------------------------------------------------------------

func (r *DashboardRepository) GetSalesOverview() (*SalesOverviewStats, error) {
	now := time.Now()
	stats := &SalesOverviewStats{LastUpdate: now}

	// Contagem geral por status
	if err := r.db.Raw(`
		SELECT
			COUNT(*)                                             AS total_sales,
			COUNT(*) FILTER (WHERE status = 'PAGO')              AS total_paid,
			COUNT(*) FILTER (WHERE status = 'PENDENTE')          AS total_pending,
			COUNT(*) FILTER (WHERE status IN ('CANCELADO','REJEITADO','REEMBOLSADO')) AS total_canceled,
			COUNT(*) FILTER (WHERE status = 'EXPIRADO')          AS total_expired,
			COALESCE(SUM(total_amount) FILTER (WHERE status = 'PAGO'), 0) AS total_revenue
		FROM sales
	`).Scan(stats).Error; err != nil {
		return nil, err
	}

	// Receita por tipo de produto
	var revenueByProduct []LabelValue
	if err := r.db.Raw(`
		SELECT p.type AS label, COALESCE(SUM(si.unit_price * si.quantity), 0) AS value
		FROM sale_items si
		JOIN sales s ON s.id = si.sale_id
		JOIN products p ON p.id = si.product_id
		WHERE s.status = 'PAGO'
		GROUP BY p.type
		ORDER BY value DESC
	`).Scan(&revenueByProduct).Error; err != nil {
		return nil, err
	}
	stats.RevenueByProduct = revenueByProduct

	// Vendas por status
	var salesByStatus []LabelCount
	if err := r.db.Raw(`
		SELECT status AS label, COUNT(*) AS count
		FROM sales
		GROUP BY status
		ORDER BY count DESC
	`).Scan(&salesByStatus).Error; err != nil {
		return nil, err
	}
	stats.SalesByStatus = salesByStatus

	// Vendas por método de pagamento
	var salesByMethod []LabelCount
	if err := r.db.Raw(`
		SELECT payment_method AS label, COUNT(*) AS count
		FROM sales
		GROUP BY payment_method
		ORDER BY count DESC
	`).Scan(&salesByMethod).Error; err != nil {
		return nil, err
	}
	stats.SalesByMethod = salesByMethod

	// Evolução de receita ao longo do tempo (agrupada por dia, apenas vendas pagas)
	var timeline []TimeSeriesPoint
	if err := r.db.Raw(`
		SELECT DATE(updated_at) AS date, SUM(total_amount) AS value
		FROM sales
		WHERE status = 'PAGO'
		GROUP BY DATE(updated_at)
		ORDER BY date
	`).Scan(&timeline).Error; err != nil {
		return nil, err
	}
	stats.RevenueTimeline = timeline

	return stats, nil
}

// Combos -------------------------------------------------------------------

func (r *DashboardRepository) GetComboSalesStats() (*ComboSalesStats, error) {
	now := time.Now()
	stats := &ComboSalesStats{LastUpdate: now}

	// Totais gerais
	if err := r.db.Raw(`
		SELECT
			COALESCE(SUM(si.quantity) FILTER (WHERE s.status = 'PAGO'), 0)                   AS total_sold,
			COALESCE(SUM(si.quantity) FILTER (WHERE s.status = 'PENDENTE'), 0)               AS total_pending,
			COALESCE(SUM(si.unit_price * si.quantity) FILTER (WHERE s.status = 'PAGO'), 0)   AS total_revenue
		FROM sale_items si
		JOIN sales s ON s.id = si.sale_id
		JOIN products p ON p.id = si.product_id
		WHERE p.type = 'COMBO'
	`).Scan(stats).Error; err != nil {
		return nil, err
	}

	// Detalhamento por combo
	var byCombo []ComboStat
	if err := r.db.Raw(`
		SELECT
			p.id                                                                             AS combo_id,
			p.name                                                                           AS combo_name,
			COALESCE(SUM(si.quantity) FILTER (WHERE s.status = 'PAGO'), 0)                   AS sold,
			COALESCE(SUM(si.quantity) FILTER (WHERE s.status = 'PENDENTE'), 0)               AS pending,
			COALESCE(SUM(si.unit_price * si.quantity) FILTER (WHERE s.status = 'PAGO'), 0)   AS revenue
		FROM products p
		LEFT JOIN sale_items si ON si.product_id = p.id
		LEFT JOIN sales s ON s.id = si.sale_id
		WHERE p.type = 'COMBO'
		GROUP BY p.id, p.name
		ORDER BY sold DESC
	`).Scan(&byCombo).Error; err != nil {
		return nil, err
	}
	stats.ByCombo = byCombo

	return stats, nil
}
