'use client';

import * as Popover from '@radix-ui/react-popover';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { localeNames, locales, localePath, stripLocale, type Locale } from '@/i18n/config';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

/**
 * Sprachumschalter. Er behält den Kontext: wer auf /en/servicos/urbanismo ist
 * und auf Français wechselt, landet auf /fr/servicos/urbanismo – nicht auf der
 * Startseite.
 *
 * Aktive Filter (Suchparameter) werden beim Klick übernommen. Sie fließen
 * bewusst nicht ins `href`: `useSearchParams()` würde die ganze Seite in
 * clientseitiges Rendern zwingen und das Vorrendern der Startseite verhindern.
 */
export function LanguageSwitcher({
  locale,
  label,
  changeLabel,
}: {
  locale: Locale;
  label: string;
  changeLabel: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { path } = stripLocale(pathname);

  return (
    <Popover.Root>
      <Popover.Trigger
        className={cn(
          'inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 py-1',
          'text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white',
        )}
        aria-label={`${changeLabel} — ${localeNames[locale]}`}
      >
        <Icon name="globe" size={16} />
        <span className="uppercase">{locale}</span>
        <Icon name="chevronDown" size={14} />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={6}
          align="end"
          className="z-50 min-w-48 rounded-md border border-line bg-surface p-1 shadow-[var(--shadow-2)]"
        >
          <p className="px-3 py-2 text-xs font-semibold tracking-wide text-ink-muted uppercase">
            {label}
          </p>
          <ul>
            {locales.map((code) => (
              <li key={code}>
                <Link
                  href={localePath(code, path)}
                  hrefLang={code}
                  lang={code}
                  aria-current={code === locale ? 'true' : undefined}
                  onClick={(event) => {
                    const search = window.location.search;
                    if (!search) return;
                    event.preventDefault();
                    router.push(`${localePath(code, path)}${search}`);
                  }}
                  className={cn(
                    'flex min-h-11 items-center justify-between gap-3 rounded-md px-3 no-underline',
                    'text-ink hover:bg-primary-100',
                    code === locale && 'font-semibold',
                  )}
                >
                  {localeNames[code]}
                  {code === locale ? (
                    <Icon name="check" size={16} className="text-accent-600" />
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
