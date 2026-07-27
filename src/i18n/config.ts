export const locales = ['pt', 'en', 'es', 'fr'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'pt';

export const localeNames: Record<Locale, string> = {
  pt: 'Português',
  en: 'English',
  es: 'Español',
  fr: 'Français',
};

/** Wird im <html lang>-Attribut und in hreflang verwendet. */
export const localeHtmlLang: Record<Locale, string> = {
  pt: 'pt-PT',
  en: 'en',
  es: 'es',
  fr: 'fr',
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Baut eine URL für eine Sprache. Portugiesisch ist Standard und bekommt
 * kein Präfix, die übrigen Sprachen laufen unter /en, /es, /fr.
 * Die Pfadsegmente bleiben portugiesisch – der Sprachumschalter behält
 * dadurch immer den Kontext der aktuellen Seite.
 */
export function localePath(locale: Locale, path = '/'): string {
  const clean = path === '' ? '/' : path.startsWith('/') ? path : `/${path}`;
  if (locale === defaultLocale) return clean;
  return clean === '/' ? `/${locale}` : `/${locale}${clean}`;
}

/** Entfernt ein vorhandenes Sprachpräfix – Gegenstück zu localePath(). */
export function stripLocale(pathname: string): { locale: Locale; path: string } {
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];
  if (first && isLocale(first)) {
    const rest = `/${segments.slice(1).join('/')}`;
    return { locale: first, path: rest === '/' ? '/' : rest.replace(/\/$/, '') };
  }
  return { locale: defaultLocale, path: pathname === '' ? '/' : pathname };
}

/** Beste Sprache aus dem Accept-Language-Header, ohne Fremdbibliothek. */
export function negotiateLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;
  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.find((p) => p.trim().startsWith('q='));
      return { tag: tag.toLowerCase(), q: q ? Number.parseFloat(q.split('=')[1]) || 0 : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    const base = tag.split('-')[0];
    if (isLocale(base)) return base;
  }
  return defaultLocale;
}
