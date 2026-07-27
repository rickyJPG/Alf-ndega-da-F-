'use client';

import { useMemo, useState } from 'react';
import type { BudgetYear } from '@/content/types';
import { tx } from '@/content/types';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format';
import { Icon, type IconName } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

/**
 * Haushalts-Explorer.
 *
 * Em vez de um PDF de 200 páginas: a despesa por área, aberta até à
 * subrubrica, com comparação com o ano anterior e exportação em CSV.
 *
 * As barras não vêm de nenhuma biblioteca de gráficos — são linhas de tabela
 * com uma barra por trás. O valor aparece sempre em número ao lado, para que
 * a leitura não dependa do comprimento da barra.
 */
export function BudgetExplorer({
  budget,
  locale,
  dict,
}: {
  budget: BudgetYear;
  locale: Locale;
  dict: Dictionary;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [compare, setCompare] = useState(true);

  const categories = useMemo(
    () => [...budget.categories].sort((a, b) => b.amount - a.amount),
    [budget.categories],
  );

  const max = categories[0]?.amount ?? 1;

  function downloadCsv() {
    const rows: string[][] = [
      ['area', 'subrubrica', 'ano', 'montante_eur', 'ano_anterior_eur', 'variacao_pct'],
    ];

    for (const category of categories) {
      const variation = (category.amount - category.previousAmount) / category.previousAmount;
      rows.push([
        tx(category.label, 'pt'),
        '',
        String(budget.year),
        String(category.amount),
        String(category.previousAmount),
        (variation * 100).toFixed(1),
      ]);
      for (const child of category.children ?? []) {
        const childVariation = (child.amount - child.previousAmount) / child.previousAmount;
        rows.push([
          tx(category.label, 'pt'),
          tx(child.label, 'pt'),
          String(budget.year),
          String(child.amount),
          String(child.previousAmount),
          (childVariation * 100).toFixed(1),
        ]);
      }
    }

    const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orcamento-${budget.year}-alfandega-da-fe.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2.5">
          <input
            type="checkbox"
            checked={compare}
            onChange={(event) => setCompare(event.target.checked)}
            className="size-5 rounded-sm border-2 border-line-strong accent-[var(--color-accent-600)]"
          />
          <span className="font-medium">{dict.transparency.comparePreviousYear}</span>
        </label>

        <button
          type="button"
          onClick={downloadCsv}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line-strong bg-surface px-4 font-semibold text-ink hover:bg-surface-alt"
        >
          <Icon name="download" size={18} />
          {dict.transparency.downloadCsv}
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {categories.map((category) => {
          const share = category.amount / budget.expense;
          const variation = (category.amount - category.previousAmount) / category.previousAmount;
          const isOpen = open === category.id;
          const hasChildren = (category.children?.length ?? 0) > 0;

          return (
            <li key={category.id} className="rounded-lg border border-line bg-surface">
              <div className="relative overflow-hidden rounded-lg">
                {/* Barra de fundo — puramente decorativa, o valor está ao lado */}
                <div
                  aria-hidden="true"
                  className="absolute inset-y-0 start-0 bg-primary-100"
                  style={{ width: `${(category.amount / max) * 100}%` }}
                />

                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : category.id)}
                  aria-expanded={hasChildren ? isOpen : undefined}
                  disabled={!hasChildren}
                  className={cn(
                    'relative flex w-full flex-wrap items-center gap-x-4 gap-y-1 p-4 text-start',
                    hasChildren && 'hover:bg-primary-100/40',
                  )}
                >
                  <Icon
                    name={category.icon as IconName}
                    size={20}
                    className="shrink-0 text-primary-700"
                  />
                  <span className="flex-1 font-semibold">{tx(category.label, locale)}</span>

                  <span className="font-serif text-lg font-semibold tabular-nums">
                    {formatCurrency(category.amount, locale)}
                  </span>

                  <span className="w-16 text-end text-sm text-ink-muted tabular-nums">
                    {formatPercent(share, locale, 1)}
                  </span>

                  {compare ? (
                    <span
                      className={cn(
                        'inline-flex w-20 items-center justify-end gap-1 text-sm font-semibold tabular-nums',
                        variation > 0.001 ? 'text-success' : variation < -0.001 ? 'text-warning' : 'text-ink-muted',
                      )}
                    >
                      <Icon
                        name={variation >= 0 ? 'arrowUp' : 'arrowRight'}
                        size={14}
                        className={variation < 0 ? 'rotate-90' : undefined}
                      />
                      <span className="sr-only">{dict.transparency.variation}: </span>
                      {formatPercent(Math.abs(variation), locale, 1)}
                    </span>
                  ) : null}

                  {hasChildren ? (
                    <Icon
                      name="chevronDown"
                      size={18}
                      className={cn('shrink-0 text-ink-muted transition-transform', isOpen && 'rotate-180')}
                    />
                  ) : (
                    <span className="w-[18px]" />
                  )}
                </button>
              </div>

              {isOpen && hasChildren ? (
                <ul className="border-t border-line px-4 py-2">
                  {category.children!.map((child) => {
                    const childVariation = (child.amount - child.previousAmount) / child.previousAmount;
                    return (
                      <li
                        key={tx(child.label, 'pt')}
                        className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line py-2.5 last:border-b-0"
                      >
                        <span className="flex-1 ps-8">{tx(child.label, locale)}</span>
                        <span className="tabular-nums">{formatCurrency(child.amount, locale)}</span>
                        {compare ? (
                          <span className="w-20 text-end text-sm text-ink-muted tabular-nums">
                            {childVariation >= 0 ? '+' : '−'}
                            {formatPercent(Math.abs(childVariation), locale, 1)}
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-sm text-ink-muted">
        Total da despesa em {budget.year}: {formatCurrency(budget.expense, locale)} —{' '}
        {formatNumber(Math.round(budget.expense / budget.inhabitants), locale)} €{' '}
        {dict.transparency.perInhabitant}, para {formatNumber(budget.inhabitants, locale)} habitantes.
      </p>
    </div>
  );
}
