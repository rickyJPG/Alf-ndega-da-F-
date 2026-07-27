'use client';

import * as RadixTabs from '@radix-ui/react-tabs';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

export function Tabs({
  items,
  defaultTab,
  label,
  className,
}: {
  items: TabItem[];
  defaultTab?: string;
  /** Dá nome ao grupo de separadores para os leitores de ecrã. */
  label: string;
  className?: string;
}) {
  return (
    <RadixTabs.Root defaultValue={defaultTab ?? items[0]?.id} className={className}>
      <RadixTabs.List
        aria-label={label}
        className="flex flex-wrap gap-1 border-b border-line"
      >
        {items.map((item) => (
          <RadixTabs.Trigger
            key={item.id}
            value={item.id}
            className={cn(
              'min-h-11 rounded-t-md border-b-2 border-transparent px-4 py-2 font-semibold',
              'text-ink-muted hover:bg-surface-alt hover:text-ink',
              'data-[state=active]:border-accent-600 data-[state=active]:text-ink',
            )}
          >
            {item.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {items.map((item) => (
        <RadixTabs.Content key={item.id} value={item.id} className="pt-6">
          {item.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  );
}
