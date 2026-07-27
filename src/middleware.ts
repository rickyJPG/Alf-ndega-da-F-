import { NextResponse, type NextRequest } from 'next/server';
import { defaultLocale, isLocale, locales } from '@/i18n/config';

const LOCALE_COOKIE = 'cmadf_locale';

/**
 * Encaminhamento de idioma, sem biblioteca externa.
 *
 * O português é a língua do portal e é sempre a predefinida: quem escreve
 * cm-alfandegadafe.pt recebe português, venha de onde vier. As outras línguas
 * existem para quem as escolher — sobretudo os emigrantes do concelho em
 * França, na Suíça e no Luxemburgo — e escolhem-se no seletor do topo.
 *
 * Deliberadamente NÃO se reencaminha com base no cabeçalho Accept-Language.
 * Um munícipe com o telemóvel configurado em inglês receberia o portal da sua
 * própria câmara em inglês, sem perceber porquê. Numa entidade pública, a
 * língua oficial não se adivinha.
 *
 * Internamente tudo vive em /[locale]/…, por isso o caminho português é
 * reescrito (rewrite, sem redirecionamento) para /pt/…; /en, /es e /fr ficam
 * visíveis na barra de endereço.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const firstSegment = pathname.split('/')[1] ?? '';

  // /pt/… é um duplicado do endereço canónico — redirecionar para a raiz.
  if (firstSegment === defaultLocale) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(defaultLocale.length + 1) || '/';
    return NextResponse.redirect(url, 308);
  }

  // Outra língua escolhida: servir e recordar a escolha.
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

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`;
  url.search = search;
  return NextResponse.rewrite(url);
}

export const config = {
  /**
   * Tudo exceto os internos do Next, as rotas de API e ficheiros com extensão.
   * `sw.js`, `manifest.webmanifest` e as fontes ficam de fora.
   */
  matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'],
};

export { LOCALE_COOKIE, locales };
