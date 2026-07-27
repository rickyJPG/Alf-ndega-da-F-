'use client';

import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { mainNavigation, navDescription, navLabel } from '@/lib/navigation';
import { localePath, stripLocale, type Locale } from '@/i18n/config';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';

/**
 * Navegação principal com mega-menu.
 *
 * O NavigationMenu do Radix já traz a operação por teclado: setas entre
 * entradas, Enter ou barra de espaço para abrir, Escape para fechar e o foco
 * volta ao botão de origem. No máximo dois níveis, como fixado na arquitetura
 * de informação.
 */
export function MainNav({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname();
  const { path } = stripLocale(pathname);

  return (
    <NavigationMenu.Root delayDuration={120} className="relative hidden lg:block">
      <NavigationMenu.List
        aria-label={label}
        className="flex items-stretch gap-1"
      >
        {mainNavigation.map((section) => {
          const isActive = path === section.href || path.startsWith(`${section.href}/`);

          return (
            <NavigationMenu.Item key={section.id}>
              <NavigationMenu.Trigger
                className={cn(
                  'group flex min-h-12 items-center gap-1.5 px-4 py-2 font-semibold',
                  'text-white hover:bg-black/15',
                  'data-[state=open]:bg-black/20',
                )}
              >
                <span
                  className={cn(
                    'border-b-2 pb-0.5',
                    isActive ? 'border-white' : 'border-transparent',
                  )}
                >
                  {navLabel(section, locale)}
                </span>
                <Icon
                  name="chevronDown"
                  size={16}
                  className="transition-transform duration-[--motion-fast] group-data-[state=open]:rotate-180"
                />
              </NavigationMenu.Trigger>

              <NavigationMenu.Content
                className={cn(
                  'absolute start-0 top-full z-50 w-full',
                  'data-[motion=from-start]:animate-none data-[motion=from-end]:animate-none',
                )}
              >
                <div className="mt-1 rounded-lg border border-line bg-surface shadow-[var(--shadow-2)]">
                  <div className="flex items-start justify-between gap-8 border-b border-line px-6 py-4">
                    <p className="measure text-ink-muted">{navDescription(section, locale) ?? section.description[locale]}</p>
                    <NavigationMenu.Link asChild>
                      <Link
                        href={localePath(locale, section.href)}
                        className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-primary-600 no-underline hover:underline underline-offset-[0.2em]"
                      >
                        {navLabel(section, locale)}
                        <Icon name="arrowRight" size={16} />
                      </Link>
                    </NavigationMenu.Link>
                  </div>

                  <ul
                    className={cn(
                      'grid gap-x-8 gap-y-6 px-6 py-6',
                      section.groups.length >= 4
                        ? 'grid-cols-4'
                        : section.groups.length === 3
                          ? 'grid-cols-3'
                          : 'grid-cols-2',
                    )}
                  >
                    {section.groups.map((group) => (
                      <li key={group.id}>
                        <p className="mb-3 text-xs font-semibold tracking-wide text-ink-muted uppercase">
                          {group.title[locale]}
                        </p>
                        <ul className="flex flex-col gap-1">
                          {group.items.map((item) => (
                            <li key={item.href}>
                              <NavigationMenu.Link asChild>
                                <Link
                                  href={localePath(locale, item.href)}
                                  className={cn(
                                    'block rounded-md px-2 py-2 no-underline',
                                    'hover:bg-primary-100',
                                    item.featured && 'font-semibold',
                                  )}
                                >
                                  <span className="flex items-center gap-1.5 text-ink">
                                    {navLabel(item, locale)}
                                    {item.featured ? (
                                      <span
                                        aria-hidden="true"
                                        className="size-1.5 rounded-pill bg-accent-600"
                                      />
                                    ) : null}
                                  </span>
                                  {navDescription(item, locale) ? (
                                    <span className="mt-0.5 block text-sm font-normal text-ink-muted">
                                      {navDescription(item, locale)}
                                    </span>
                                  ) : null}
                                </Link>
                              </NavigationMenu.Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </div>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          );
        })}
      </NavigationMenu.List>

      <div className="absolute start-0 top-full flex w-full justify-center">
        <NavigationMenu.Viewport className="w-full" />
      </div>
    </NavigationMenu.Root>
  );
}
