import type { Metadata } from 'next';

import { getDictionary } from '@/i18n';
import { isLocale, type Locale } from '@/i18n/config';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';
import { routes, serviceAreaLabels } from '@/lib/routes';
import { getFreguesias, getWasteSchedules } from '@/content';

import { JsonLd } from '@/components/seo/json-ld';
import { PageHeader, Section } from '@/components/layout/page-shell';
import { WasteCalendar } from '@/components/features/waste-calendar';
import { Alert } from '@/components/ui/alert';
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
    path: '/servicos/agua-e-residuos/recolha',
    title: dict.waste.title,
    description: dict.waste.lead,
  });
}

export default async function WastePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const dict = getDictionary(locale);

  const [schedules, freguesias] = await Promise.all([getWasteSchedules(), getFreguesias()]);

  const crumbs = [
    { label: dict.common.home, href: '/' },
    { label: dict.services.title, href: '/servicos' },
    { label: serviceAreaLabels['agua-e-residuos'][locale], href: '/servicos/agua-e-residuos' },
    { label: dict.waste.title },
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />

      <PageHeader
        title={dict.waste.title}
        lead={dict.waste.lead}
        tone="alt"
        breadcrumbLabel={dict.common.breadcrumb}
        breadcrumb={[
          { label: dict.common.home, href: routes.home(locale) },
          { label: dict.services.title, href: routes.services(locale) },
          {
            label: serviceAreaLabels['agua-e-residuos'][locale],
            href: routes.serviceArea(locale, 'agua-e-residuos'),
          },
          { label: dict.waste.title },
        ]}
      />

      <Section>
        <WasteCalendar
          schedules={schedules}
          freguesias={freguesias}
          locale={locale}
          dict={dict}
          headingLevel={2}
        />
      </Section>

      <Section tone="alt">
        <div className="grid gap-6 lg:grid-cols-2">
          <Alert tone="info" title={dict.waste.bulky}>
            <p>{dict.waste.bulkyHint} A recolha é gratuita, até três volumes por pedido.</p>
            <p className="mt-3">
              <ButtonLink
                href={routes.serviceArea(locale, 'agua-e-residuos') + '/recolha-de-monstros'}
                icon="wrench"
              >
                Pedir recolha de monstros
              </ButtonLink>
            </p>
          </Alert>

          <div className="rounded-lg border border-line bg-surface p-5">
            <h2 className="font-serif text-xl">Regras simples que ajudam muito</h2>
            <ul className="mt-3 flex flex-col gap-2 text-ink-muted">
              <li>Coloque o contentor na rua depois das 20:00 da véspera, nunca antes.</li>
              <li>Feche bem os sacos — evita cheiros e animais.</li>
              <li>Achate as embalagens e as caixas de cartão: ocupam menos e vai lá mais.</li>
              <li>Vidro sempre no ecoponto verde, nunca no contentor comum.</li>
              <li>Óleo alimentar usado: garrafa fechada, no oleão junto ao mercado.</li>
            </ul>
          </div>
        </div>
      </Section>
    </>
  );
}
