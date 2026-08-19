import type { SaleResponse } from "@/api/sales";

// Janela padrão de expiração do PIX (30min). O backend não persiste
// pix_expiration, então usamos created_at + janela quando o campo vier vazio.
export const PIX_WINDOW_MS = 30 * 60 * 1000;

// Pendente pagável = status PENDENTE, com QR code gerado e dentro da janela de
// expiração. Fonte única de verdade para "pagamento pendente" no front
// (Profile, StorePage e PendingPayments).
export function isPendingSale(sale: SaleResponse): boolean {
  if (sale.status !== "PENDENTE") return false;
  // Sem QR (copia-e-cola) o pedido não é pagável — não conta como pendente.
  if (!sale.qr_code) return false;
  const expiresAt = sale.pix_expiration
    ? new Date(sale.pix_expiration).getTime()
    : new Date(sale.created_at).getTime() + PIX_WINDOW_MS;
  return expiresAt > Date.now();
}
