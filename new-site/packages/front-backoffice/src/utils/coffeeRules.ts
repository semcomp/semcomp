// Coffee de dia (antes das 18h) pode ser vendido individualmente ("À Venda");
// ao criar um coffee de dia individual é exibido um aviso para o admin.
// Este helper também é usado para liberar coffees noturnos em combos.
export const NIGHT_HOUR = 18;

export function isNightCoffee(dateTime: string): boolean {
  if (!dateTime) return false;
  const parsed = new Date(dateTime);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.getHours() >= NIGHT_HOUR;
}
