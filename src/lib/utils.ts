/** Junta nomes de classes — de propósito minúsculo, sem dependências. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** Corta o texto na fronteira da palavra — nunca a meio de uma palavra. */
export function truncateWords(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : maxChars).replace(/[.,;:!?–-]$/, '')}…`;
}

/** Remove acentos — para a pesquisa, os slugs e a ordenação. */
export function deburr(value: string): string {
  // U+0300–U+036F: kombinierende diakritische Zeichen
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function slugify(value: string): string {
  return deburr(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Ordenação pela colação pt-PT (Ç entre C e D, acentos ignorados). */
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
