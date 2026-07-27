import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getDictionary } from '@/i18n';
import { isLocale, locales, localePath, type Locale } from '@/i18n/config';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';
import { routes } from '@/lib/routes';
import { editorialPages, findEditorialPage, type PageBlock } from '@/content/data/pages';
import { getDocuments, getExecutivo, getAssembleia, getOpenTenders } from '@/content';
import { tx } from '@/content/types';
import { mainNavigation, navLabel } from '@/lib/navigation';
import { formatDate, formatDateLong, formatFileSize } from '@/lib/format';
import { site } from '@/lib/site';

import { JsonLd } from '@/components/seo/json-ld';
import { PageHeader, Section } from '@/components/layout/page-shell';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { TextLink } from '@/components/ui/link';

/**
 * Páginas editoriais vindas da coleção `Paginas`.
 *
 * Esta rota apanha-tudo só entra quando nenhuma rota mais específica serve —
 * o Next dá prioridade aos segmentos estáticos. O que aqui não se encontra é
 * um 404 verdadeiro e segue para a página de erro.
 */
export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    editorialPages.map((page) => ({ locale, slug: page.path.split('/') })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const page = findEditorialPage(slug.join('/'));
  if (!page) return {};

  return buildMetadata({
    locale,
    path: `/${page.path}`,
    title: tx(page.title, locale),
    description: tx(page.lead, locale),
  });
}

export default async function EditorialPageRoute({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const dict = getDictionary(locale);

  const page = findEditorialPage(slug.join('/'));
  if (!page) notFound();

  const [executivo, assembleia, tenders, datasets] = await Promise.all([
    getExecutivo(),
    getAssembleia(),
    getOpenTenders(),
    getDocuments({ type: 'dados' }),
  ]);

  const crumbs = [
    { label: dict.common.home, href: '/' },
    ...(page.parent ? [{ label: tx(page.parent.label, locale), href: `/${page.parent.path}` }] : []),
    { label: tx(page.title, locale) },
  ];

  function renderBlock(block: PageBlock, index: number) {
    switch (block.type) {
      case 'prose':
        return (
          <Section key={index} tone={index % 2 === 1 ? 'alt' : 'default'} title={block.heading ? tx(block.heading, locale) : undefined}>
            <div className="prose-cm">
              {tx(block.paragraphs, locale).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </Section>
        );

      case 'list':
        return (
          <Section key={index} tone={index % 2 === 1 ? 'alt' : 'default'} title={tx(block.heading, locale)}>
            <ul className="measure flex flex-col gap-3">
              {tx(block.items, locale).map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Icon name="check" size={18} className="mt-1 shrink-0 text-primary-700" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>
        );

      case 'links':
        return (
          <Section key={index} tone={index % 2 === 1 ? 'alt' : 'default'} title={tx(block.heading, locale)}>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {block.links.map((link) => (
                <li key={link.href} className="flex">
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full flex-col gap-1.5 rounded-lg border border-line bg-surface p-5 text-ink no-underline hover:border-primary-600"
                    >
                      <span className="flex items-center gap-1.5 font-serif text-lg font-semibold">
                        {tx(link.label, locale)}
                        <Icon name="external" size={15} />
                      </span>
                      {link.text ? (
                        <span className="text-sm text-ink-muted">{tx(link.text, locale)}</span>
                      ) : null}
                    </a>
                  ) : (
                    <Link
                      href={localePath(locale, `/${link.href.replace(/^\//, '')}`)}
                      className="group flex w-full flex-col gap-1.5 rounded-lg border border-line bg-surface p-5 text-ink no-underline hover:border-primary-600 hover:bg-primary-100/40"
                    >
                      <span className="font-serif text-lg font-semibold group-hover:underline underline-offset-[0.2em]">
                        {tx(link.label, locale)}
                      </span>
                      {link.text ? (
                        <span className="text-sm text-ink-muted">{tx(link.text, locale)}</span>
                      ) : null}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        );

      case 'steps':
        return (
          <Section key={index} tone={index % 2 === 1 ? 'alt' : 'default'} title={tx(block.heading, locale)}>
            <ol className="measure flex flex-col gap-5">
              {block.steps.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-pill border border-primary-600 font-serif font-semibold text-primary-700"
                  >
                    {i + 1}
                  </span>
                  <span>
                    <span className="block font-semibold">{tx(step.title, locale)}</span>
                    <span className="mt-0.5 block text-ink-muted">{tx(step.detail, locale)}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Section>
        );

      case 'people': {
        const members = block.body === 'executivo' ? executivo : assembleia;
        return (
          <Section key={index} tone={index % 2 === 1 ? 'alt' : 'default'} title={tx(block.heading, locale)}>
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {members.map((person) => (
                <li key={person.id} className="rounded-lg border border-line bg-surface p-5">
                  <p className="font-serif text-lg font-semibold">{person.name}</p>
                  <p className="mt-0.5 text-ink-muted">{tx(person.role, locale)}</p>
                  {person.portfolio ? (
                    <>
                      <p className="mt-3 text-sm font-semibold text-ink-muted">Pelouros</p>
                      <ul className="mt-1 flex flex-wrap gap-1.5">
                        {tx(person.portfolio, locale).map((item) => (
                          <li key={item}>
                            <Badge>{item}</Badge>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                  {person.email ? (
                    <p className="mt-3 text-sm">
                      <TextLink href={`mailto:${person.email}`} className="break-all">
                        {person.email}
                      </TextLink>
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </Section>
        );
      }

      case 'tenders':
        return (
          <Section key={index} tone={index % 2 === 1 ? 'alt' : 'default'} title={tx(block.heading, locale)}>
            {tenders.length === 0 ? (
              <p className="text-ink-muted">Não há procedimentos com prazo aberto neste momento.</p>
            ) : (
              <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
                {tenders.map((tender) => (
                  <li key={tender.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
                    <Badge tone={tender.kind === 'recrutamento' ? 'info' : 'neutral'}>
                      {tender.reference}
                    </Badge>
                    <span className="flex-1 basis-64 font-medium">{tx(tender.title, locale)}</span>
                    <span className="text-sm text-ink-muted">
                      até <time dateTime={tender.deadline}>{formatDate(tender.deadline, locale)}</time>
                    </span>
                    {tender.documents[0] ? (
                      <a
                        href={tender.documents[0].href}
                        download
                        className="inline-flex items-center gap-1.5 text-primary-600 underline underline-offset-[0.2em]"
                      >
                        <Icon name="download" size={16} />
                        {tx(tender.documents[0].label, locale)}
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </Section>
        );

      case 'datasets':
        return (
          <Section key={index} tone={index % 2 === 1 ? 'alt' : 'default'} title={tx(block.heading, locale)}>
            <ul className="grid gap-4 md:grid-cols-2">
              {datasets.map((dataset) => (
                <li key={dataset.id} className="rounded-lg border border-line bg-surface p-5">
                  <p className="font-serif text-lg font-semibold">{tx(dataset.title, locale)}</p>
                  {dataset.summary ? (
                    <p className="mt-1 text-sm text-ink-muted">{tx(dataset.summary, locale)}</p>
                  ) : null}
                  <p className="mt-3 flex flex-wrap items-center gap-3">
                    <a
                      href={dataset.file.href}
                      download
                      className="inline-flex items-center gap-1.5 text-primary-600 underline underline-offset-[0.2em]"
                    >
                      <Icon name="download" size={16} />
                      {dataset.file.format.toUpperCase()}
                    </a>
                    <span className="text-sm text-ink-muted">
                      {formatFileSize(dataset.file.bytes, locale)} · atualizado a{' '}
                      {formatDate(dataset.publishedAt, locale)}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          </Section>
        );

      case 'contact':
        return (
          <Section key={index} tone={index % 2 === 1 ? 'alt' : 'default'} title={tx(block.heading, locale)}>
            <div className="measure rounded-lg border border-line bg-surface p-5">
              <address className="not-italic">
                {site.legalName}
                <br />
                {site.address.street}, {site.address.postalCode} {site.address.city}
              </address>
              <p className="mt-3 flex flex-col gap-1.5">
                <TextLink href={`tel:${site.contact.phoneE164}`}>{site.contact.phone}</TextLink>
                <TextLink href={`mailto:${site.contact.email}`}>{site.contact.email}</TextLink>
              </p>
              <p className="mt-3">
                <TextLink href={routes.contacts(locale)}>Ver todos os contactos</TextLink>
              </p>
            </div>
          </Section>
        );

      case 'callout':
        return (
          <Section key={index} tone={index % 2 === 1 ? 'alt' : 'default'}>
            <Alert tone={block.tone} title={tx(block.heading, locale)} className="measure">
              {tx(block.body, locale)}
            </Alert>
          </Section>
        );

      case 'sitemap':
        return (
          <Section key={index} title={tx(block.heading, locale)}>
            <ul className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {mainNavigation.map((section) => (
                <li key={section.id}>
                  <h3 className="font-serif text-xl">
                    <Link
                      href={localePath(locale, section.href)}
                      className="text-ink no-underline hover:underline underline-offset-[0.2em]"
                    >
                      {navLabel(section, locale)}
                    </Link>
                  </h3>
                  {section.groups.map((group) => (
                    <div key={group.id} className="mt-3">
                      <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
                        {group.title[locale]}
                      </p>
                      <ul className="mt-1 flex flex-col gap-1">
                        {group.items.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={localePath(locale, item.href)}
                              className="text-primary-600 no-underline hover:underline underline-offset-[0.2em]"
                            >
                              {navLabel(item, locale)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </li>
              ))}
            </ul>
          </Section>
        );

      default:
        return null;
    }
  }

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />

      <PageHeader
        title={tx(page.title, locale)}
        lead={tx(page.lead, locale)}
        tone="alt"
        breadcrumbLabel={dict.common.breadcrumb}
        breadcrumb={[
          { label: dict.common.home, href: routes.home(locale) },
          ...(page.parent
            ? [{ label: tx(page.parent.label, locale), href: localePath(locale, `/${page.parent.path}`) }]
            : []),
          { label: tx(page.title, locale) },
        ]}
      />

      {page.blocks.map(renderBlock)}

      <div className="container-page pb-10">
        <p className="text-sm text-ink-muted">
          {dict.common.updatedOn} <time dateTime={page.updatedAt}>{formatDateLong(page.updatedAt, locale)}</time>
        </p>
      </div>
    </>
  );
}
