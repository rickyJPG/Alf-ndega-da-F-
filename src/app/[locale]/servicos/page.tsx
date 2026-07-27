import type { Metadata } from 'next';
import Link from 'next/link';

import { getDictionary } from '@/i18n';
import { isLocale, type Locale } from '@/i18n/config';
import { buildMetadata, breadcrumbJsonLd } from '@/lib/seo';
import { routes, serviceAreaIcons, serviceAreaLabels, serviceAreas } from '@/lib/routes';
import { getServices } from '@/content';
import { tx } from '@/content/types';
import { groupBy } from '@/lib/utils';

import { JsonLd } from '@/components/seo/json-ld';
import { PageHeader, Section } from '@/components/layout/page-shell';
import { ServiceTile } from '@/components/content/service-tile';
import { Icon, type IconName } from '@/components/ui/icon';
import { ButtonLink } from '@/components/ui/button';

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
    path: '/servicos',
    title: dict.services.title,
    description: dict.services.lead,
  });
}

export default async function ServicesIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const dict = getDictionary(locale);

  const services = await getServices();
  const byArea = groupBy(services, (service) => service.area);

  const crumbs = [
    { label: dict.common.home, href: '/' },
    { label: dict.services.title },
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />

      <PageHeader
        title={dict.services.title}
        lead={dict.services.lead}
        breadcrumb={crumbs.map((crumb) => ({
          label: crumb.label,
          href: crumb.href ? routes.home(locale) : undefined,
        }))}
        breadcrumbLabel={dict.common.breadcrumb}
        tone="alt"
        aside={
          <div className="flex flex-wrap gap-2">
            <ButtonLink href={routes.booking(locale)} icon="calendar">
              {dict.booking.title}
            </ButtonLink>
            <ButtonLink href={routes.documents(locale)} variant="subtle" icon="fileText">
              {dict.documents.title}
            </ButtonLink>
          </div>
        }
      />

      {serviceAreas.map((area) => {
        const areaServices = byArea.get(area) ?? [];
        if (areaServices.length === 0) return null;

        return (
          <Section key={area} id={`area-${area}`} title={serviceAreaLabels[area][locale]}>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {areaServices.map((service) => (
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
          </Section>
        );
      })}

      <Section tone="alt" title="Por área">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {serviceAreas.map((area) => (
            <li key={area}>
              <Link
                href={routes.serviceArea(locale, area)}
                className="flex min-h-14 items-center gap-3 rounded-md border border-line bg-surface px-4 text-ink no-underline hover:border-primary-600 hover:bg-primary-100/40"
              >
                <Icon name={serviceAreaIcons[area] as IconName} size={20} className="text-primary-700" />
                <span className="font-medium">{serviceAreaLabels[area][locale]}</span>
                <span className="ms-auto text-sm text-ink-muted tabular-nums">
                  {(byArea.get(area) ?? []).length}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
