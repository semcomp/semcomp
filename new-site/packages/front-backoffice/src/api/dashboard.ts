import client from "./client";

// ============================================================
// Tipos (espelham internal/dashboardbackoffice/model.go)
// ============================================================

export interface LabelCount {
  label: string;
  count: number;
}

export interface LabelValue {
  label: string;
  value: number;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

// Usuários - visão geral dos participantes
export interface UsersStats {
  total: number;
  confirmed: number;
  unconfirmed: number;
  justifiedAbsence: number;
  pendingAbsence: number;
  notJustified: number;
  meanRate: number;
  totalWithPapfe: number;
  lastUpdate: string;
}

// Eventos - inscrições e presenças por evento
export interface EventStats {
  eventName: string;
  eventType: string;
  eventDate: string;
  total: number;
  present: number;
  absent: number;
  meanRate: number;
  waitListed: number;
  lastUpdate: string;
}

export interface EventsSummary {
  totalEvents: number;
  totalSignins: number;
  totalPresences: number;
  overallAttendance: number;
  eventsByType?: LabelCount[];
  events?: EventStats[];
  lastUpdate: string;
}

// Vendas de kits - amostragem por cor, tamanho e corte
export interface KitVariantStat {
  color: string;
  size: string;
  isBabylook: boolean;
  count: number;
}

export interface KitSalesStats {
  totalSold: number;
  totalPending: number;
  totalPickedUp: number;
  totalRevenue: number;
  byColor?: LabelCount[];
  bySize?: LabelCount[];
  byCut?: LabelCount[];
  byColorAndSize?: KitVariantStat[];
  lastUpdate: string;
}

// Vendas de coffes
export interface CoffeeStat {
  coffeeId: number;
  coffeeName: string;
  dateTime: string;
  sold: number;
  pending: number;
  revenue: number;
}

export interface CoffeeSalesStats {
  totalSold: number;
  totalPending: number;
  totalRevenue: number;
  byCoffee?: CoffeeStat[];
  lastUpdate: string;
}

// Vendas de combos
export interface ComboStat {
  comboId: number;
  comboName: string;
  sold: number;
  pending: number;
  revenue: number;
}

export interface ComboSalesStats {
  totalSold: number;
  totalPending: number;
  totalRevenue: number;
  byCombo?: ComboStat[];
  lastUpdate: string;
}

// Panorama geral de vendas
export interface ProductRank {
  productId: number;
  name: string;
  type: string;
  sold: number;
  revenue: number;
}

export interface SalesOverviewStats {
  totalSales: number;
  totalPaid: number;
  totalPending: number;
  totalCanceled: number;
  totalExpired: number;
  totalRevenue: number;
  revenueByProduct?: LabelValue[];
  salesByStatus?: LabelCount[];
  salesByMethod?: LabelCount[];
  revenueTimeline?: TimeSeriesPoint[];
  topProducts?: ProductRank[];
  lastUpdate: string;
}

// Resposta completa do dashboard
export interface DashboardResponse {
  users?: UsersStats;
  events?: EventsSummary;
  kits?: KitSalesStats;
  coffees?: CoffeeSalesStats;
  combos?: ComboSalesStats;
  sales?: SalesOverviewStats;
}

export interface GetDashboardParams {
  // Seções a retornar (users, events, kits, coffees, combos, sales).
  // Se vazio, o backend retorna todas.
  sections?: string[];
}

export const dashboardAPI = {
  // GET /admin/dashboard — estatísticas agregadas do backoffice
  get: async (params?: GetDashboardParams): Promise<DashboardResponse> => {
    const response = await client.get<DashboardResponse>("/admin/dashboard", {
      params,
    });
    return response.data;
  },
};