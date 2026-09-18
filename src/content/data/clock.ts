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

/**
 * O instante «agora», respeitando `MOCK_TODAY`.
 *
 * Diferente de `referenceDate` num ponto que interessa: aquela é calculada
 * uma vez, ao carregar o módulo, e é o que os dados de exemplo usam para
 * ficarem estáveis. Esta é calculada a cada chamada — um servidor que fique
 * meses ligado continua a contar os dias, em vez de ficar preso na hora em
 * que arrancou.
 */
export function agora(): Date {
  const override = process.env.MOCK_TODAY;
  if (override && /^\d{4}-\d{2}-\d{2}$/.test(override)) {
    // Meio-dia UTC: longe o suficiente das extremidades para que nenhum
    // fuso horário faça a data saltar para o dia anterior ou seguinte.
    return new Date(`${override}T12:00:00.000Z`);
  }
  return new Date();
}

/**
 * O dia de hoje em ISO (`2026-07-25`) — a data contra a qual se decide o que
 * está em vigor: que avisos aparecem, que consultas estão abertas, que
 * eventos ainda não passaram.
 *
 * Só para código de servidor. Num componente de cliente, `MOCK_TODAY` não
 * existe, e usá-la daria datas diferentes no servidor e no navegador.
 */
export function hojeIso(): string {
  return agora().toISOString().slice(0, 10);
}

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
