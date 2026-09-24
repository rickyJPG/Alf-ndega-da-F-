import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import '@/styles/globals.css';

import { getDictionary } from '@/i18n';
import { isLocale, localeHtmlLang, localePath, locales, type Locale } from '@/i18n/config';
import { site } from '@/lib/site';
import { preferencesBootstrapScript } from '@/lib/preferences';
import { governmentOrganizationJsonLd, websiteJsonLd, languageAlternates, absoluteUrl } from '@/lib/seo';
import { getActiveAlerts } from '@/content';
import { portalBloqueado } from '@/lib/admin/bloqueio';

import { JsonLd } from '@/components/seo/json-ld';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { AlertBar } from '@/components/layout/alert-bar';
import { CookieConsent } from '@/components/layout/cookie-consent';
import { Analytics } from '@/components/layout/analytics';
import { BackToTop } from '@/components/layout/back-to-top';
import { ServiceWorkerRegistration } from '@/components/layout/service-worker';
import { PortalBloqueado } from '@/components/layout/portal-bloqueado';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Zoom nie sperren – WCAG 1.4.4.
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#08283D' },
    { media: '(prefers-color-scheme: dark)', color: '#04121C' },
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const dict = getDictionary(locale);
  const bloqueado = await portalBloqueado();

  return {
    metadataBase: new URL(site.url),
    title: {
      default: `${site.name}`,
      template: `%s · ${site.shortName}`,
    },
    description: dict.home.heroSubtitle,
    applicationName: site.name,
    manifest: '/manifest.webmanifest',
    alternates: {
      canonical: absoluteUrl(localePath(locale, '/')),
      languages: languageAlternates('/'),
    },
    icons: {
      icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    },
    formatDetection: { telephone: true, address: true },
    // Enquanto o interruptor estiver ligado, o ecrã de bloqueio não tem
    // nada que interesse a um motor de busca — nem que fique indexado à
    // espera de ser desbloqueado.
    ...(bloqueado ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale = raw as Locale;
  const dict = getDictionary(locale);

  // Verificado antes de tudo o resto: se o interruptor estiver ligado, não
  // vale a pena ir buscar avisos nem preparar a página — mostra-se logo o
  // ecrã de bloqueio. `/admin` não passa por este layout, por isso continua
  // acessível para o desligar.
  const bloqueado = await portalBloqueado();

  if (bloqueado) {
    return (
      <html lang={localeHtmlLang[locale]}>
        <body>
          <PortalBloqueado />
        </body>
      </html>
    );
  }

  const alerts = await getActiveAlerts();

  return (
    <html lang={localeHtmlLang[locale]} suppressHydrationWarning>
      <head>
        {/* Corre antes da primeira pintura: sem cintilação nem salto do layout. */}
        <script dangerouslySetInnerHTML={{ __html: preferencesBootstrapScript }} />
        <link
          rel="preload"
          href="/fonts/inter-400-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/source-serif-4-600-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <JsonLd data={[await governmentOrganizationJsonLd(), websiteJsonLd(locale)]} />

        {/* Ligações de salto — primeiro conteúdo focável da página. */}
        <a href="#conteudo" className="sr-only-focusable">
          {dict.common.skipToContent}
        </a>
        <a href="#pesquisa-cabecalho" className="sr-only-focusable">
          {dict.common.skipToSearch}
        </a>

        <AlertBar alerts={alerts} locale={locale} dict={dict} />
        <SiteHeader locale={locale} dict={dict} />

        <main id="conteudo" tabIndex={-1} className="outline-none">
          {children}
        </main>

        <SiteFooter locale={locale} dict={dict} />

        <BackToTop label={dict.common.backToTop} />
        <CookieConsent locale={locale} dict={dict} />
        <Analytics />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
