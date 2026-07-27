import type { Metadata } from 'next';

import { getDictionary } from '@/i18n';
import { isLocale, type Locale } from '@/i18n/config';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';
import { routes } from '@/lib/routes';
import { getBudget } from '@/content';
import { tx } from '@/content/types';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format';

import { JsonLd } from '@/components/seo/json-ld';
import { PageHeader, Section } from '@/components/layout/page-shell';
import { BudgetExplorer } from '@/components/features/budget-explorer';
import { Icon } from '@/components/ui/icon';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const dict = getDictionary(locale);

  return buildMetadata({
    locale,
    path: '/transparencia/orcamento',
    title: dict.transparency.budgetExplorer,
    description: dict.transparency.lead,
  });
}

export default async function BudgetPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const dict = getDictionary(locale);

  const budget = await getBudget(2026);
  const revenueChange = (budget.revenue - budget.previousRevenue) / budget.previousRevenue;

  const crumbs = [
    { label: dict.common.home, href: '/' },
    { label: dict.transparency.title, href: '/transparencia' },
    { label: dict.transparency.budgetExplorer },
  ];

  const stats = [
    {
      label: `${dict.transparency.revenue} ${budget.year}`,
      value: formatCurrency(budget.revenue, locale),
      detail: `${revenueChange >= 0 ? '+' : '−'}${formatPercent(Math.abs(revenueChange), locale, 1)} face a ${budget.year - 1}`,
    },
    {
      label: `${dict.transparency.expense} ${budget.year}`,
      value: formatCurrency(budget.expense, locale),
      detail: `${formatNumber(Math.round(budget.expense / budget.inhabitants), locale)} € ${dict.transparency.perInhabitant}`,
    },
    {
      label: 'Habitantes',
      value: formatNumber(budget.inhabitants, locale),
      detail: 'Censos 2021',
    },
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />

      <PageHeader
        title={dict.transparency.budgetExplorer}
        lead="Cada barra é uma área de despesa. Clique para ver as rubricas que a compõem."
        tone="alt"
        breadcrumbLabel={dict.common.breadcrumb}
        breadcrumb={[
          { label: dict.common.home, href: routes.home(locale) },
          { label: dict.transparency.title, href: routes.transparency(locale) },
          { label: dict.transparency.budgetExplorer },
        ]}
      />

      <Section>
        <ul className="mb-10 grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <li key={stat.label} className="rounded-lg border border-line bg-surface p-5">
              <span className="text-sm font-semibold text-ink-muted">{stat.label}</span>
              <span className="mt-1 block font-serif text-3xl font-semibold tabular-nums">
                {stat.value}
              </span>
              <span className="text-sm text-ink-muted">{stat.detail}</span>
            </li>
          ))}
        </ul>

        <h2 className="text-2xl">{dict.transparency.expense} por área</h2>
        <p className="measure mt-2 mb-6 text-ink-muted">
          Os valores são os do orçamento aprovado para {budget.year}. A execução real é publicada
          mensalmente em dados abertos.
        </p>

        <BudgetExplorer budget={budget} locale={locale} dict={dict} />
      </Section>

      <Section tone="alt" title="Documentos" headingLevel={2}>
        <ul className="flex flex-col gap-3">
          {budget.documents.map((file) => (
            <li key={file.href}>
              <a
                href={file.href}
                download
                className="inline-flex items-center gap-2 text-primary-600 underline underline-offset-[0.2em]"
              >
                <Icon name="download" size={18} />
                {tx(file.label, locale)}{' '}
                <span className="text-ink-muted">({file.format.toUpperCase()})</span>
              </a>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
