import type { Metadata } from 'next';

import { getDictionary } from '@/i18n';
import { isLocale, type Locale } from '@/i18n/config';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';
import { routes } from '@/lib/routes';
import { getConsultations } from '@/content';

import { JsonLd } from '@/components/seo/json-ld';
import { PageHeader, Section } from '@/components/layout/page-shell';
import { ConsultationCard } from '@/components/content/consultation-card';

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
    path: '/transparencia/consultas-publicas',
    title: dict.consultations.title,
    description: dict.consultations.lead,
  });
}

export default async function ConsultationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const dict = getDictionary(locale);
  const today = new Date().toISOString().slice(0, 10);

  const all = await getConsultations();
  const open = all.filter((item) => item.startsAt <= today && item.endsAt >= today);
  const upcoming = all.filter((item) => item.startsAt > today);
  const closed = all.filter((item) => item.endsAt < today);

  const crumbs = [
    { label: dict.common.home, href: '/' },
    { label: dict.transparency.title, href: '/transparencia' },
    { label: dict.consultations.title },
  ];

  const grid = (items: typeof all) => (
    <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((consultation) => (
        <li key={consultation.id} className="flex">
          <ConsultationCard
            consultation={consultation}
            locale={locale}
            dict={dict}
            today={today}
            headingLevel={3}
            className="w-full"
          />
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />

      <PageHeader
        title={dict.consultations.title}
        lead={dict.consultations.lead}
        tone="alt"
        breadcrumbLabel={dict.common.breadcrumb}
        breadcrumb={[
          { label: dict.common.home, href: routes.home(locale) },
          { label: dict.transparency.title, href: routes.transparency(locale) },
          { label: dict.consultations.title },
        ]}
      />

      <Section title={dict.consultations.open} headingLevel={2}>
        {open.length === 0 ? (
          <p className="rounded-lg border border-line bg-surface-alt p-8 text-ink-muted">
            {dict.consultations.empty}
          </p>
        ) : (
          grid(open)
        )}
      </Section>

      {upcoming.length > 0 ? (
        <Section tone="alt" title={dict.consultations.upcoming} headingLevel={2}>
          {grid(upcoming)}
        </Section>
      ) : null}

      {closed.length > 0 ? (
        <Section title={dict.consultations.closed} headingLevel={2}>
          {grid(closed)}
        </Section>
      ) : null}
    </>
  );
}
