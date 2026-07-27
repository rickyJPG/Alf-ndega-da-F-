import Link from 'next/link';
import { site } from '@/lib/site';
import { navLabel, utilityLinks } from '@/lib/navigation';
import { localePath, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { Icon } from '@/components/ui/icon';
import { Wordmark } from './brasao';
import { MainNav } from './main-nav';
import { MobileNav } from './mobile-nav';
import { HeaderSearch } from './header-search';
import { LanguageSwitcher } from './language-switcher';
import { AccessibilityPanel } from './accessibility-panel';

/**
 * Cabeçalho, em três faixas — a estrutura habitual de um portal municipal
 * português, que a maioria das pessoas já reconhece:
 *
 *   1. barra de serviço, clara: área de munícipe, contactos, acessibilidade
 *      e idioma;
 *   2. faixa de identidade, branca: brasão, designação oficial e pesquisa;
 *   3. barra de navegação, vermelho cereja — a assinatura visual do concelho.
 *
 * O cabeçalho é deliberadamente claro: a única superfície de cor é a barra
 * de navegação. Grandes áreas escuras davam ao portal um peso que o sítio
 * original nunca teve.
 *
 * Só o mega-menu, o menu móvel, o troca-idiomas e o painel de acessibilidade
 * correm no cliente. O resto é renderizado no servidor.
 */
export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <header data-print="hide">
      {/* 1 — Barra de serviço */}
      <div className="border-b border-line bg-surface-alt">
        <div className="container-page flex items-center justify-between gap-4 py-1">
          <ul className="flex items-center gap-1">
            {utilityLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={localePath(locale, item.href)}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-primary-700 no-underline hover:bg-primary-100"
                >
                  <Icon name={item.href.includes('contactos') ? 'phone' : 'key'} size={15} />
                  {navLabel(item, locale)}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1">
            <AccessibilityPanel locale={locale} dict={dict} />
            <LanguageSwitcher
              locale={locale}
              label={dict.utility.language}
              changeLabel={dict.utility.changeLanguage}
            />
          </div>
        </div>
      </div>

      {/* 2 — Faixa de identidade */}
      <div className="border-b border-line bg-surface">
        <div className="container-page flex flex-wrap items-center justify-between gap-x-6 gap-y-4 py-4">
          <Link
            href={localePath(locale, '/')}
            className="no-underline"
            aria-label={`${site.name} — ${dict.common.home}`}
          >
            <Wordmark />
          </Link>

          <div className="order-3 w-full lg:order-2 lg:w-auto lg:max-w-sm lg:flex-1">
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

      {/* 3 — Barra de navegação */}
      <div className="relative bg-accent-600">
        <div className="container-page">
          <MainNav locale={locale} label={dict.nav.main} />
        </div>
      </div>
    </header>
  );
}
