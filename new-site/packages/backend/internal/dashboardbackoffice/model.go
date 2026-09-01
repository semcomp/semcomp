package dashboardbackoffice

import "time"

// Usuários - visão geral dos participantes da Semcomp -------------------------

// UsersStats agrega dados gerais dos usuários cadastrados na Semcomp.
// Populado a partir das tabelas `users`, `absence_justifications` e `presences`.
type UsersStats struct {
	Total             int64     `json:"total"`              // total de usuários cadastrados
	Confirmed         int64     `json:"confirmed"`          // total com e-mail verificado
	Unconfirmed       int64     `json:"unconfirmed"`        // total com e-mail não verificado
	JustifiedAbsences int64     `json:"justifiedAbsence"`   // total com falta justificada (aprovada)
	PendingAbsences   int64     `json:"pendingAbsence"`     // total com justificativa pendente
	NotJustified      int64     `json:"notJustified"`       // total com justificativa negada
	MeanRate          float64   `json:"meanRate"`           // média de presença (excluindo justificados)
	TotalWithPapfe    int64     `json:"totalWithPapfe"`     // total de usuários com PAPFE
	LastUpdate        time.Time `json:"lastUpdate"`
}

// Eventos - inscrições e presenças por evento --------------------------------

// EventStats agrega dados de um evento específico (minicurso, palestra, etc.).
// Populado a partir das tabelas `events`, `signin_events` e `presences`.
type EventStats struct {
	EventName  string    `json:"eventName"`
	EventType  string    `json:"eventType"`
	EventDate  time.Time `json:"eventDate"`
	Total      int64     `json:"total"`       // total de inscritos
	Present    int64     `json:"present"`     // presenças registradas
	Absent     int64     `json:"absent"`      // inscritos que não compareceram
	MeanRate   float64   `json:"meanRate"`    // taxa de presença (present/total)
	WaitListed int64     `json:"waitListed"`  // total na lista de espera
	LastUpdate time.Time `json:"lastUpdate"`
}

// EventsSummary é o resumo agregado de todos os eventos da Semcomp.
type EventsSummary struct {
	TotalEvents       int64        `json:"totalEvents"`
	TotalSignins      int64        `json:"totalSignins"`
	TotalPresences    int64        `json:"totalPresences"`
	OverallAttendance float64      `json:"overallAttendance"`
	EventsByType      []LabelCount `json:"eventsByType"`
	Events            []EventStats `json:"events"`
	LastUpdate        time.Time    `json:"lastUpdate"`
}

// Vendas de Kits - amostragem por cor, tamanho e corte ---------------------------

// KitSalesStats agrega dados de vendas de camisetas/kits.
// Populado cruzando `sales` (status PAGO) -> `sale_items` -> `products` (type KIT) -> `kits`.
type KitSalesStats struct {
	TotalSold      int64            `json:"totalSold"`
	TotalPending   int64            `json:"totalPending"`
	TotalPickedUp  int64            `json:"totalPickedUp"`
	TotalRevenue   float64          `json:"totalRevenue"`   // receita total
	ByColor        []LabelCount     `json:"byColor"`
	BySize         []LabelCount     `json:"bySize"`
	ByCut          []LabelCount     `json:"byCut"`          // babylook ou tradicional
	ByColorAndSize []KitVariantStat `json:"byColorAndSize"`
	LastUpdate     time.Time        `json:"lastUpdate"`
}

// KitVariantStat detalha vendas de uma combinação cor x tamanho x corte.
type KitVariantStat struct {
	Color      string `json:"color"`
	Size       string `json:"size"`
	IsBabylook bool   `json:"isBabylook"`
	Count      int64  `json:"count"`
}

// Vendas de Coffes - amostragem por tipo/nome -----------------------------------

// CoffeeSalesStats agrega dados de vendas de coffees.
// Populado cruzando `sales` (status PAGO) -> `sale_items` -> `products` (type COFFEE) -> `coffees`.
type CoffeeSalesStats struct {
	TotalSold    int64        `json:"totalSold"`
	TotalPending int64        `json:"totalPending"`
	TotalRevenue float64      `json:"totalRevenue"` 
	ByCoffee     []CoffeeStat `json:"byCoffee"`     // detalha por tipo de coffe
	LastUpdate   time.Time    `json:"lastUpdate"`
}

// CoffeeStat detalha vendas de um tipo específico de coffee.
type CoffeeStat struct {
	CoffeeID   uint      `json:"coffeeId"`
	CoffeeName string    `json:"coffeeName"`
	DateTime   time.Time `json:"dateTime"`   // data/hora do coffee
	Sold       int64     `json:"sold"`       // quantidade vendida (PAGO)
	Pending    int64     `json:"pending"`    // quantidade em pedidos pendentes
	Revenue    float64   `json:"revenue"`    // receita do coffee específico
}

// SalesOverviewStats é o resumo geral de vendas de todos os tipos de produto.
// Populado a partir de `sales` e `sale_items`.
type SalesOverviewStats struct {
	TotalSales       int64              `json:"totalSales"`       // total de pedidos criados
	TotalPaid        int64              `json:"totalPaid"`        // pedidos com status PAGO
	TotalPending     int64              `json:"totalPending"`     // pedidos com status PENDENTE
	TotalCanceled    int64              `json:"totalCanceled"`    // pedidos cancelados/rejeitados/reembolsados
	TotalExpired     int64              `json:"totalExpired"`     // pedidos expirados
	TotalRevenue     float64            `json:"totalRevenue"`     // receita total (soma de PAGO)
	RevenueByProduct []LabelValue       `json:"revenueByProduct"` // receita por tipo de produto (KIT, COFFEE, COMBO)
	SalesByStatus    []LabelCount       `json:"salesByStatus"`    // contagem de vendas por status
	SalesByMethod    []LabelCount       `json:"salesByMethod"`    // contagem por método de pagamento
	RevenueTimeline  []TimeSeriesPoint  `json:"revenueTimeline"`  // evolução da receita ao longo do tempo
	TopProducts      []ProductRank      `json:"topProducts"`      // ranking por produto (mais vendidos / maior faturamento)
	LastUpdate       time.Time          `json:"lastUpdate"`
}

// ProductRank agrega vendas de um produto específico (apenas pedidos PAGO).
type ProductRank struct {
	ProductID uint    `json:"productId"`
	Name      string  `json:"name"`
	Type      string  `json:"type"`
	Sold      int64   `json:"sold"`    // quantidade vendida
	Revenue   float64 `json:"revenue"` // faturamento (soma de unit_price * quantity)
}

// Vendas de combos - visão geral de vendas de combos -------------------------------

// ComboSalesStats agrega dados de vendas de combos.
type ComboSalesStats struct {
	TotalSold    int64       `json:"totalSold"`
	TotalPending int64       `json:"totalPending"`
	TotalRevenue float64     `json:"totalRevenue"`
	ByCombo      []ComboStat `json:"byCombo"`
	LastUpdate   time.Time   `json:"lastUpdate"`
}

// ComboStat detalha vendas de um combo específico.
type ComboStat struct {
	ComboID   uint    `json:"comboId"`
	ComboName string  `json:"comboName"`
	Sold      int64   `json:"sold"`
	Pending   int64   `json:"pending"`
	Revenue   float64 `json:"revenue"`
}

// Tipos auxiliares ----------------------------------------------------------

// LabelCount é um par label -> contagem (ex: "Azul" -> 42).
type LabelCount struct {
	Label string `json:"label"`
	Count int64  `json:"count"`
}

// LabelValue é um par label -> valor numérico (ex: "KIT" → 1500.00).
type LabelValue struct {
	Label string  `json:"label"`
	Value float64 `json:"value"`
}

// RangeCount agrupa contagens por faixa numérica.
type RangeCount struct {
	Min   int   `json:"min"`
	Max   int   `json:"max"`
	Count int64 `json:"count"`
}

// TimeSeriesPoint representa um ponto em série temporal (ex: receita diária).
type TimeSeriesPoint struct {
	Date  time.Time `json:"date"`
	Value float64   `json:"value"`
}

// Resposta completa do dashboard --------------------------------------------

// DashboardResponse agrega todas as seções de análise.
type DashboardResponse struct {
	Users   *UsersStats        `json:"users,omitempty"`
	Events  *EventsSummary     `json:"events,omitempty"`
	Kits    *KitSalesStats     `json:"kits,omitempty"`
	Coffees *CoffeeSalesStats  `json:"coffees,omitempty"`
	Combos  *ComboSalesStats   `json:"combos,omitempty"`
	Sales   *SalesOverviewStats `json:"sales,omitempty"`
}

// DashboardQuery controla quais seções do dashboard devem ser retornadas.
// Se nenhuma seção for especificada, retorna todas.
type DashboardQuery struct {
	Sections []string `form:"sections"` // ex: ?sections=users,kits,coffees,events,sales,combos
}
