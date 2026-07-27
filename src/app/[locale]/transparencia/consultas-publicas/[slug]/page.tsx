import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { fill, getDictionary } from '@/i18n';
import { isLocale, locales, type Locale } from '@/i18n/config';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';
import { routes } from '@/lib/routes';
import { getConsultation, getConsultations } from '@/content';
import { tx } from '@/content/types';
import { formatDateLong, formatDeadline } from '@/lib/format';

import { JsonLd } from '@/components/seo/json-ld';
import { Section } from '@/components/layout/page-shell';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { FileLink, TextLink } from '@/components/ui/link';
import { ConsultationForm } from '@/components/features/consultation-form';

export async function generateStaticParams() {
  const consultations = await getConsultations();
  return locales.flatMap((locale) =>
    consultations.map((consultation) => ({ locale, slug: consultation.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const consultation = await getConsultation(slug);
  if (!consultation) return {};

  return buildMetadata({
    locale,
    path: `/transparencia/consultas-publicas/${slug}`,
    title: tx(consultation.title, locale),
    description: tx(consultation.summary, locale),
  });
}

export default async function ConsultationDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const dict = getDictionary(locale);
  const today = new Date().toISOString().slice(0, 10);

  const consultation = await getConsultation(slug);
  if (!consultation) notFound();

  const notStarted = consultation.startsAt > today;
  const deadline = formatDeadline(
    consultation.endsAt,
    {
      today: dict.consultations.endsToday,
      tomorrow: dict.consultations.endsTomorrow,
      days: (n) => fill(dict.consultations.endsInDays, { days: n }),
      ended: dict.consultations.ended,
    },
    today,
  );
  const isOpen = !notStarted && deadline.tone !== 'ended';

  const crumbs = [
    { label: dict.common.home, href: '/' },
    { label: dict.transparency.title, href: '/transparencia' },
    { label: dict.consultations.title, href: '/transparencia/consultas-publicas' },
    { label: tx(consultation.title, locale) },
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />

      <div className="border-b border-line bg-surface-alt">
        <div className="container-page py-6 md:py-10">
          <Breadcrumb
            className="mb-5"
            label={dict.common.breadcrumb}
            items={[
              { label: dict.common.home, href: routes.home(locale) },
              { label: dict.transparency.title, href: routes.transparency(locale) },
              { label: dict.consultations.title, href: routes.consultations(locale) },
              { label: tx(consultation.title, locale) },
            ]}
          />

          <div className="measure">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge tone={isOpen ? 'success' : notStarted ? 'info' : 'neutral'}>
                {isOpen
                  ? dict.consultations.open
                  : notStarted
                    ? dict.consultations.upcoming
                    : dict.consultations.closed}
              </Badge>
              <span className="text-sm text-ink-muted">{consultation.area}</span>
            </div>

            <h1 className="text-3xl">{tx(consultation.title, locale)}</h1>
            <p className="mt-3 text-lg text-ink-muted">{tx(consultation.summary, locale)}</p>

            <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span
                className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 font-semibold ${
                  deadline.tone === 'danger'
                    ? 'border-danger bg-danger-surface text-accent-700'
                    : deadline.tone === 'warning'
                      ? 'border-warning bg-warning-surface text-warning'
                      : 'border-line bg-surface text-ink'
                }`}
              >
                <Icon name="clock" size={18} />
                {notStarted
                  ? `${dict.consultations.upcoming} — ${formatDateLong(consultation.startsAt, locale)}`
                  : deadline.text}
              </span>
              <span className="text-sm text-ink-muted">
                {dict.consultations.period}: {formatDateLong(consultation.startsAt, locale)} —{' '}
                {formatDateLong(consultation.endsAt, locale)}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-3 lg:py-14">
        <div className="lg:col-span-2">
          {consultation.body ? (
            <div className="prose-cm">
              {tx(consultation.body, locale).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          ) : null}

          <h2 className="mt-10 text-2xl">{dict.consultations.howToParticipate}</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {tx(consultation.howTo, locale).map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <Icon name="check" size={18} className="mt-1 shrink-0 text-success" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {isOpen ? (
            <div className="mt-10">
              <h2 className="text-2xl">{dict.consultations.participate}</h2>
              <ConsultationForm
                dict={dict}
                locale={locale}
                consultationTitle={tx(consultation.title, locale)}
              />
            </div>
          ) : null}
        </div>

        <aside>
          <div className="rounded-lg border border-line bg-surface p-5">
            <h2 className="font-serif text-lg">{dict.consultations.seeDocuments}</h2>
            {consultation.documents.length === 0 ? (
              <p className="mt-2 text-sm text-ink-muted">
                Os documentos são publicados no dia de abertura da consulta.
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-3">
                {consultation.documents.map((file) => (
                  <li key={file.href}>
                    <FileLink
                      href={file.href}
                      format={file.format}
                      bytes={file.bytes}
                      locale={locale}
                    >
                      {tx(file.label, locale)}
                    </FileLink>
                  </li>
                ))}
              </ul>
            )}

            <h3 className="mt-6 font-serif text-lg">{dict.contact.email}</h3>
            <p className="mt-1">
              <TextLink href={`mailto:${consultation.contactEmail}`}>
                {consultation.contactEmail}
              </TextLink>
            </p>
          </div>
        </aside>
      </div>

      <Section tone="alt">
        <TextLink href={routes.consultations(locale)}>← {dict.consultations.title}</TextLink>
      </Section>
    </>
  );
}
