import type { Metadata } from 'next';

import { getDictionary } from '@/i18n';
import { isLocale, type Locale } from '@/i18n/config';
import { breadcrumbJsonLd, buildMetadata, governmentOrganizationJsonLd } from '@/lib/seo';
import { routes } from '@/lib/routes';
import { site } from '@/lib/site';
import { getFreguesias } from '@/content';

import { JsonLd } from '@/components/seo/json-ld';
import { PageHeader, Section } from '@/components/layout/page-shell';
import { Icon } from '@/components/ui/icon';
import { TextLink } from '@/components/ui/link';
import { ButtonLink } from '@/components/ui/button';
import { DataTable, Tbody, Td, Th, Thead, Tr } from '@/components/ui/table';

const DEPARTMENTS = [
  { name: 'Atendimento ao Munícipe', phone: '279 468 120', email: 'atendimento@cm-alfandegadafe.pt' },
  { name: 'Divisão de Urbanismo', phone: '279 468 122', email: 'urbanismo@cm-alfandegadafe.pt' },
  { name: 'Divisão de Águas e Saneamento', phone: '279 468 129', email: 'aguas@cm-alfandegadafe.pt' },
  { name: 'Divisão Financeira — Tesouraria', phone: '279 468 124', email: 'financeira@cm-alfandegadafe.pt' },
  { name: 'Divisão de Ação Social', phone: '279 468 126', email: 'social@cm-alfandegadafe.pt' },
  { name: 'Divisão de Educação', phone: '279 468 127', email: 'educacao@cm-alfandegadafe.pt' },
  { name: 'Divisão de Ambiente', phone: '279 468 128', email: 'ambiente@cm-alfandegadafe.pt' },
  { name: 'Gabinete de Apoio ao Empreendedor', phone: '279 468 131', email: 'empreendedor@cm-alfandegadafe.pt' },
  { name: 'Posto de Turismo', phone: site.tourism.phone, email: site.tourism.email },
];

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
    path: '/municipio/contactos',
    title: dict.contact.title,
    description: dict.contact.lead,
  });
}

export default async function ContactsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const dict = getDictionary(locale);
  const freguesias = await getFreguesias();

  const mapQuery = encodeURIComponent(
    `${site.address.street}, ${site.address.postalCode} ${site.address.city}, Portugal`,
  );

  const crumbs = [
    { label: dict.common.home, href: '/' },
    { label: dict.nav.municipio, href: '/municipio' },
    { label: dict.contact.title },
  ];

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd(locale, crumbs), governmentOrganizationJsonLd()]} />

      <PageHeader
        title={dict.contact.title}
        lead={dict.contact.lead}
        tone="alt"
        breadcrumbLabel={dict.common.breadcrumb}
        breadcrumb={[
          { label: dict.common.home, href: routes.home(locale) },
          { label: dict.nav.municipio, href: routes.municipality(locale) },
          { label: dict.contact.title },
        ]}
        aside={
          <ButtonLink href={routes.booking(locale)} icon="calendar">
            {dict.booking.title}
          </ButtonLink>
        }
      />

      <Section>
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl">{dict.contact.address}</h2>
            <address className="mt-3 text-lg not-italic">
              {site.legalName}
              <br />
              {site.address.street}
              <br />
              {site.address.postalCode} {site.address.city}
              <br />
              <span className="text-ink-muted">
                Distrito de {site.address.district}, {site.address.region}
              </span>
            </address>

            <ul className="mt-5 flex flex-col gap-3">
              <li className="flex items-center gap-2.5">
                <Icon name="phone" size={19} className="text-primary-700" />
                <TextLink href={`tel:${site.contact.phoneE164}`}>{site.contact.phone}</TextLink>
                <span className="text-sm text-ink-muted">({dict.contact.callCost})</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Icon name="mail" size={19} className="text-primary-700" />
                <TextLink href={`mailto:${site.contact.email}`}>{site.contact.email}</TextLink>
              </li>
              <li className="flex items-center gap-2.5">
                <Icon name="fileText" size={19} className="text-primary-700" />
                <span>NIPC {site.nif}</span>
              </li>
            </ul>

            <h2 className="mt-10 text-2xl">{dict.contact.openingHours}</h2>
            <dl className="mt-3">
              {site.openingHours.map((entry) => (
                <div key={entry.days} className="flex flex-col border-b border-line py-2 sm:flex-row sm:gap-4">
                  <dt className="font-semibold sm:w-64">{entry.days}</dt>
                  <dd className="text-ink-muted">{entry.hours}</dd>
                </div>
              ))}
            </dl>

            <ButtonLink
              href={`https://www.openstreetmap.org/search?query=${mapQuery}`}
              external
              variant="subtle"
              icon="mapPin"
              className="mt-6"
            >
              {dict.contact.getDirections}
            </ButtonLink>
          </div>

          <div>
            <h2 className="text-2xl">{dict.contact.emergency}</h2>
            <ul className="mt-3 divide-y divide-line rounded-lg border border-line bg-surface">
              {site.emergency.map((entry) => (
                <li key={entry.label} className="flex items-center justify-between gap-4 p-4">
                  <span>{entry.label}</span>
                  <TextLink
                    href={`tel:${entry.number.replace(/\s/g, '')}`}
                    className="shrink-0 font-serif text-lg font-semibold tabular-nums"
                  >
                    {entry.number}
                  </TextLink>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-ink-muted">
              Estes números continuam acessíveis mesmo sem ligação à Internet, através da versão
              instalada deste portal.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="alt" title={dict.contact.services} headingLevel={2}>
        <DataTable caption={dict.contact.services} captionVisible={false}>
          <Thead>
            <Tr>
              <Th>Serviço</Th>
              <Th>{dict.contact.phone}</Th>
              <Th>{dict.contact.email}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {DEPARTMENTS.map((department) => (
              <Tr key={department.name}>
                <Th scope="row" className="bg-surface font-medium">
                  {department.name}
                </Th>
                <Td>
                  <TextLink href={`tel:+351${department.phone.replace(/\s/g, '')}`} className="tabular-nums">
                    {department.phone}
                  </TextLink>
                </Td>
                <Td>
                  <TextLink href={`mailto:${department.email}`} className="break-all">
                    {department.email}
                  </TextLink>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </DataTable>
      </Section>

      <Section title={dict.freguesias.title} headingLevel={2}>
        <DataTable caption={dict.freguesias.title} captionVisible={false}>
          <Thead>
            <Tr>
              <Th>{dict.forms.freguesia}</Th>
              <Th>{dict.freguesias.president}</Th>
              <Th>{dict.contact.phone}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {freguesias.map((freguesia) => (
              <Tr key={freguesia.slug}>
                <Th scope="row" className="bg-surface font-medium">
                  <TextLink href={routes.freguesia(locale, freguesia)} quiet>
                    {freguesia.name}
                  </TextLink>
                </Th>
                <Td>{freguesia.president}</Td>
                <Td>
                  {freguesia.phone ? (
                    <TextLink
                      href={`tel:+351${freguesia.phone.replace(/\s/g, '')}`}
                      className="tabular-nums"
                    >
                      {freguesia.phone}
                    </TextLink>
                  ) : (
                    '—'
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </DataTable>
      </Section>
    </>
  );
}
