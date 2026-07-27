import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getDictionary } from '@/i18n';
import { isLocale, locales, localePath, type Locale } from '@/i18n/config';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';
import { routes } from '@/lib/routes';
import { getDocument, getDocuments } from '@/content';
import { tx } from '@/content/types';
import { formatDateLong, formatFileSize } from '@/lib/format';

import { JsonLd } from '@/components/seo/json-ld';
import { Section } from '@/components/layout/page-shell';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { ButtonLink } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { documentTypeLabels } from '@/components/content/document-row';

export async function generateStaticParams() {
  const documents = await getDocuments();
  return locales.flatMap((locale) => documents.map((doc) => ({ locale, slug: doc.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const document = await getDocument(slug);
  if (!document) return {};

  return buildMetadata({
    locale,
    path: `/documentos/${slug}`,
    title: tx(document.title, locale),
    description: document.summary ? tx(document.summary, locale) : tx(document.file.label, locale),
  });
}

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const dict = getDictionary(locale);

  const document = await getDocument(slug);
  if (!document) notFound();

  const siblings = (await getDocuments({ type: document.type }))
    .filter((item) => item.id !== document.id)
    .slice(0, 5);

  const crumbs = [
    { label: dict.common.home, href: '/' },
    { label: dict.documents.title, href: '/documentos' },
    { label: tx(document.title, locale) },
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
              { label: dict.documents.title, href: routes.documents(locale) },
              { label: tx(document.title, locale) },
            ]}
          />

          <div className="measure">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge tone={document.type === 'edital' ? 'warning' : 'neutral'}>
                {documentTypeLabels[document.type]}
              </Badge>
              <time dateTime={document.publishedAt} className="text-sm text-ink-muted">
                {dict.common.publishedOn} {formatDateLong(document.publishedAt, locale)}
              </time>
            </div>

            <h1 className="text-3xl">{tx(document.title, locale)}</h1>
            {document.summary ? (
              <p className="mt-3 text-lg text-ink-muted">{tx(document.summary, locale)}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-3 lg:py-14">
        <div className="lg:col-span-2">
          {document.onlinePath ? (
            <Alert tone="success" title={dict.documents.doOnline} className="mb-8">
              <p>
                Este pedido pode ser tratado online, sem imprimir nem preencher à mão. O formulário
                em PDF fica disponível como alternativa.
              </p>
              <p className="mt-3">
                <ButtonLink href={localePath(locale, document.onlinePath)} icon="arrowRight">
                  {dict.documents.doOnline}
                </ButtonLink>
              </p>
            </Alert>
          ) : null}

          <h2 className="text-2xl">{dict.common.download}</h2>
          <a
            href={document.file.href}
            download
            className="mt-4 flex items-start gap-4 rounded-lg border border-line bg-surface p-5 text-ink no-underline hover:border-primary-600"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-md border border-line bg-surface-alt text-primary-700">
              <Icon name="fileText" size={24} />
            </span>
            <span>
              <span className="block font-semibold underline underline-offset-[0.2em]">
                {tx(document.file.label, locale)}
              </span>
              <span className="mt-0.5 block text-sm text-ink-muted">
                {document.file.format.toUpperCase()}, {formatFileSize(document.file.bytes, locale)}
              </span>
            </span>
            <Icon name="download" size={22} className="ms-auto mt-1 shrink-0 text-primary-700" />
          </a>

          {document.file.extractedText ? (
            <>
              <h2 className="mt-12 text-2xl">Conteúdo do documento</h2>
              <p className="mt-2 text-sm text-ink-muted">
                Texto extraído automaticamente do ficheiro, para leitura e pesquisa sem ter de o
                descarregar.
              </p>
              <p className="measure mt-4 rounded-lg border border-line bg-surface-alt p-5 text-ink">
                {document.file.extractedText}
              </p>
            </>
          ) : null}
        </div>

        <aside>
          <div className="rounded-lg border border-line bg-surface p-5">
            <h2 className="font-serif text-lg">Ficha</h2>
            <dl className="mt-3 flex flex-col gap-3 text-sm">
              <div>
                <dt className="font-semibold">{dict.common.type}</dt>
                <dd className="text-ink-muted">{documentTypeLabels[document.type]}</dd>
              </div>
              <div>
                <dt className="font-semibold">{dict.common.year}</dt>
                <dd className="text-ink-muted tabular-nums">{document.year}</dd>
              </div>
              <div>
                <dt className="font-semibold">{dict.documents.filterArea}</dt>
                <dd className="text-ink-muted">{document.area}</dd>
              </div>
              <div>
                <dt className="font-semibold">Formato</dt>
                <dd className="text-ink-muted">
                  {document.file.format.toUpperCase()}, {formatFileSize(document.file.bytes, locale)}
                </dd>
              </div>
            </dl>
          </div>

          {siblings.length > 0 ? (
            <div className="mt-6 rounded-lg border border-line bg-surface p-5">
              <h2 className="font-serif text-lg">{documentTypeLabels[document.type]}</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {siblings.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={routes.document(locale, item)}
                      className="text-primary-600 underline underline-offset-[0.2em]"
                    >
                      {tx(item.title, locale)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>

      <Section tone="alt">
        <ButtonLink href={routes.documents(locale)} variant="subtle" icon="arrowLeft">
          {dict.documents.title}
        </ButtonLink>
      </Section>
    </>
  );
}
