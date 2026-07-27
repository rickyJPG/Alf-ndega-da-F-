import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getDictionary } from '@/i18n';
import { isLocale, locales, type Locale } from '@/i18n/config';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';
import { routes } from '@/lib/routes';
import { getEvents, getFreguesia, getFreguesias, getWasteSchedules } from '@/content';
import { tx } from '@/content/types';
import { formatNumber } from '@/lib/format';

import { JsonLd } from '@/components/seo/json-ld';
import { PageHeader, Section } from '@/components/layout/page-shell';
import { EventCard } from '@/components/content/event-card';
import { Icon } from '@/components/ui/icon';
import { TextLink } from '@/components/ui/link';
import { ButtonLink } from '@/components/ui/button';
import { WasteCalendar } from '@/components/features/waste-calendar';

export async function generateStaticParams() {
  const freguesias = await getFreguesias();
  return locales.flatMap((locale) => freguesias.map((f) => ({ locale, slug: f.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const freguesia = await getFreguesia(slug);
  if (!freguesia) return {};

  return buildMetadata({
    locale,
    path: `/municipio/freguesias/${slug}`,
    title: freguesia.name,
    description: tx(freguesia.description, locale),
  });
}

export default async function FreguesiaPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const dict = getDictionary(locale);

  const freguesia = await getFreguesia(slug);
  if (!freguesia) notFound();

  const [allEvents, schedules] = await Promise.all([getEvents({ limit: 100 }), getWasteSchedules()]);
  const events = allEvents.filter((event) => event.freguesia === slug).slice(0, 3);
  const schedule = schedules.find((entry) => entry.freguesiaSlug === slug);

  const crumbs = [
    { label: dict.common.home, href: '/' },
    { label: dict.nav.municipio, href: '/municipio' },
    { label: dict.freguesias.title, href: '/municipio/freguesias' },
    { label: freguesia.name },
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />

      <PageHeader
        title={freguesia.name}
        lead={tx(freguesia.description, locale)}
        tone="alt"
        breadcrumbLabel={dict.common.breadcrumb}
        breadcrumb={[
          { label: dict.common.home, href: routes.home(locale) },
          { label: dict.nav.municipio, href: routes.municipality(locale) },
          { label: dict.freguesias.title, href: routes.freguesias(locale) },
          { label: freguesia.name },
        ]}
      />

      <Section>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-2xl">Junta de Freguesia</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-line bg-surface p-4">
                <dt className="text-sm font-semibold text-ink-muted">{dict.freguesias.president}</dt>
                <dd className="mt-1 font-medium">{freguesia.president}</dd>
              </div>
              <div className="rounded-lg border border-line bg-surface p-4">
                <dt className="text-sm font-semibold text-ink-muted">{dict.freguesias.seat}</dt>
                <dd className="mt-1 font-medium">{freguesia.seat}</dd>
              </div>
              {freguesia.phone ? (
                <div className="rounded-lg border border-line bg-surface p-4">
                  <dt className="text-sm font-semibold text-ink-muted">{dict.contact.phone}</dt>
                  <dd className="mt-1">
                    <TextLink
                      href={`tel:+351${freguesia.phone.replace(/\s/g, '')}`}
                      className="tabular-nums"
                    >
                      {freguesia.phone}
                    </TextLink>
                  </dd>
                </div>
              ) : null}
              {freguesia.email ? (
                <div className="rounded-lg border border-line bg-surface p-4">
                  <dt className="text-sm font-semibold text-ink-muted">{dict.contact.email}</dt>
                  <dd className="mt-1">
                    <TextLink href={`mailto:${freguesia.email}`} className="break-all">
                      {freguesia.email}
                    </TextLink>
                  </dd>
                </div>
              ) : null}
            </dl>

            <h2 className="mt-10 text-2xl">{dict.freguesias.villages}</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {freguesia.villages.map((village) => (
                <li
                  key={village}
                  className="rounded-pill border border-line-strong bg-surface px-3 py-1.5"
                >
                  {village}
                </li>
              ))}
            </ul>
          </div>

          <aside>
            <div className="rounded-lg border border-line bg-surface p-5">
              <h2 className="font-serif text-lg">Em números</h2>
              <dl className="mt-3 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-ink-muted">
                    <Icon name="users" size={17} />
                    {dict.freguesias.population}
                  </dt>
                  <dd className="font-serif text-xl font-semibold tabular-nums">
                    {formatNumber(freguesia.population, locale)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-ink-muted">
                    <Icon name="mapPin" size={17} />
                    {dict.freguesias.area}
                  </dt>
                  <dd className="font-serif text-xl font-semibold tabular-nums">
                    {formatNumber(freguesia.area, locale, 1)} km²
                  </dd>
                </div>
              </dl>

              <ButtonLink
                href={`https://www.openstreetmap.org/?mlat=${freguesia.geo.lat}&mlon=${freguesia.geo.lon}#map=13/${freguesia.geo.lat}/${freguesia.geo.lon}`}
                external
                variant="subtle"
                icon="mapPin"
                fullWidth
                className="mt-5"
              >
                Ver no mapa
              </ButtonLink>
            </div>
          </aside>
        </div>
      </Section>

      {schedule ? (
        <Section tone="alt" title={dict.waste.title} lead={dict.waste.lead} headingLevel={2}>
          <WasteCalendar
            schedules={[schedule]}
            freguesias={[freguesia]}
            locale={locale}
            dict={dict}
            fixedFreguesia={freguesia.slug}
          />
        </Section>
      ) : null}

      {events.length > 0 ? (
        <Section title={dict.events.upcoming} headingLevel={2}>
          <ul className="grid gap-4 md:grid-cols-3">
            {events.map((event) => (
              <li key={event.id} className="flex">
                <EventCard event={event} locale={locale} dict={dict} className="w-full" />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  );
}
