export const locales = ['pt', 'en', 'es', 'fr'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'pt';

export const localeNames: Record<Locale, string> = {
  pt: 'Português',
  en: 'English',
  es: 'Español',
  fr: 'Français',
};

/** Usado no atributo <html lang> e nas ligações hreflang. */
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
 * Constrói o endereço de uma página numa dada língua. O português é a língua
 * predefinida e não leva prefixo; as restantes vivem em /en, /es e /fr.
 * Os segmentos do caminho mantêm-se sempre em português, para que o seletor
 * de idioma não perca a página onde o munícipe está.
 */
export function localePath(locale: Locale, path = '/'): string {
  const clean = path === '' ? '/' : path.startsWith('/') ? path : `/${path}`;
  if (locale === defaultLocale) return clean;
  return clean === '/' ? `/${locale}` : `/${locale}${clean}`;
}

/** Retira o prefixo de idioma, se existir — o inverso de localePath(). */
export function stripLocale(pathname: string): { locale: Locale; path: string } {
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];
  if (first && isLocale(first)) {
    const rest = `/${segments.slice(1).join('/')}`;
    return { locale: first, path: rest === '/' ? '/' : rest.replace(/\/$/, '') };
  }
  return { locale: defaultLocale, path: pathname === '' ? '/' : pathname };
}
