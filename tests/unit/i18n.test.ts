import { describe, expect, it } from 'vitest';
import { pt } from '@/i18n/dictionaries/pt';
import { en } from '@/i18n/dictionaries/en';
import { es } from '@/i18n/dictionaries/es';
import { fr } from '@/i18n/dictionaries/fr';
import { fill } from '@/i18n';
import { defaultLocale, isLocale, localePath, stripLocale } from '@/i18n/config';

type Nested = Record<string, unknown>;

function flatten(value: Nested, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, entry]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
      return flatten(entry as Nested, path);
    }
    return [path];
  });
}

describe('dicionários', () => {
  const reference = flatten(pt as unknown as Nested).sort();

  it.each([
    ['en', en],
    ['es', es],
    ['fr', fr],
  ])('%s tem exatamente as mesmas chaves que o português', (_name, dictionary) => {
    expect(flatten(dictionary as unknown as Nested).sort()).toEqual(reference);
  });

  it.each([
    ['pt', pt],
    ['en', en],
    ['es', es],
    ['fr', fr],
  ])('%s não tem valores vazios', (_name, dictionary) => {
    const empty: string[] = [];
    const walk = (value: Nested, prefix = '') => {
      for (const [key, entry] of Object.entries(value)) {
        const path = prefix ? `${prefix}.${key}` : key;
        if (entry && typeof entry === 'object') walk(entry as Nested, path);
        else if (typeof entry === 'string' && entry.trim() === '') empty.push(path);
      }
    };
    walk(dictionary as unknown as Nested);
    expect(empty).toEqual([]);
  });

  it('os dicionários são serializáveis (podem passar para componentes de cliente)', () => {
    // Uma função dentro do dicionário rebentaria o build do Next.
    expect(() => JSON.stringify(pt)).not.toThrow();
    const roundTrip = JSON.parse(JSON.stringify(pt));
    expect(flatten(roundTrip).sort()).toEqual(reference);
  });

  it('substitui os marcadores nas mensagens com variáveis', () => {
    expect(fill(pt.consultations.endsInDays, { days: 12 })).toBe('Termina em 12 dias');
    expect(fill(en.booking.slotsAvailable, { n: 5 })).toBe('5 times available');
    expect(fill(pt.footer.copyright, { year: 2026 })).toContain('2026');
  });
});

describe('encaminhamento de idioma', () => {
  it('o português não leva prefixo; as outras línguas levam', () => {
    expect(localePath('pt', '/servicos')).toBe('/servicos');
    expect(localePath('pt', '/')).toBe('/');
    expect(localePath('en', '/servicos')).toBe('/en/servicos');
    expect(localePath('fr', '/')).toBe('/fr');
  });

  it('retira o prefixo mantendo o resto do caminho', () => {
    expect(stripLocale('/en/servicos/urbanismo')).toEqual({
      locale: 'en',
      path: '/servicos/urbanismo',
    });
    expect(stripLocale('/servicos')).toEqual({ locale: 'pt', path: '/servicos' });
    expect(stripLocale('/fr')).toEqual({ locale: 'fr', path: '/' });
  });

  it('o troca-idiomas mantém o contexto da página', () => {
    const { path } = stripLocale('/en/servicos/urbanismo/licenca-de-construcao');
    expect(localePath('fr', path)).toBe('/fr/servicos/urbanismo/licenca-de-construcao');
  });

  it('o português é a língua predefinida do portal', () => {
    // Um caminho sem prefixo é sempre português — o cabeçalho Accept-Language
    // do navegador não altera a língua de um portal municipal.
    expect(defaultLocale).toBe('pt');
    expect(stripLocale('/servicos/certidoes').locale).toBe('pt');
    expect(isLocale('de')).toBe(false);
  });
});
