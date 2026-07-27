import type { Metadata } from 'next';
import Link from 'next/link';

import { getDictionary } from '@/i18n';
import { isLocale, type Locale } from '@/i18n/config';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';
import { routes } from '@/lib/routes';
import {
  getBudget,
  getLatestMeeting,
  getOpenConsultations,
  getOpenTenders,
  getDocuments,
} from '@/content';
import { tx } from '@/content/types';

import { JsonLd } from '@/components/seo/json-ld';
import { PageHeader, Section } from '@/components/layout/page-shell';
import { TransparencyWidget } from '@/components/home/transparency-widget';
import { ConsultationCard } from '@/components/content/consultation-card';
import { DocumentRow } from '@/components/content/document-row';
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
    path: '/transparencia',
    title: dict.transparency.title,
    description: dict.transparency.lead,
  });
}

export default async function TransparencyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const dict = getDictionary(locale);
  const today = new Date().toISOString().slice(0, 10);

  const [budget, tenders, lastMeeting, consultations, regulations] = await Promise.all([
    getBudget(2026),
    getOpenTenders(),
    getLatestMeeting(),
    getOpenConsultations(),
    getDocuments({ type: 'regulamento' }),
  ]);

  const sections: { href: string; icon: IconName; title: string; text: string }[] = [
    {
      href: routes.budget(locale),
      icon: 'chart',
      title: dict.transparency.budgetExplorer,
      text: 'Onde vai cada euro, por área, com comparação ao ano anterior e descarga em CSV.',
    },
    {
      href: routes.consultations(locale),
      icon: 'megaphone',
      title: dict.consultations.title,
      text: 'O que está em consulta agora e até quando pode dar a sua opinião.',
    },
    {
      href: routes.meetings(locale),
      icon: 'book',
      title: dict.meetings.title,
      text: 'Ordens do dia, atas e deliberações, pesquisáveis por texto.',
    },
    {
      href: routes.procurement(locale),
      icon: 'gavel',
      title: 'Contratação pública',
      text: 'Concursos de obras, aquisições e recrutamento, com prazos.',
    },
    {
      href: routes.openData(locale),
      icon: 'download',
      title: 'Dados abertos',
      text: 'Conjuntos de dados em CSV e JSON, livres de reutilizar.',
    },
    {
      href: `${routes.documents(locale)}?tipo=regulamento`,
      icon: 'scale',
      title: 'Regulamentos e editais',
      text: 'As normas municipais em vigor e os avisos publicados.',
    },
  ];

  const crumbs = [{ label: dict.common.home, href: '/' }, { label: dict.transparency.title }];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />

      <PageHeader
        title={dict.transparency.title}
        lead={dict.transparency.lead}
        tone="alt"
        breadcrumbLabel={dict.common.breadcrumb}
        breadcrumb={[
          { label: dict.common.home, href: routes.home(locale) },
          { label: dict.transparency.title },
        ]}
      />

      <Section>
        <TransparencyWidget
          budget={budget}
          openTenderCount={tenders.length}
          lastMeeting={lastMeeting}
          locale={locale}
          dict={dict}
        />
      </Section>

      <Section tone="alt" title="O que pode consultar" headingLevel={2}>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((entry) => (
            <li key={entry.href}>
              <Link
                href={entry.href}
                className="flex h-full flex-col gap-2 rounded-lg border border-line bg-surface p-5 text-ink no-underline hover:border-primary-600"
              >
                <span className="flex size-11 items-center justify-center rounded-md border border-line bg-surface-alt text-primary-700">
                  <Icon name={entry.icon} size={22} />
                </span>
                <span className="mt-1 font-serif text-lg font-semibold">{entry.title}</span>
                <span className="text-sm text-ink-muted">{entry.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {consultations.length > 0 ? (
        <Section
          title={dict.consultations.title}
          lead={dict.consultations.lead}
          action={
            <ButtonLink href={routes.consultations(locale)} variant="subtle" iconAfter="arrowRight">
              {dict.common.seeAll}
            </ButtonLink>
          }
        >
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {consultations.map((consultation) => (
              <li key={consultation.id} className="flex">
                <ConsultationCard
                  consultation={consultation}
                  locale={locale}
                  dict={dict}
                  today={today}
                  className="w-full"
                />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section tone="alt" title="Regulamentos em vigor" headingLevel={2}>
        <ul className="rounded-lg border border-line bg-surface px-5">
          {regulations.map((document) => (
            <DocumentRow key={document.id} document={document} locale={locale} dict={dict} />
          ))}
        </ul>
      </Section>

      <Section>
        <div className="rounded-lg border border-s-4 border-s-accent-600 border-line bg-surface p-6">
          <h2 className="font-serif text-xl">Plataforma de denúncias</h2>
          <p className="measure mt-2 text-ink-muted">
            Se tem conhecimento de uma infração no âmbito da atividade do Município, pode
            comunicá-la em segurança. O canal cumpre o Regime Geral da Proteção de Denunciantes
            (Lei n.º 93/2021) e garante confidencialidade da identidade.
          </p>
          <p className="mt-4">
            <ButtonLink href={`${routes.transparency(locale)}/denuncias`} variant="subtle" icon="scale">
              Apresentar denúncia
            </ButtonLink>
          </p>
        </div>
      </Section>

      <Section tone="alt" title="Documentos de prestação de contas" headingLevel={2}>
        <ul className="rounded-lg border border-line bg-surface px-5">
          {budget.documents.map((file) => (
            <li key={file.href} className="flex items-center gap-3 border-b border-line py-4 last:border-b-0">
              <Icon name="fileText" size={20} className="text-primary-700" />
              <a href={file.href} download className="text-primary-600 underline underline-offset-[0.2em]">
                {tx(file.label, locale)}{' '}
                <span className="text-ink-muted">({file.format.toUpperCase()})</span>
              </a>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
