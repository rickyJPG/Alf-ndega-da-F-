import { NextResponse, type NextRequest } from 'next/server';
import { defaultLocale, isLocale, locales, negotiateLocale } from '@/i18n/config';

const LOCALE_COOKIE = 'cmadf_locale';

/**
 * Sprachrouting ohne Fremdbibliothek.
 *
 * Portugiesisch ist Standard und läuft ohne Präfix: /servicos/...
 * Intern liegt alles unter /[locale]/..., deshalb wird der pt-Pfad
 * unsichtbar auf /pt/... umgeschrieben (rewrite, keine Weiterleitung).
 * /en, /es und /fr bleiben in der Adresszeile stehen.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const firstSegment = pathname.split('/')[1] ?? '';

  // /pt/... ist ein Duplikat der kanonischen URL -> dauerhaft auf / umleiten.
  if (firstSegment === defaultLocale) {
    const stripped = pathname.slice(defaultLocale.length + 1) || '/';
    const url = request.nextUrl.clone();
    url.pathname = stripped;
    return NextResponse.redirect(url, 308);
  }

  if (isLocale(firstSegment)) {
    const response = NextResponse.next();
    response.cookies.set(LOCALE_COOKIE, firstSegment, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false,
    });
    return response;
  }

  // Erstbesuch ohne Präfix: gespeicherte Wahl respektieren, sonst Accept-Language.
  const stored = request.cookies.get(LOCALE_COOKIE)?.value;
  if (!stored) {
    const preferred = negotiateLocale(request.headers.get('accept-language'));
    if (preferred !== defaultLocale) {
      const url = request.nextUrl.clone();
      url.pathname = `/${preferred}${pathname === '/' ? '' : pathname}`;
      return NextResponse.redirect(url, 307);
    }
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`;
  url.search = search;
  return NextResponse.rewrite(url);
}

export const config = {
  /**
   * Alles außer Next-Interna, API-Routen und Dateien mit Endung.
   * `sw.js`, `manifest.webmanifest` und die Schriften bleiben unberührt.
   */
  matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'],
};

export { LOCALE_COOKIE, locales };
