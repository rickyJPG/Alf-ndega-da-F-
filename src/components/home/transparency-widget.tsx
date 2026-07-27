import Link from 'next/link';
import type { BudgetYear, Meeting } from '@/content/types';
import { localePath, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { formatCurrencyCompact, formatDate, formatNumber } from '@/lib/format';
import { expensePerInhabitant } from '@/content';
import { Icon, type IconName } from '@/components/ui/icon';

/**
 * Drei Kennzahlen, live aus den Daten – nicht aus einer gepflegten Textdatei:
 * Haushalt des Jahres, offene Ausschreibungen, letzte Sitzung mit Protokoll.
 */
export function TransparencyWidget({
  budget,
  openTenderCount,
  lastMeeting,
  locale,
  dict,
}: {
  budget: BudgetYear;
  openTenderCount: number;
  lastMeeting: Meeting;
  locale: Locale;
  dict: Dictionary;
}) {
  const stats: {
    icon: IconName;
    label: string;
    value: string;
    detail: string;
    href: string;
    cta: string;
  }[] = [
    {
      icon: 'euro',
      label: `${dict.transparency.budgetYear} ${budget.year}`,
      value: formatCurrencyCompact(budget.expense, locale),
      detail: `${formatNumber(expensePerInhabitant(budget), locale)} € ${dict.transparency.perInhabitant}`,
      href: '/transparencia/orcamento',
      cta: dict.transparency.budgetExplorer,
    },
    {
      icon: 'gavel',
      label: dict.transparency.openTenders,
      value: formatNumber(openTenderCount, locale),
      detail: 'Concursos e recrutamento com prazo aberto',
      href: '/municipio/contratacao-publica',
      cta: dict.common.seeAll,
    },
    {
      icon: 'book',
      label: dict.transparency.lastMeeting,
      value: formatDate(lastMeeting.date, locale),
      detail: `${lastMeeting.decisions.length} deliberações registadas`,
      href: `/municipio/reunioes/${lastMeeting.slug}`,
      cta: dict.transparency.seeMinutes,
    },
  ];

  return (
    <ul className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <li
          key={stat.label}
          className="group relative flex flex-col gap-1 rounded-lg border border-line bg-surface p-5 hover:border-primary-600"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-ink-muted">
            <Icon name={stat.icon} size={17} className="text-primary-700" />
            {stat.label}
          </span>
          <span className="font-serif text-3xl font-semibold text-ink tabular-nums">
            {stat.value}
          </span>
          <span className="text-sm text-ink-muted">{stat.detail}</span>
          <Link
            href={localePath(locale, stat.href)}
            className="mt-3 inline-flex items-center gap-1.5 font-semibold text-primary-600 no-underline after:absolute after:inset-0 after:content-[''] hover:underline underline-offset-[0.2em]"
          >
            {stat.cta}
            <Icon name="arrowRight" size={16} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
