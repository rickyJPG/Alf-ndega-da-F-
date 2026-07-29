import type { Metadata } from 'next';
import Image from 'next/image';
import { ehFotoExterna, fotoReal } from '@/lib/imagens';
import { notFound } from 'next/navigation';

import { getDictionary } from '@/i18n';
import { isLocale, locales, type Locale } from '@/i18n/config';
import { breadcrumbJsonLd, buildMetadata, eventJsonLd } from '@/lib/seo';
import { routes } from '@/lib/routes';
import { getAllEvents, getEvent, getEvents } from '@/content';
import { tx } from '@/content/types';
import { formatDateLong, formatTime, isoDate } from '@/lib/format';

import { JsonLd } from '@/components/seo/json-ld';
import { Section } from '@/components/layout/page-shell';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { CategoryBadge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { ButtonLink } from '@/components/ui/button';
import { EventCard } from '@/components/content/event-card';
import { Card, CardBody } from '@/components/ui/card';

export async function generateStaticParams() {
  const events = await getAllEvents();
  return locales.flatMap((locale) => events.map((event) => ({ locale, slug: event.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const event = await getEvent(slug);
  if (!event) return {};

  return buildMetadata({
    locale,
    path: `/eventos/${slug}`,
    title: tx(event.title, locale),
    description: tx(event.summary, locale),
    image: event.image?.src,
  });
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const dict = getDictionary(locale);

  const event = await getEvent(slug);
  if (!event) notFound();

  const upcoming = (await getEvents({ limit: 4 })).filter((item) => item.id !== event.id).slice(0, 3);
  const price = event.price ? tx(event.price, locale) : undefined;
  const isFree = Boolean(price && /livre|gratuit|free|libre/i.test(price));

  const crumbs = [
    { label: dict.common.home, href: '/' },
    { label: dict.events.title, href: '/eventos' },
    { label: tx(event.title, locale) },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(locale, crumbs),
          eventJsonLd({
            locale,
            name: tx(event.title, locale),
            description: tx(event.summary, locale),
            startDate: event.startTime ? `${event.startDate}T${event.startTime}:00` : event.startDate,
            endDate: event.endDate,
            location: event.location,
            geo: event.geo,
            path: `/eventos/${event.slug}`,
            isFree,
            organiser: event.organiser,
          }),
        ]}
      />

      <article>
        <div className="border-b border-line bg-surface-alt">
          <div className="container-page py-6 md:py-10">
            <Breadcrumb
              className="mb-5"
              label={dict.common.breadcrumb}
              items={[
                { label: dict.common.home, href: routes.home(locale) },
                { label: dict.events.title, href: routes.events(locale) },
                { label: tx(event.title, locale) },
              ]}
            />

            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="measure">
                <CategoryBadge>{event.category}</CategoryBadge>
                <h1 className="mt-3 text-3xl">{tx(event.title, locale)}</h1>
                <p className="mt-3 text-lg text-ink-muted">{tx(event.summary, locale)}</p>
              </div>

              <ButtonLink href={routes.eventIcs(event)} icon="calendar" size="lg">
                {dict.events.addToCalendar}
              </ButtonLink>
            </div>
          </div>
        </div>

        <div className="container-page grid gap-10 py-10 lg:grid-cols-3 lg:py-14">
          <div className="lg:col-span-2">
            {event.image ? (
              <div className="relative mb-8 aspect-[3/2] w-full overflow-hidden rounded-lg border border-line bg-surface-alt">
                <Image
                  src={fotoReal(event.image.src)}
                  unoptimized={ehFotoExterna(fotoReal(event.image.src))}
                  alt={tx(event.image.alt, locale)}
                  fill
                  priority
                  sizes="(min-width: 1024px) 800px, 100vw"
                  className="object-cover"
                />
              </div>
            ) : null}

            {event.description ? (
              <div className="prose-cm">
                {tx(event.description, locale).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <p className="measure text-ink-muted">{tx(event.summary, locale)}</p>
            )}
          </div>

          <aside>
            <Card>
              <CardBody>
                <h2 className="font-serif text-lg">{dict.events.when}</h2>
                <p className="mt-1">
                  <time dateTime={isoDate(event.startDate)}>
                    {formatDateLong(event.startDate, locale)}
                  </time>
                  {event.endDate && event.endDate !== event.startDate ? (
                    <>
                      {' – '}
                      <time dateTime={isoDate(event.endDate)}>
                        {formatDateLong(event.endDate, locale)}
                      </time>
                    </>
                  ) : null}
                </p>
                <p className="mt-1 text-ink-muted">
                  {event.startTime
                    ? `${formatTime(event.startTime)}${event.endTime ? ` – ${formatTime(event.endTime)}` : ''}`
                    : dict.events.allDay}
                </p>

                <h2 className="mt-6 font-serif text-lg">{dict.events.where}</h2>
                <p className="mt-1 flex items-start gap-2">
                  <Icon name="mapPin" size={18} className="mt-1 shrink-0 text-primary-700" />
                  {event.location}
                </p>
                {event.geo ? (
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${event.geo.lat}&mlon=${event.geo.lon}#map=16/${event.geo.lat}/${event.geo.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-primary-600 underline underline-offset-[0.2em]"
                  >
                    {dict.contact.getDirections}
                    <Icon name="external" size={14} />
                  </a>
                ) : null}

                {event.organiser ? (
                  <>
                    <h2 className="mt-6 font-serif text-lg">{dict.events.organiser}</h2>
                    <p className="mt-1 text-ink-muted">{event.organiser}</p>
                  </>
                ) : null}

                {price ? (
                  <>
                    <h2 className="mt-6 font-serif text-lg">{dict.events.price}</h2>
                    <p className="mt-1 text-ink-muted">{price}</p>
                  </>
                ) : null}

                <p className="mt-6 border-t border-line pt-4 text-sm text-ink-muted">
                  {dict.events.addToCalendarHint}
                </p>
              </CardBody>
            </Card>
          </aside>
        </div>
      </article>

      {upcoming.length > 0 ? (
        <Section tone="alt" title={dict.events.upcoming}>
          <ul className="grid gap-4 md:grid-cols-3">
            {upcoming.map((item) => (
              <li key={item.id} className="flex">
                <EventCard event={item} locale={locale} dict={dict} className="w-full" />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  );
}
