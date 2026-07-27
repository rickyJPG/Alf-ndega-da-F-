import Link from 'next/link';
import { site } from '@/lib/site';
import { navLabel, utilityLinks } from '@/lib/navigation';
import { localePath, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { Icon } from '@/components/ui/icon';
import { Brasao } from './brasao';
import { MainNav } from './main-nav';
import { MobileNav } from './mobile-nav';
import { HeaderSearch } from './header-search';
import { LanguageSwitcher } from './language-switcher';
import { AccessibilityPanel } from './accessibility-panel';

/**
 * Kopfbereich: Utility-Leiste, Wortmarke, Hauptnavigation, sichtbare Suche.
 *
 * Der größte Teil ist ein Server-Component. Nur das Mega-Menü, das Mobil-Menü,
 * der Sprachumschalter und das Barrierefreiheits-Panel laufen im Client.
 */
export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <header className="bg-primary-900 text-white" data-print="hide">
      {/* Utility-Leiste */}
      <div className="border-b border-white/10">
        <div className="container-page flex items-center justify-between gap-4 py-1">
          <ul className="flex items-center gap-1">
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

      {/* Wortmarke + Suche */}
      <div className="container-page flex flex-wrap items-center justify-between gap-4 py-4">
        <Link
          href={localePath(locale, '/')}
          className="flex items-center gap-3 no-underline"
          aria-label={`${site.name} — ${dict.common.home}`}
        >
          <Brasao size={46} className="text-white" />
          <span className="flex flex-col leading-tight">
            <span className="font-serif text-xl font-semibold text-white">{site.shortName}</span>
            <span className="text-sm text-white/75">{site.tagline}</span>
          </span>
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

      {/* Hauptnavigation */}
      <div className="relative border-t border-white/10">
        <div className="container-page">
          <MainNav locale={locale} label={dict.nav.main} />
        </div>
      </div>
    </header>
  );
}
