// Regra de negócio: coffee de dia (antes das 18h) só pode ser vendido via combo;
// coffee vendido individualmente ("À Venda") precisa ser de noite (>= 18h).
export const NIGHT_HOUR = 18;

export function isNightCoffee(dateTime: string): boolean {
  if (!dateTime) return false;
  const parsed = new Date(dateTime);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.getHours() >= NIGHT_HOUR;
}
