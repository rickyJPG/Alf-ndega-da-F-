import type { Metadata } from 'next';

import { getDictionary } from '@/i18n';
import { isLocale, type Locale } from '@/i18n/config';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';
import { routes } from '@/lib/routes';
import { getEventCategories, getEvents } from '@/content';
import { startOfWeek } from '@/content/data/clock';

import { JsonLd } from '@/components/seo/json-ld';
import { PageHeader, Section } from '@/components/layout/page-shell';
import { WeekAgenda } from '@/components/home/week-agenda';
import { EventCard } from '@/components/content/event-card';

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
    path: '/eventos',
    title: dict.events.title,
    description: dict.events.lead,
  });
}

export default async function EventsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const dict = getDictionary(locale);

  const [events, categories] = await Promise.all([getEvents({ limit: 100 }), getEventCategories()]);
  const weekStart = startOfWeek().toISOString().slice(0, 10);

  const crumbs = [{ label: dict.common.home, href: '/' }, { label: dict.events.title }];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />

      <PageHeader
        title={dict.events.title}
        lead={dict.events.lead}
        tone="alt"
        breadcrumbLabel={dict.common.breadcrumb}
        breadcrumb={[
          { label: dict.common.home, href: routes.home(locale) },
          { label: dict.events.title },
        ]}
      />

      <Section>
        <WeekAgenda
          events={events}
          locale={locale}
          dict={dict}
          weekStart={weekStart}
          categories={categories}
        />
      </Section>

      <Section tone="alt" title={dict.events.upcoming} headingLevel={2}>
        {events.length === 0 ? (
          <p className="rounded-lg border border-line bg-surface p-8 text-ink-muted">
            {dict.events.empty}
          </p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {events.map((event) => (
              <li key={event.id} className="flex">
                <EventCard event={event} locale={locale} dict={dict} className="w-full" />
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
