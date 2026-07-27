import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getDictionary } from '@/i18n';
import { isLocale, locales, type Locale } from '@/i18n/config';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';
import { routes } from '@/lib/routes';
import { getMeeting, getMeetings } from '@/content';
import { tx } from '@/content/types';
import { formatDateLong } from '@/lib/format';

import { JsonLd } from '@/components/seo/json-ld';
import { Section } from '@/components/layout/page-shell';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Icon, type IconName } from '@/components/ui/icon';
import { FileLink, TextLink } from '@/components/ui/link';

const OUTCOME: Record<string, { tone: 'success' | 'danger' | 'neutral'; icon: IconName; label: string }> = {
  aprovado: { tone: 'success', icon: 'checkCircle', label: 'Aprovado' },
  rejeitado: { tone: 'danger', icon: 'xCircle', label: 'Rejeitado' },
  retirado: { tone: 'neutral', icon: 'minus', label: 'Retirado' },
};

export async function generateStaticParams() {
  const meetings = await getMeetings();
  return locales.flatMap((locale) => meetings.map((meeting) => ({ locale, slug: meeting.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const meeting = await getMeeting(slug);
  if (!meeting) return {};

  const title = `${meeting.body === 'camara' ? 'Reunião de Câmara' : 'Sessão da Assembleia'} de ${formatDateLong(meeting.date, locale)}`;

  return buildMetadata({
    locale,
    path: `/municipio/reunioes/${slug}`,
    title,
    description: meeting.agenda.slice(0, 3).join(' · '),
  });
}

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const dict = getDictionary(locale);

  const meeting = await getMeeting(slug);
  if (!meeting) notFound();

  const bodyLabel = meeting.body === 'camara' ? 'Câmara Municipal' : 'Assembleia Municipal';
  const title = `${meeting.body === 'camara' ? 'Reunião' : 'Sessão'} de ${formatDateLong(meeting.date, locale)}`;

  const crumbs = [
    { label: dict.common.home, href: '/' },
    { label: dict.nav.municipio, href: '/municipio' },
    { label: dict.meetings.title, href: '/municipio/reunioes' },
    { label: title },
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
              { label: dict.nav.municipio, href: routes.municipality(locale) },
              { label: dict.meetings.title, href: routes.meetings(locale) },
              { label: title },
            ]}
          />

          <div className="measure">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge tone={meeting.body === 'camara' ? 'info' : 'support'}>{bodyLabel}</Badge>
              <Badge>
                {meeting.kind === 'ordinaria' ? dict.meetings.ordinary : dict.meetings.extraordinary}
              </Badge>
              {meeting.isPublic ? <Badge tone="success">{dict.meetings.public}</Badge> : null}
            </div>
            <h1 className="text-3xl">{title}</h1>
          </div>
        </div>
      </div>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-3 lg:py-14">
        <div className="lg:col-span-2">
          <h2 className="text-2xl">{dict.meetings.agenda}</h2>
          <ol className="mt-4 flex flex-col gap-2">
            {meeting.agenda.map((item, index) => (
              <li key={index} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-7 shrink-0 items-center justify-center rounded-pill border border-line text-sm font-semibold text-ink-muted"
                >
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>

          <h2 className="mt-12 text-2xl">{dict.meetings.decisions}</h2>
          {meeting.decisions.length === 0 ? (
            <p className="mt-3 text-ink-muted">Não foram registadas deliberações nesta sessão.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {meeting.decisions.map((decision, index) => {
                const outcome = OUTCOME[decision.outcome];
                return (
                  <li
                    key={index}
                    className="flex items-start gap-3 rounded-lg border border-line bg-surface p-4"
                  >
                    <Icon
                      name={outcome.icon}
                      size={20}
                      className={
                        outcome.tone === 'success'
                          ? 'mt-0.5 shrink-0 text-success'
                          : outcome.tone === 'danger'
                            ? 'mt-0.5 shrink-0 text-danger'
                            : 'mt-0.5 shrink-0 text-ink-muted'
                      }
                    />
                    <span>
                      <span className="block font-medium">{decision.title}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-2">
                        <Badge tone={outcome.tone}>{outcome.label}</Badge>
                        {decision.votes ? (
                          <span className="text-sm text-ink-muted">{decision.votes}</span>
                        ) : null}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <aside>
          <div className="rounded-lg border border-line bg-surface p-5">
            <h2 className="font-serif text-lg">Documentos</h2>
            <ul className="mt-3 flex flex-col gap-3">
              {meeting.agendaFile ? (
                <li>
                  <FileLink
                    href={meeting.agendaFile.href}
                    format={meeting.agendaFile.format}
                    bytes={meeting.agendaFile.bytes}
                    locale={locale}
                  >
                    {tx(meeting.agendaFile.label, locale)}
                  </FileLink>
                </li>
              ) : null}
              {meeting.minutes ? (
                <li>
                  <FileLink
                    href={meeting.minutes.href}
                    format={meeting.minutes.format}
                    bytes={meeting.minutes.bytes}
                    locale={locale}
                  >
                    {tx(meeting.minutes.label, locale)}
                  </FileLink>
                </li>
              ) : null}
            </ul>

            {meeting.livestreamUrl ? (
              <p className="mt-4">
                <TextLink href={meeting.livestreamUrl}>Ver a transmissão</TextLink>
              </p>
            ) : null}

            <p className="mt-5 border-t border-line pt-4 text-sm text-ink-muted">
              As atas são publicadas depois de aprovadas na reunião seguinte, nos termos do artigo
              57.º do Regime Jurídico das Autarquias Locais.
            </p>
          </div>
        </aside>
      </div>

      <Section tone="alt">
        <TextLink href={routes.meetings(locale)}>← {dict.meetings.title}</TextLink>
      </Section>
    </>
  );
}
