/**
 * Eixo temporal dos dados de exemplo.
 *
 * Fristgebundene Inhalte (Konsultationen, Termine, Waldbrandstufe, freie
 * horas de atendimento) estão definidos em relação à data de referência.
 * Assim a demonstração mostra sempre prazos em curso e não prazos vencidos —
 * e «termina em 12 dias» continua a ser uma afirmação verdadeira.
 *
 * Para builds e testes reprodutíveis, a data de referência pode ser fixada
 * Umgebungsvariable MOCK_TODAY (`YYYY-MM-DD`) festnageln.
 *
 * Archivinhalte (Nachrichten, Sitzungen, Haushalt) tragen dagegen feste
 * as datas — não devem deslizar a cada build.
 */

function resolveReference(): Date {
  const override = process.env.MOCK_TODAY;
  if (override && /^\d{4}-\d{2}-\d{2}$/.test(override)) {
    return new Date(`${override}T00:00:00.000Z`);
  }
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export const referenceDate = resolveReference();

/** Data ISO (`2026-08-06`) com desvio em dias face à data de referência. */
export function offsetDays(days: number): string {
  const date = new Date(referenceDate);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Marca temporal completa, por exemplo para horas de publicação. */
export function offsetDateTime(days: number, time = '09:00'): string {
  return `${offsetDays(days)}T${time}:00.000Z`;
}

/** Segunda-feira da semana em que cai a data de referência. */
export function startOfWeek(reference: Date = referenceDate): Date {
  const date = new Date(reference);
  const weekday = date.getUTCDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  date.setUTCDate(date.getUTCDate() + diff);
  return date;
}
