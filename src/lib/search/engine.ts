import { deburr } from '@/lib/utils';

/**
 * Pesquisa em texto integral sobre todos os conteúdos, incluindo o texto
 * extraído dos PDF. De propósito uma implementação própria e muito pequena em
 * vez de uma biblioteca externa: o acervo de um município é reduzido (alguns
 * milhares de documentos), a pesquisa corre no servidor e o pacote da página
 * inicial mantém-se intacto.
 *
 * Se o acervo passar de alguns milhares de registos, mudar para o Pagefind
 * ou o Typesense é trocar este ficheiro — a assinatura de
 * `search()` bleibt.
 */

export type SearchType =
  | 'servico'
  | 'noticia'
  | 'evento'
  | 'documento'
  | 'consulta'
  | 'reuniao'
  | 'pagina'
  | 'freguesia';

export interface SearchDocument {
  id: string;
  type: SearchType;
  /** Rubrica usada na faceta («Urbanismo», «Ambiente» …). */
  section: string;
  title: string;
  summary: string;
  /** Texto integral: corpo, ordens de trabalhos e texto extraído dos PDF. */
  body: string;
  href: string;
  year?: number;
  date?: string;
  /** Se o termo só surgir no texto do PDF, o resultado assinala-o. */
  fileText?: string;
}

export interface SearchHit {
  document: SearchDocument;
  score: number;
  /** Excerto de texto com o termo encontrado, para a lista de resultados. */
  excerpt: string;
  matchedInFile: boolean;
}

export interface Facet {
  value: string;
  count: number;
}

export interface SearchResult {
  hits: SearchHit[];
  total: number;
  facets: { type: Facet[]; section: Facet[]; year: Facet[] };
  /** Sugestão em caso de gralha — só quando a pesquisa original deu pouco. */
  suggestion?: string;
}

/** As palavras vazias mais comuns do português não pesam na relevância. */
const STOPWORDS = new Set([
  'a', 'ao', 'aos', 'as', 'da', 'das', 'de', 'do', 'dos', 'e', 'em', 'na', 'nas', 'no', 'nos',
  'o', 'os', 'ou', 'para', 'pelo', 'pela', 'por', 'que', 'se', 'sem', 'sob', 'sobre', 'um', 'uma',
  'the', 'of', 'and', 'for', 'to', 'in', 'la', 'el', 'los', 'las', 'y', 'le', 'les', 'des', 'du',
]);

export function tokenize(text: string): string[] {
  return deburr(text)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

/** Levenshtein com corte antecipado — chega para tolerar gralhas. */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
      current.push(value);
      if (value < rowMin) rowMin = value;
    }
    if (rowMin > max) return max + 1;
    previous = current;
  }
  return previous[b.length];
}

function allowedTypos(term: string): number {
  if (term.length >= 7) return 2;
  if (term.length >= 4) return 1;
  return 0;
}

interface IndexedDocument {
  document: SearchDocument;
  /** Lista de palavras por campo, para a ponderação. */
  titleTokens: Set<string>;
  summaryTokens: Set<string>;
  bodyTokens: Map<string, number>;
  fileTokens: Set<string>;
}

export class SearchIndex {
  private readonly entries: IndexedDocument[];
  private readonly vocabulary: string[];

  constructor(documents: SearchDocument[]) {
    const vocabulary = new Set<string>();

    this.entries = documents.map((document) => {
      const titleTokens = new Set(tokenize(document.title));
      const summaryTokens = new Set(tokenize(document.summary));
      const fileTokens = new Set(tokenize(document.fileText ?? ''));
      const bodyTokens = new Map<string, number>();

      for (const token of tokenize(`${document.body} ${document.fileText ?? ''}`)) {
        bodyTokens.set(token, (bodyTokens.get(token) ?? 0) + 1);
      }

      for (const token of [...titleTokens, ...summaryTokens, ...bodyTokens.keys()]) {
        vocabulary.add(token);
      }

      return { document, titleTokens, summaryTokens, bodyTokens, fileTokens };
    });

    this.vocabulary = [...vocabulary];
  }

  get size(): number {
    return this.entries.length;
  }

  search(
    query: string,
    filters: { type?: string; section?: string; year?: string } = {},
  ): SearchResult {
    const terms = tokenize(query);

    if (terms.length === 0) {
      return { hits: [], total: 0, facets: { type: [], section: [], year: [] } };
    }

    let scored = this.score(terms);

    /**
     * Poucos resultados? Então procura-se também de forma tolerante.
     *
     * Os resultados exatos ficam sempre à frente e nunca são descartados:
     * quem escreve «cercea» e existe um documento com exatamente essa palavra
     * tem de a receber — mesmo que «cerca» devolvesse mais resultados.
     */
    let suggestion: string | undefined;
    if (scored.length < 3) {
      const corrected = terms.map((term) => this.nearestTerm(term) ?? term);
      if (corrected.join(' ') !== terms.join(' ')) {
        const fuzzy = this.score(corrected);
        const already = new Set(scored.map((hit) => hit.document.id));
        const extra = fuzzy.filter((hit) => !already.has(hit.document.id));
        if (extra.length > 0) {
          scored = [...scored, ...extra];
          suggestion = corrected.join(' ');
        }
      }
    }

    const facets = buildFacets(scored.map((hit) => hit.document));

    const filtered = scored.filter((hit) => {
      if (filters.type && hit.document.type !== filters.type) return false;
      if (filters.section && hit.document.section !== filters.section) return false;
      if (filters.year && String(hit.document.year ?? '') !== filters.year) return false;
      return true;
    });

    return { hits: filtered, total: filtered.length, facets, suggestion };
  }

  private score(terms: string[]): SearchHit[] {
    const hits: SearchHit[] = [];

    for (const entry of this.entries) {
      let score = 0;
      let matchedTerms = 0;
      let onlyInFile = true;

      for (const term of terms) {
        let termScore = 0;

        if (entry.titleTokens.has(term)) {
          termScore += 12;
          onlyInFile = false;
        } else if ([...entry.titleTokens].some((token) => token.startsWith(term))) {
          termScore += 7;
          onlyInFile = false;
        }

        if (entry.summaryTokens.has(term)) {
          termScore += 5;
          onlyInFile = false;
        }

        const bodyCount = entry.bodyTokens.get(term);
        if (bodyCount) {
          termScore += Math.min(4, 1 + Math.log2(bodyCount));
          if (!entry.fileTokens.has(term)) onlyInFile = false;
        }

        if (termScore > 0) matchedTerms += 1;
        score += termScore;
      }

      if (matchedTerms === 0) continue;

      // Acertar em todos os termos pesa mais do que muitas ocorrências de um só.
      score *= 1 + (matchedTerms - 1) * 0.5;

      // Em caso de relevância igual, o mais recente vem primeiro.
      if (entry.document.date) {
        const ageYears =
          (Date.now() - new Date(entry.document.date).getTime()) / (365 * 24 * 3600 * 1000);
        score += Math.max(0, 2 - ageYears * 0.4);
      }

      hits.push({
        document: entry.document,
        score,
        excerpt: buildExcerpt(entry.document, terms),
        matchedInFile: onlyInFile,
      });
    }

    return hits.sort((a, b) => b.score - a.score);
  }

  /** Palavra mais próxima do vocabulário, dentro das gralhas permitidas. */
  private nearestTerm(term: string): string | undefined {
    const max = allowedTypos(term);
    if (max === 0) return undefined;

    let best: string | undefined;
    let bestDistance = max + 1;

    for (const candidate of this.vocabulary) {
      const distance = editDistance(term, candidate, max);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = candidate;
        if (distance === 1) break;
      }
    }

    return bestDistance <= max ? best : undefined;
  }
}

function buildExcerpt(document: SearchDocument, terms: string[]): string {
  const haystack = document.summary || document.body || document.fileText || '';
  const normalized = deburr(haystack).toLowerCase();

  let position = -1;
  for (const term of terms) {
    const found = normalized.indexOf(term);
    if (found !== -1 && (position === -1 || found < position)) position = found;
  }

  if (position === -1) return haystack.slice(0, 180).trim();

  const start = Math.max(0, haystack.lastIndexOf(' ', Math.max(0, position - 70)));
  const end = Math.min(haystack.length, position + 130);
  return `${start > 0 ? '…' : ''}${haystack.slice(start, end).trim()}${end < haystack.length ? '…' : ''}`;
}

function buildFacets(documents: SearchDocument[]): SearchResult['facets'] {
  const count = (values: (string | undefined)[]): Facet[] => {
    const map = new Map<string, number>();
    for (const value of values) {
      if (!value) continue;
      map.set(value, (map.get(value) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([value, total]) => ({ value, count: total }))
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, 'pt-PT'));
  };

  return {
    type: count(documents.map((doc) => doc.type)),
    section: count(documents.map((doc) => doc.section)),
    year: count(documents.map((doc) => (doc.year ? String(doc.year) : undefined))),
  };
}
