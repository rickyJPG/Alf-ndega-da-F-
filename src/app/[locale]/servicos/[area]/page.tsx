import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getDictionary } from '@/i18n';
import { isLocale, locales, type Locale } from '@/i18n/config';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';
import { routes, serviceAreaLabels, serviceAreas, type ServiceAreaSlug } from '@/lib/routes';
import { getDocuments, getServices } from '@/content';
import { tx } from '@/content/types';

import { JsonLd } from '@/components/seo/json-ld';
import { PageHeader, Section } from '@/components/layout/page-shell';
import { ServiceTile } from '@/components/content/service-tile';
import { DocumentRow } from '@/components/content/document-row';
import type { IconName } from '@/components/ui/icon';

function isArea(value: string): value is ServiceAreaSlug {
  return (serviceAreas as readonly string[]).includes(value);
}

export function generateStaticParams() {
  return locales.flatMap((locale) => serviceAreas.map((area) => ({ locale, area })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; area: string }>;
}): Promise<Metadata> {
  const { locale: raw, area } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const dict = getDictionary(locale);
  if (!isArea(area)) return {};

  return buildMetadata({
    locale,
    path: `/servicos/${area}`,
    title: serviceAreaLabels[area][locale],
    description: dict.services.lead,
  });
}

export default async function ServiceAreaPage({
  params,
}: {
  params: Promise<{ locale: string; area: string }>;
}) {
  const { locale: raw, area } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const dict = getDictionary(locale);

  if (!isArea(area)) notFound();

  const [services, documents] = await Promise.all([
    getServices({ area }),
    getDocuments({ area }),
  ]);

  const crumbs = [
    { label: dict.common.home, href: '/' },
    { label: dict.services.title, href: '/servicos' },
    { label: serviceAreaLabels[area][locale] },
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />

      <PageHeader
        title={serviceAreaLabels[area][locale]}
        lead={dict.services.lead}
        tone="alt"
        breadcrumbLabel={dict.common.breadcrumb}
        breadcrumb={[
          { label: dict.common.home, href: routes.home(locale) },
          { label: dict.services.title, href: routes.services(locale) },
          { label: serviceAreaLabels[area][locale] },
        ]}
      />

      <Section title={dict.services.title} headingLevel={2}>
        {services.length === 0 ? (
          <p className="text-ink-muted">{dict.documents.empty}</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceTile
                key={service.id}
                href={routes.service(locale, service)}
                icon={service.icon as IconName}
                title={tx(service.title, locale)}
                description={tx(service.summary, locale)}
                online={service.channels.includes('online')}
                onlineLabel={dict.services.onlineBadge}
              />
            ))}
          </ul>
        )}
      </Section>

      {documents.length > 0 ? (
        <Section tone="alt" title={dict.documents.title} headingLevel={2}>
          <ul className="rounded-lg border border-line bg-surface px-5">
            {documents.map((document) => (
              <DocumentRow key={document.id} document={document} locale={locale} dict={dict} />
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  );
}
