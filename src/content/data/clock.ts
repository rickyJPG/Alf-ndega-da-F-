/**
 * Zeitachse der Beispieldaten.
 *
 * Fristgebundene Inhalte (Konsultationen, Termine, Waldbrandstufe, freie
 * Sprechzeiten) sind relativ zum Referenzdatum angelegt. Dadurch zeigt die
 * Demo immer laufende Fristen statt abgelaufener – und „termina em 12 dias“
 * bleibt eine echte Aussage.
 *
 * Für reproduzierbare Builds und Tests lässt sich das Referenzdatum über die
 * Umgebungsvariable MOCK_TODAY (`YYYY-MM-DD`) festnageln.
 *
 * Archivinhalte (Nachrichten, Sitzungen, Haushalt) tragen dagegen feste
 * Datumsangaben – sie sollen sich nicht mit jedem Build verschieben.
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

/** ISO-Datum (`2026-08-06`) mit Versatz in Tagen zum Referenzdatum. */
export function offsetDays(days: number): string {
  const date = new Date(referenceDate);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Vollständiger Zeitstempel, z. B. für Veröffentlichungszeiten. */
export function offsetDateTime(days: number, time = '09:00'): string {
  return `${offsetDays(days)}T${time}:00.000Z`;
}

/** Montag der Woche, in der das Referenzdatum liegt. */
export function startOfWeek(reference: Date = referenceDate): Date {
  const date = new Date(reference);
  const weekday = date.getUTCDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  date.setUTCDate(date.getUTCDate() + diff);
  return date;
}
