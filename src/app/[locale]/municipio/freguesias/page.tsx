import type { Metadata } from 'next';
import Link from 'next/link';

import { getDictionary } from '@/i18n';
import { isLocale, type Locale } from '@/i18n/config';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';
import { routes } from '@/lib/routes';
import { getFreguesias, municipalityTotals } from '@/content';
import { tx } from '@/content/types';
import { formatNumber } from '@/lib/format';

import { JsonLd } from '@/components/seo/json-ld';
import { PageHeader, Section } from '@/components/layout/page-shell';
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
    path: '/municipio/freguesias',
    title: dict.freguesias.title,
    description: dict.freguesias.lead,
  });
}

export default async function FreguesiasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const dict = getDictionary(locale);
  const freguesias = await getFreguesias();

  const crumbs = [
    { label: dict.common.home, href: '/' },
    { label: dict.nav.municipio, href: '/municipio' },
    { label: dict.freguesias.title },
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />

      <PageHeader
        title={dict.freguesias.title}
        lead={dict.freguesias.lead}
        tone="alt"
        breadcrumbLabel={dict.common.breadcrumb}
        breadcrumb={[
          { label: dict.common.home, href: routes.home(locale) },
          { label: dict.nav.municipio, href: routes.municipality(locale) },
          { label: dict.freguesias.title },
        ]}
      />

      <Section>
        <ul className="mb-8 grid gap-4 sm:grid-cols-3">
          <li className="rounded-lg border border-line bg-surface p-5">
            <span className="text-sm font-semibold text-ink-muted">{dict.freguesias.title}</span>
            <span className="mt-1 block font-serif text-3xl font-semibold tabular-nums">
              {freguesias.length}
            </span>
          </li>
          <li className="rounded-lg border border-line bg-surface p-5">
            <span className="text-sm font-semibold text-ink-muted">{dict.freguesias.population}</span>
            <span className="mt-1 block font-serif text-3xl font-semibold tabular-nums">
              {formatNumber(municipalityTotals.population, locale)}
            </span>
          </li>
          <li className="rounded-lg border border-line bg-surface p-5">
            <span className="text-sm font-semibold text-ink-muted">{dict.freguesias.area}</span>
            <span className="mt-1 block font-serif text-3xl font-semibold tabular-nums">
              {formatNumber(municipalityTotals.area, locale, 1)} km²
            </span>
          </li>
        </ul>

        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {freguesias.map((freguesia) => (
            <li key={freguesia.slug} className="flex">
              <article className="group relative flex w-full flex-col gap-2 rounded-lg border border-line bg-surface p-5 hover:border-primary-600">
                <h2 className="font-serif text-lg">
                  <Link
                    href={routes.freguesia(locale, freguesia)}
                    className="text-ink no-underline after:absolute after:inset-0 after:content-[''] hover:underline underline-offset-[0.2em]"
                  >
                    {freguesia.name}
                  </Link>
                </h2>
                <p className="text-sm text-ink-muted">{tx(freguesia.description, locale)}</p>
                <dl className="mt-auto flex flex-wrap gap-x-5 gap-y-1 pt-3 text-sm text-ink-muted">
                  <div className="flex items-center gap-1.5">
                    <Icon name="users" size={15} />
                    <dt className="sr-only">{dict.freguesias.population}</dt>
                    <dd className="tabular-nums">{formatNumber(freguesia.population, locale)}</dd>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Icon name="mapPin" size={15} />
                    <dt className="sr-only">{dict.freguesias.area}</dt>
                    <dd className="tabular-nums">{formatNumber(freguesia.area, locale, 1)} km²</dd>
                  </div>
                </dl>
              </article>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
