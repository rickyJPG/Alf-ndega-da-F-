'use client';

import * as RadixAccordion from '@radix-ui/react-accordion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from './icon';

/**
 * Aufklappbare Abschnitte auf Radix-Primitives – Tastaturbedienung,
 * aria-expanded und die Verknüpfung von Kopf und Inhalt kommen ab Werk.
 */
export function Accordion({
  items,
  defaultOpen,
  className,
}: {
  items: { id: string; title: string; content: ReactNode }[];
  defaultOpen?: string[];
  className?: string;
}) {
  return (
    <RadixAccordion.Root
      type="multiple"
      defaultValue={defaultOpen}
      className={cn('divide-y divide-line rounded-lg border border-line', className)}
    >
      {items.map((item) => (
        <RadixAccordion.Item key={item.id} value={item.id}>
          <RadixAccordion.Header>
            <RadixAccordion.Trigger
              className={cn(
                'group flex w-full items-center justify-between gap-4 px-4 py-4 text-start',
                'font-serif text-lg font-semibold hover:bg-surface-alt md:px-6',
              )}
            >
              {item.title}
              <Icon
                name="chevronDown"
                size={20}
                className="text-primary-600 transition-transform duration-[--motion-base] group-data-[state=open]:rotate-180"
              />
            </RadixAccordion.Trigger>
          </RadixAccordion.Header>
          <RadixAccordion.Content className="overflow-hidden">
            <div className="px-4 pb-5 md:px-6">{item.content}</div>
          </RadixAccordion.Content>
        </RadixAccordion.Item>
      ))}
    </RadixAccordion.Root>
  );
}
