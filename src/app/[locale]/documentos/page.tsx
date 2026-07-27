import type { Metadata } from 'next';
import Link from 'next/link';

import { getDictionary } from '@/i18n';
import { isLocale, type Locale } from '@/i18n/config';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';
import { routes } from '@/lib/routes';
import { getDocuments, getDocumentYears } from '@/content';
import { tx } from '@/content/types';
import { deburr } from '@/lib/utils';

import { JsonLd } from '@/components/seo/json-ld';
import { PageHeader } from '@/components/layout/page-shell';
import { DocumentRow, documentTypeLabels } from '@/components/content/document-row';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

const LIFE_EVENTS: { id: string; label: string }[] = [
  { id: 'construir-ou-remodelar', label: 'Construir ou remodelar' },
  { id: 'abrir-negocio', label: 'Abrir um negócio' },
  { id: 'mudar-de-casa', label: 'Mudar de casa' },
  { id: 'ter-um-filho', label: 'Ter um filho' },
  { id: 'estudar', label: 'Estudar' },
  { id: 'apoio-social', label: 'Precisar de apoio' },
  { id: 'animais', label: 'Animais' },
  { id: 'ambiente', label: 'Ambiente' },
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
    path: '/documentos',
    title: dict.documents.title,
    description: dict.documents.lead,
  });
}

export default async function DocumentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; tipo?: string; ano?: string; situacao?: string }>;
}) {
  const { locale: raw } = await params;
  const query = await searchParams;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const dict = getDictionary(locale);

  const [all, years] = await Promise.all([getDocuments(), getDocumentYears()]);

  const needle = deburr(query.q ?? '')
    .toLowerCase()
    .trim();

  const documents = all.filter((document) => {
    if (query.tipo && document.type !== query.tipo) return false;
    if (query.ano && String(document.year) !== query.ano) return false;
    if (query.situacao && !document.lifeEvents?.includes(query.situacao as never)) return false;
    if (needle) {
      const haystack = deburr(
        `${tx(document.title, locale)} ${document.summary ? tx(document.summary, locale) : ''} ${document.file.extractedText ?? ''}`,
      ).toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });

  function hrefWith(patch: Record<string, string | undefined>) {
    const search = new URLSearchParams();
    const merged = { ...query, ...patch };
    for (const [key, value] of Object.entries(merged)) {
      if (value) search.set(key, value);
    }
    const suffix = search.toString();
    return `${routes.documents(locale)}${suffix ? `?${suffix}` : ''}`;
  }

  const chip = (active: boolean) =>
    cn(
      'inline-flex min-h-11 items-center rounded-pill border px-4 text-sm no-underline',
      active
        ? 'border-primary-800 bg-primary-800 font-semibold text-white'
        : 'border-line-strong bg-surface text-ink hover:bg-surface-alt',
    );

  const crumbs = [{ label: dict.common.home, href: '/' }, { label: dict.documents.title }];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />

      <PageHeader
        title={dict.documents.title}
        lead={dict.documents.lead}
        tone="alt"
        breadcrumbLabel={dict.common.breadcrumb}
        breadcrumb={[
          { label: dict.common.home, href: routes.home(locale) },
          { label: dict.documents.title },
        ]}
      />

      <div className="container-page grid gap-10 py-10 lg:grid-cols-4 lg:py-14">
        {/* Filtros — funcionam sem JavaScript, como formulário GET e ligações */}
        <aside className="lg:col-span-1">
          <h2 className="font-serif text-xl">{dict.common.filters}</h2>

          <form action={routes.documents(locale)} method="get" role="search" className="mt-4">
            <label htmlFor="doc-q" className="mb-1.5 block text-sm font-semibold">
              {dict.common.search}
            </label>
            <div className="flex">
              <input
                id="doc-q"
                type="search"
                name="q"
                defaultValue={query.q ?? ''}
                placeholder={dict.documents.searchPlaceholder}
                className="min-h-11 w-full rounded-s-md border border-e-0 border-line-strong bg-surface px-3"
              />
              <button
                type="submit"
                className="inline-flex min-h-11 items-center rounded-e-md border border-primary-800 bg-primary-800 px-3 text-white"
                aria-label={dict.common.search}
              >
                <Icon name="search" size={18} />
              </button>
            </div>
            {query.tipo ? <input type="hidden" name="tipo" value={query.tipo} /> : null}
            {query.ano ? <input type="hidden" name="ano" value={query.ano} /> : null}
            {query.situacao ? <input type="hidden" name="situacao" value={query.situacao} /> : null}
          </form>

          <fieldset className="mt-6">
            <legend className="mb-2 text-sm font-semibold">{dict.documents.filterType}</legend>
            <ul className="flex flex-wrap gap-2">
              <li>
                <Link href={hrefWith({ tipo: undefined })} className={chip(!query.tipo)}>
                  {dict.common.all}
                </Link>
              </li>
              {(Object.keys(documentTypeLabels) as (keyof typeof documentTypeLabels)[]).map((type) => (
                <li key={type}>
                  <Link href={hrefWith({ tipo: type })} className={chip(query.tipo === type)}>
                    {documentTypeLabels[type]}
                  </Link>
                </li>
              ))}
            </ul>
          </fieldset>

          <fieldset className="mt-6">
            <legend className="mb-2 text-sm font-semibold">{dict.services.filterByLifeEvent}</legend>
            <ul className="flex flex-wrap gap-2">
              {LIFE_EVENTS.map((entry) => (
                <li key={entry.id}>
                  <Link
                    href={hrefWith({ situacao: query.situacao === entry.id ? undefined : entry.id })}
                    className={chip(query.situacao === entry.id)}
                  >
                    {entry.label}
                  </Link>
                </li>
              ))}
            </ul>
          </fieldset>

          <fieldset className="mt-6">
            <legend className="mb-2 text-sm font-semibold">{dict.documents.filterYear}</legend>
            <ul className="flex flex-wrap gap-2">
              <li>
                <Link href={hrefWith({ ano: undefined })} className={chip(!query.ano)}>
                  {dict.common.all}
                </Link>
              </li>
              {years.map((year) => (
                <li key={year}>
                  <Link href={hrefWith({ ano: String(year) })} className={chip(query.ano === String(year))}>
                    {year}
                  </Link>
                </li>
              ))}
            </ul>
          </fieldset>

          {query.q || query.tipo || query.ano || query.situacao ? (
            <Link
              href={routes.documents(locale)}
              className="mt-6 inline-flex min-h-11 items-center gap-1.5 text-primary-600 underline underline-offset-[0.2em]"
            >
              <Icon name="close" size={16} />
              {dict.common.clearFilters}
            </Link>
          ) : null}
        </aside>

        <div className="lg:col-span-3">
          <p className="mb-4 text-sm text-ink-muted" aria-live="polite">
            {documents.length} {documents.length === 1 ? dict.common.result : dict.common.results}
          </p>

          {documents.length === 0 ? (
            <p className="rounded-lg border border-line bg-surface-alt p-8 text-ink-muted">
              {dict.documents.empty}
            </p>
          ) : (
            <ul className="rounded-lg border border-line bg-surface px-5">
              {documents.map((document) => (
                <DocumentRow key={document.id} document={document} locale={locale} dict={dict} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
