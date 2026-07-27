/** Klassennamen zusammenführen – bewusst winzig, keine Abhängigkeit. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** Text auf Wortgrenze kürzen – nie mitten im Wort abschneiden. */
export function truncateWords(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : maxChars).replace(/[.,;:!?–-]$/, '')}…`;
}

/** Akzente entfernen – für Suche, Slugs und Sortierung. */
export function deburr(value: string): string {
  // ̀-ͯ = kombinierende diakritische Zeichen
  // eslint-disable-next-line no-misleading-character-class
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function slugify(value: string): string {
  return deburr(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Sortierung nach pt-PT-Kollation (Ç zwischen C und D, Akzente ignoriert). */
export function comparePt(a: string, b: string): number {
  return a.localeCompare(b, 'pt-PT', { sensitivity: 'base' });
}

export function uniqueBy<T, K>(items: readonly T[], key: (item: T) => K): T[] {
  const seen = new Set<K>();
  const out: T[] = [];
  for (const item of items) {
    const k = key(item);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}

export function groupBy<T, K extends string | number>(
  items: readonly T[],
  key: (item: T) => K,
): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of items) {
    const k = key(item);
    const bucket = map.get(k);
    if (bucket) bucket.push(item);
    else map.set(k, [item]);
  }
  return map;
}
