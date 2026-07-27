import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

import { getDictionary } from '@/i18n';
import { isLocale, type Locale } from '@/i18n/config';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';
import { routes } from '@/lib/routes';
import { getFreguesias, getOccurrences } from '@/content';

import { JsonLd } from '@/components/seo/json-ld';
import { PageHeader, Section } from '@/components/layout/page-shell';
import { ReportForm } from '@/components/features/report-form';
import { ReportTracker } from '@/components/features/report-tracker';
import { occurrenceStatusLabel, occurrenceStatusTone } from '@/lib/occurrence-status';
import { Tabs } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/format';

const LocationMap = dynamic(() =>
  import('@/components/features/location-map').then((module) => module.LocationMap),
);

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
    path: '/viver-e-participar/ocorrencias',
    title: dict.reports.title,
    description: dict.reports.lead,
  });
}

export default async function OccurrencesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const dict = getDictionary(locale);

  const [freguesias, occurrences] = await Promise.all([getFreguesias(), getOccurrences()]);

  const points = occurrences.map((item) => ({
    lat: item.geo.lat,
    lon: item.geo.lon,
    label: `${item.reference} — ${item.description}`,
    tone:
      item.status === 'resolvida'
        ? ('resolved' as const)
        : item.status === 'em-resolucao'
          ? ('progress' as const)
          : ('open' as const),
  }));

  const crumbs = [
    { label: dict.common.home, href: '/' },
    { label: dict.nav.viverParticipar, href: '/viver-e-participar' },
    { label: dict.reports.title },
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />

      <PageHeader
        title={dict.reports.title}
        lead={dict.reports.lead}
        tone="alt"
        breadcrumbLabel={dict.common.breadcrumb}
        breadcrumb={[
          { label: dict.common.home, href: routes.home(locale) },
          { label: dict.nav.viverParticipar, href: routes.participate(locale) },
          { label: dict.reports.title },
        ]}
      />

      <Section>
        <Tabs
          label={dict.reports.title}
          items={[
            {
              id: 'nova',
              label: dict.reports.newReport,
              content: (
                <div className="max-w-2xl">
                  <ReportForm dict={dict} locale={locale} freguesias={freguesias} />
                </div>
              ),
            },
            {
              id: 'consultar',
              label: dict.reports.trackReport,
              content: (
                <div className="max-w-2xl">
                  <ReportTracker occurrences={occurrences} locale={locale} dict={dict} />
                </div>
              ),
            },
          ]}
        />
      </Section>

      <Section
        tone="alt"
        title={dict.reports.publicMap}
        lead="Todas as ocorrências comunicadas, com o estado atual. Não são publicados dados de quem comunicou."
        headingLevel={2}
      >
        <LocationMap points={points} label={dict.reports.publicMap} className="mb-8" />

        {/* Dieselbe Information als Liste – die Karte allein ist nicht bedienbar. */}
        <h3 className="mb-3 font-serif text-xl">Ocorrências recentes</h3>
        <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
          {occurrences.map((item) => (
            <li key={item.reference} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
              <span className="font-semibold tabular-nums">{item.reference}</span>
              <Badge tone={occurrenceStatusTone[item.status]}>{occurrenceStatusLabel(item.status, dict)}</Badge>
              <span className="flex-1 basis-64">{item.description}</span>
              <time dateTime={item.reportedAt} className="text-sm text-ink-muted">
                {formatDate(item.reportedAt, locale)}
              </time>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
