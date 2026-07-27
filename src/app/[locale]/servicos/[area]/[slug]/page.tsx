import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getDictionary } from '@/i18n';
import { isLocale, locales, localePath, type Locale } from '@/i18n/config';
import { breadcrumbJsonLd, buildMetadata, governmentServiceJsonLd } from '@/lib/seo';
import { routes, serviceAreaLabels } from '@/lib/routes';
import { getDocuments, getService, getServices } from '@/content';
import { tx } from '@/content/types';
import { site } from '@/lib/site';

import { JsonLd } from '@/components/seo/json-ld';
import { PageHeader, Section } from '@/components/layout/page-shell';
import { Card, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { ButtonLink } from '@/components/ui/button';
import { FileLink, TextLink } from '@/components/ui/link';

export async function generateStaticParams() {
  const services = await getServices();
  return locales.flatMap((locale) =>
    services.map((service) => ({ locale, area: service.area, slug: service.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const service = await getService(slug);
  if (!service) return {};

  return buildMetadata({
    locale,
    path: `/servicos/${service.area}/${service.slug}`,
    title: tx(service.title, locale),
    description: tx(service.summary, locale),
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; area: string; slug: string }>;
}) {
  const { locale: raw, area, slug } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const dict = getDictionary(locale);

  const service = await getService(slug);
  if (!service || service.area !== area) notFound();

  const [allServices, allDocuments] = await Promise.all([getServices(), getDocuments()]);
  const forms = allDocuments.filter((document) => service.forms?.includes(document.id));
  const related = allServices.filter((item) => service.relatedServices?.includes(item.slug));

  const crumbs = [
    { label: dict.common.home, href: '/' },
    { label: dict.services.title, href: '/servicos' },
    { label: serviceAreaLabels[service.area][locale], href: `/servicos/${service.area}` },
    { label: tx(service.title, locale) },
  ];

  const channelLabels: Record<string, string> = {
    online: dict.services.online,
    presencial: dict.services.inPerson,
    correio: dict.services.byPost,
    telefone: dict.contact.phone,
  };

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(locale, crumbs),
          governmentServiceJsonLd({
            locale,
            name: tx(service.title, locale),
            description: tx(service.summary, locale),
            path: `/servicos/${service.area}/${service.slug}`,
            audience: tx(service.audience, locale),
            channelOnline: service.channels.includes('online'),
          }),
        ]}
      />

      <PageHeader
        title={tx(service.title, locale)}
        lead={tx(service.summary, locale)}
        tone="alt"
        breadcrumbLabel={dict.common.breadcrumb}
        breadcrumb={[
          { label: dict.common.home, href: routes.home(locale) },
          { label: dict.services.title, href: routes.services(locale) },
          {
            label: serviceAreaLabels[service.area][locale],
            href: routes.serviceArea(locale, service.area),
          },
          { label: tx(service.title, locale) },
        ]}
        aside={
          service.onlineUrl ? (
            <ButtonLink href={localePath(locale, service.onlineUrl)} size="lg" icon="arrowRight">
              {dict.services.startOnline}
            </ButtonLink>
          ) : (
            <ButtonLink href={routes.booking(locale)} size="lg" icon="calendar">
              {dict.booking.title}
            </ButtonLink>
          )
        }
      />

      <div className="container-page grid gap-10 py-10 lg:grid-cols-3 lg:py-14">
        <div className="lg:col-span-2">
          {/* Kernangaben zuerst: Kanal, Dauer, Kosten */}
          <ul className="mb-8 grid gap-4 sm:grid-cols-3">
            <li className="rounded-lg border border-line bg-surface p-4">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-muted">
                <Icon name="clock" size={16} className="text-primary-700" />
                {dict.services.deadline}
              </span>
              <span className="mt-1 block font-medium">{tx(service.processingTime, locale)}</span>
            </li>
            <li className="rounded-lg border border-line bg-surface p-4">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-muted">
                <Icon name="euro" size={16} className="text-primary-700" />
                {dict.services.cost}
              </span>
              <span className="mt-1 block font-medium">{tx(service.fee, locale)}</span>
            </li>
            <li className="rounded-lg border border-line bg-surface p-4">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-muted">
                <Icon name="users" size={16} className="text-primary-700" />
                {dict.services.whoFor}
              </span>
              <span className="mt-1 block font-medium">{tx(service.audience, locale)}</span>
            </li>
          </ul>

          <h2 className="text-2xl">{dict.services.howTo}</h2>
          <ol className="mt-4 flex flex-col gap-4">
            {service.steps.map((step, index) => (
              <li key={index} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-pill border border-primary-600 font-serif font-semibold text-primary-700"
                >
                  {index + 1}
                </span>
                <span className="measure">
                  <span className="block font-semibold">
                    <span className="sr-only">Passo {index + 1}: </span>
                    {tx(step.title, locale)}
                  </span>
                  <span className="mt-0.5 block text-ink-muted">{tx(step.detail, locale)}</span>
                </span>
              </li>
            ))}
          </ol>

          <h2 className="mt-12 text-2xl">{dict.services.documents}</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {tx(service.requiredDocuments, locale).map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <Icon name="check" size={18} className="mt-1 shrink-0 text-success" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {service.legislation ? (
            <>
              <h2 className="mt-12 text-2xl">{dict.services.legislation}</h2>
              <ul className="mt-3 flex flex-col gap-2 text-ink-muted">
                {tx(service.legislation, locale).map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Icon name="scale" size={18} className="mt-1 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>

        <aside className="flex flex-col gap-6">
          <Card>
            <CardBody>
              <h2 className="font-serif text-lg">{dict.services.filterByChannel}</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {service.channels.map((channel) => (
                  <li key={channel}>
                    <Badge tone={channel === 'online' ? 'success' : 'neutral'}>
                      {channelLabels[channel] ?? channel}
                    </Badge>
                  </li>
                ))}
              </ul>

              <h3 className="mt-6 font-serif text-lg">{dict.services.contactService}</h3>
              <p className="mt-1 text-ink-muted">{service.department}</p>
              <p className="mt-3 flex flex-col gap-1.5 text-sm">
                <TextLink href={`tel:${site.contact.phoneE164}`}>{site.contact.phone}</TextLink>
                <TextLink href={`mailto:${site.contact.email}`}>{site.contact.email}</TextLink>
              </p>
            </CardBody>
          </Card>

          {forms.length > 0 ? (
            <Card>
              <CardBody>
                <h2 className="font-serif text-lg">{dict.services.relatedForms}</h2>
                <ul className="mt-3 flex flex-col gap-3">
                  {forms.map((document) => (
                    <li key={document.id}>
                      <FileLink
                        href={document.file.href}
                        format={document.file.format}
                        bytes={document.file.bytes}
                        locale={locale}
                      >
                        {tx(document.title, locale)}
                      </FileLink>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ) : null}

          {related.length > 0 ? (
            <Card>
              <CardBody>
                <h2 className="font-serif text-lg">{dict.services.relatedServices}</h2>
                <ul className="mt-3 flex flex-col gap-2">
                  {related.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={routes.service(locale, item)}
                        className="inline-flex items-center gap-1.5 text-primary-600 underline underline-offset-[0.2em]"
                      >
                        {tx(item.title, locale)}
                        <Icon name="arrowRight" size={15} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ) : null}
        </aside>
      </div>

      <Section tone="alt">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="measure text-ink-muted">
            Não encontrou o que procurava? Fale connosco pelo telefone {site.contact.phone} ou marque
            atendimento.
          </p>
          <ButtonLink href={routes.contacts(locale)} variant="subtle" icon="phone">
            {dict.contact.title}
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
