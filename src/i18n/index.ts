import { defaultLocale, type Locale } from './config';
import { pt, type Dictionary } from './dictionaries/pt';
import { en } from './dictionaries/en';
import { es } from './dictionaries/es';
import { fr } from './dictionaries/fr';

const dictionaries: Record<Locale, Dictionary> = { pt, en, es, fr };

/**
 * Wörterbücher sind reine Datenmodule und werden mit dem Server-Bundle
 * ausgeliefert – kein zusätzlicher Netzwerk-Roundtrip, kein Client-JS.
 */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

/**
 * Platzhalter in einer Übersetzung ersetzen: `fill('Termina em {days} dias',
 * { days: 12 })`.
 *
 * Wörterbücher enthalten bewusst nur Zeichenketten, keine Funktionen – nur so
 * lassen sie sich an Client-Komponenten übergeben.
 */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

export type { Dictionary };
export * from './config';
