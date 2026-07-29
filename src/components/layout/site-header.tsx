import Image from 'next/image';
import Link from 'next/link';
import { site } from '@/lib/site';
import { navLabel, utilityLinks } from '@/lib/navigation';
import { localePath, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { Icon, type IconName } from '@/components/ui/icon';
import { PadraoCerejeira } from './flor-de-cerejeira';
import { MainNav } from './main-nav';
import { MobileNav } from './mobile-nav';
import { HeaderSearch } from './header-search';
import { LanguageSwitcher } from './language-switcher';
import { AccessibilityPanel } from './accessibility-panel';

/**
 * Cabeçalho — a estrutura e as cores do sítio oficial, medidas ao píxel a
 * partir da própria página:
 *
 *   1. barra de serviço, vermelho escuro (#8C0404): redes sociais, área de
 *      munícipe, newsletter, acessibilidade e idioma;
 *   2. banda de identidade, vermelho (#A40C04) com o padrão de flores de
 *      cerejeira e o logótipo branco do Município, mais a pesquisa com o
 *      botão verde (#8CA404);
 *   3. banda de navegação rosé (#C46C64) com os menus em blocos bordeaux
 *      (#640404) — o item ativo fica branco, como no original.
 *
 * O logótipo é o oficial (público/images/logotipo-branco.png). O corpo das
 * páginas continua claro; a cor vive toda no cabeçalho, como no original.
 */
export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const socialIcon: Record<string, IconName> = {
    Facebook: 'facebook',
    YouTube: 'youtube',
    Instagram: 'instagram',
  };

  return (
    <header data-print="hide">
      {/* 1 — Barra de serviço */}
      <div className="bg-accent-800 text-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-x-4 py-0.5">
          <ul className="flex items-center gap-0.5">
            <li className="me-1 hidden text-sm text-white/85 sm:block">{dict.footer.followUs}</li>
            {site.social.map((entry) => (
              <li key={entry.label}>
                <a
                  href={entry.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={entry.label}
                  className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-md text-white/90 hover:bg-white/10 hover:text-white"
                >
                  <Icon name={socialIcon[entry.label] ?? 'external'} size={16} />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-0.5">
            <ul className="flex items-center gap-0.5">
              {utilityLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={localePath(locale, item.href)}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 py-1 text-sm text-white/90 no-underline hover:bg-white/10 hover:text-white"
                  >
                    <Icon name={item.href.includes('contactos') ? 'phone' : 'key'} size={15} />
                    {navLabel(item, locale)}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="#footer-newsletter"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 py-1 text-sm text-white/90 no-underline hover:bg-white/10 hover:text-white"
                >
                  <Icon name="mail" size={15} />
                  {dict.footer.newsletterTitle}
                </a>
              </li>
            </ul>
            <AccessibilityPanel locale={locale} dict={dict} />
            <LanguageSwitcher
              locale={locale}
              label={dict.utility.language}
              changeLabel={dict.utility.changeLanguage}
            />
          </div>
        </div>
      </div>

      {/* 2 — Banda de identidade: vermelho oficial com flores de cerejeira */}
      <div className="relative bg-accent-600">
        <PadraoCerejeira className="absolute inset-0 h-full w-full" />
        <div className="container-page relative flex flex-wrap items-center justify-between gap-x-8 gap-y-4 py-5">
          <Link
            href={localePath(locale, '/')}
            className="no-underline"
            aria-label={`${site.name} — ${dict.common.home}`}
          >
            <Image
              src="/images/logotipo-branco.png"
              alt=""
              width={639}
              height={256}
              priority
              className="h-[4.5rem] w-auto sm:h-[5.5rem]"
            />
          </Link>

          <div className="order-3 w-full lg:order-2 lg:w-auto lg:max-w-md lg:flex-1">
            <HeaderSearch
              locale={locale}
              label={dict.common.searchLabel}
              placeholder={dict.common.searchPlaceholder}
              submitLabel={dict.common.search}
            />
          </div>

          <div className="order-2 lg:order-3">
            <MobileNav locale={locale} dict={dict} />
          </div>
        </div>
      </div>

      {/* 3 — Banda de navegação rosé com blocos bordeaux */}
      <div className="relative bg-rosa">
        <div className="container-page">
          <MainNav locale={locale} label={dict.nav.main} />
        </div>
      </div>
    </header>
  );
}
