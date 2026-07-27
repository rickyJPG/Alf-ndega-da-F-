import { defaultLocale, type Locale } from './config';
import { pt, type Dictionary } from './dictionaries/pt';
import { en } from './dictionaries/en';
import { es } from './dictionaries/es';
import { fr } from './dictionaries/fr';

const dictionaries: Record<Locale, Dictionary> = { pt, en, es, fr };

/**
 * Os dicionários são módulos de dados puros e seguem no pacote do servidor —
 * sem ida extra à rede e sem JavaScript no cliente.
 */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

/**
 * Substitui os marcadores de uma tradução: `fill('Termina em {days} dias',
 * { days: 12 })`.
 *
 * Os dicionários contêm de propósito apenas texto e nenhuma função — só
 * assim podem ser passados a componentes de cliente.
 */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

export type { Dictionary };
export * from './config';
