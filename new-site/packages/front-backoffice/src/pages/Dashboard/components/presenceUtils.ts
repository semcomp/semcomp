import type { EventStats } from "@/api/dashboard";

// Agrupa eventos por dia usando a parte de data (UTC) de eventDate.
export function getEventDay(iso: string): string {
  return iso.slice(0, 10);
}

export function formatDayLabel(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function listDays(events: EventStats[]): string[] {
  return [...new Set(events.map((e) => getEventDay(e.eventDate)))].sort();
}