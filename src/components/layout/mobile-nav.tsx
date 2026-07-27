'use client';

import * as Dialog from '@radix-ui/react-dialog';
import * as Accordion from '@radix-ui/react-accordion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { mainNavigation, navLabel, utilityLinks } from '@/lib/navigation';
import { localePath, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

/**
 * Echtes Mobil-Menü: Vollbild-Dialog mit Fokusfalle, Escape schließt,
 * der Hintergrund ist für Screenreader inert. Zweite Ebene als Akkordeon,
 * damit nichts hinter unsichtbaren Hover-Menüs verschwindet.
 */
export function MobileNav({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Beim Seitenwechsel schließen – sonst bleibt der Dialog über der neuen Seite.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        className={cn(
          'inline-flex min-h-11 items-center gap-2 rounded-md px-3 py-2 font-semibold',
          'text-white hover:bg-white/10 lg:hidden',
        )}
      >
        <Icon name="menu" size={22} />
        {dict.common.menu}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-primary-900/60" />
        <Dialog.Content
          className={cn(
            'fixed inset-y-0 end-0 z-50 flex w-full max-w-md flex-col',
            'bg-surface shadow-[var(--shadow-2)] outline-none',
          )}
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <Dialog.Title className="font-serif text-xl font-semibold">
              {dict.common.menu}
            </Dialog.Title>
            <Dialog.Close
              className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 font-semibold text-ink hover:bg-surface-alt"
              aria-label={dict.common.closeMenu}
            >
              <Icon name="close" size={22} />
              {dict.common.close}
            </Dialog.Close>
          </div>

          <nav aria-label={dict.nav.main} className="flex-1 overflow-y-auto overscroll-contain">
            <Accordion.Root type="multiple" className="divide-y divide-line">
              {mainNavigation.map((section) => (
                <Accordion.Item key={section.id} value={section.id}>
                  <Accordion.Header>
                    <Accordion.Trigger className="group flex w-full items-center justify-between gap-3 px-4 py-4 text-start font-serif text-lg font-semibold">
                      {navLabel(section, locale)}
                      <Icon
                        name="chevronDown"
                        size={20}
                        className="text-primary-600 transition-transform group-data-[state=open]:rotate-180"
                      />
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="overflow-hidden pb-2">
                    <Link
                      href={localePath(locale, section.href)}
                      className="mx-4 mb-2 flex min-h-11 items-center gap-1.5 font-semibold text-primary-600 no-underline"
                    >
                      {dict.common.seeAll} — {navLabel(section, locale)}
                      <Icon name="arrowRight" size={16} />
                    </Link>
                    {section.groups.map((group) => (
                      <div key={group.id} className="px-4 pb-3">
                        <p className="py-1 text-xs font-semibold tracking-wide text-ink-muted uppercase">
                          {group.title[locale]}
                        </p>
                        <ul>
                          {group.items.map((item) => (
                            <li key={item.href}>
                              <Link
                                href={localePath(locale, item.href)}
                                className="flex min-h-11 items-center rounded-md px-2 text-ink no-underline hover:bg-primary-100"
                              >
                                {navLabel(item, locale)}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>

            <ul className="border-t border-line p-4">
              {utilityLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={localePath(locale, item.href)}
                    className="flex min-h-11 items-center gap-2 rounded-md px-2 font-semibold text-primary-700 no-underline hover:bg-primary-100"
                  >
                    <Icon name={item.href.includes('contactos') ? 'phone' : 'key'} size={18} />
                    {navLabel(item, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
