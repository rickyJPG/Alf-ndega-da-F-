import type { Metadata } from 'next';

import { getDictionary } from '@/i18n';
import { isLocale, type Locale } from '@/i18n/config';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';
import { routes } from '@/lib/routes';
import { availableSlots, getBookableServices } from '@/content';
import { site } from '@/lib/site';

import { JsonLd } from '@/components/seo/json-ld';
import { PageHeader, Section } from '@/components/layout/page-shell';
import { BookingForm } from '@/components/features/booking-form';
import { Alert } from '@/components/ui/alert';
import { TextLink } from '@/components/ui/link';

/** Die nächsten 21 Kalendertage; Wochenenden filtert availableSlots() heraus. */
function nextDays(count: number): string[] {
  const days: string[] = [];
  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);
  cursor.setUTCDate(cursor.getUTCDate() + 1);

  while (days.length < count) {
    const weekday = cursor.getUTCDay();
    if (weekday !== 0 && weekday !== 6) days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

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
    path: '/servicos/marcacoes',
    title: dict.booking.title,
    description: dict.booking.lead,
  });
}

export default async function BookingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const dict = getDictionary(locale);

  const services = await getBookableServices();
  const days = nextDays(10);

  // Freie Zeiten serverseitig berechnen – der Client bekommt fertige Listen.
  const slotsByDay: Record<string, Record<string, string[]>> = {};
  for (const service of services) {
    slotsByDay[service.id] = {};
    for (const day of days) {
      slotsByDay[service.id][day] = availableSlots(service.id, day);
    }
  }

  const crumbs = [
    { label: dict.common.home, href: '/' },
    { label: dict.services.title, href: '/servicos' },
    { label: dict.booking.title },
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />

      <PageHeader
        title={dict.booking.title}
        lead={dict.booking.lead}
        tone="alt"
        breadcrumbLabel={dict.common.breadcrumb}
        breadcrumb={[
          { label: dict.common.home, href: routes.home(locale) },
          { label: dict.services.title, href: routes.services(locale) },
          { label: dict.booking.title },
        ]}
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <BookingForm
              services={services}
              slotsByDay={slotsByDay}
              days={days}
              locale={locale}
              dict={dict}
            />
          </div>

          <aside>
            <Alert tone="info" title="Prefere tratar por telefone?">
              <p>
                Ligue para <TextLink href={`tel:${site.contact.phoneE164}`}>{site.contact.phone}</TextLink>, de
                segunda a sexta, entre as 09:00 e as 17:30. Marcamos consigo ao telefone.
              </p>
              <p className="mt-3">
                Se precisar de intérprete de Língua Gestual Portuguesa ou de apoio para preencher
                documentos, diga-nos na marcação — preparamos o atendimento.
              </p>
            </Alert>

            <div className="mt-6 rounded-lg border border-line bg-surface p-5">
              <h2 className="font-serif text-lg">Onde é o atendimento</h2>
              <address className="mt-2 not-italic text-ink-muted">
                {site.legalName}
                <br />
                {site.address.street}
                <br />
                {site.address.postalCode} {site.address.city}
              </address>
              <p className="mt-3 text-sm text-ink-muted">
                Entrada acessível pelo lado nascente, com rampa e lugar de estacionamento reservado.
              </p>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
