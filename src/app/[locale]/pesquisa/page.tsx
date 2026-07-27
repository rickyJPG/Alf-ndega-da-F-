import type { Metadata } from 'next';
import Link from 'next/link';

import { getDictionary } from '@/i18n';
import { isLocale, type Locale } from '@/i18n/config';
import { buildMetadata } from '@/lib/seo';
import { routes } from '@/lib/routes';
import { getSearchIndex } from '@/lib/search/index-builder';
import type { SearchType } from '@/lib/search/engine';

import { PageHeader } from '@/components/layout/page-shell';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

const TYPE_LABELS: Record<SearchType, string> = {
  servico: 'Serviço',
  noticia: 'Notícia',
  evento: 'Evento',
  documento: 'Documento',
  consulta: 'Consulta pública',
  reuniao: 'Reunião',
  pagina: 'Página',
  freguesia: 'Freguesia',
};

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
    path: '/pesquisa',
    title: dict.search.title,
    description: dict.common.searchLabel,
    // Ergebnisseiten gehören nicht in den Index einer Suchmaschine.
    noIndex: true,
  });
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; tipo?: string; rubrica?: string; ano?: string }>;
}) {
  const { locale: raw } = await params;
  const query = await searchParams;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const dict = getDictionary(locale);

  const term = (query.q ?? '').trim();
  const index = await getSearchIndex(locale);
  const result = term
    ? index.search(term, { type: query.tipo, section: query.rubrica, year: query.ano })
    : { hits: [], total: 0, facets: { type: [], section: [], year: [] }, suggestion: undefined };

  function hrefWith(patch: Record<string, string | undefined>) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...query, ...patch })) {
      if (value) search.set(key, value);
    }
    return `${routes.search(locale)}?${search.toString()}`;
  }

  const chip = (active: boolean) =>
    cn(
      'inline-flex min-h-11 items-center gap-2 rounded-pill border px-4 text-sm no-underline',
      active
        ? 'border-primary-800 bg-primary-800 font-semibold text-white'
        : 'border-line-strong bg-surface text-ink hover:bg-surface-alt',
    );

  return (
    <>
      <PageHeader
        title={dict.search.title}
        lead={term ? `${dict.search.resultsFor} «${term}»` : dict.common.searchLabel}
        tone="alt"
        breadcrumbLabel={dict.common.breadcrumb}
        breadcrumb={[
          { label: dict.common.home, href: routes.home(locale) },
          { label: dict.search.title },
        ]}
      />

      <div className="container-page py-10 md:py-14">
        <form action={routes.search(locale)} method="get" role="search" className="max-w-2xl">
          <label htmlFor="search-q" className="sr-only">
            {dict.common.searchLabel}
          </label>
          <div className="flex">
            <input
              id="search-q"
              type="search"
              name="q"
              defaultValue={term}
              autoFocus
              placeholder={dict.common.searchPlaceholder}
              className="min-h-12 w-full rounded-s-md border-2 border-e-0 border-primary-800 bg-surface px-4 text-lg"
            />
            <button
              type="submit"
              className="inline-flex min-h-12 items-center gap-2 rounded-e-md border-2 border-accent-600 bg-accent-600 px-5 font-semibold text-white hover:bg-accent-hover"
            >
              <Icon name="search" size={19} />
              {dict.common.search}
            </button>
          </div>
        </form>

        {term ? (
          <>
            <p className="mt-6 text-sm text-ink-muted" aria-live="polite">
              {result.total} {result.total === 1 ? dict.common.result : dict.common.results}
            </p>

            {result.suggestion ? (
              <p className="mt-2">
                {dict.search.didYouMean}{' '}
                <Link
                  href={hrefWith({ q: result.suggestion })}
                  className="font-semibold text-primary-600 underline underline-offset-[0.2em]"
                >
                  {result.suggestion}
                </Link>
                ?
              </p>
            ) : null}

            <div className="mt-8 grid gap-10 lg:grid-cols-4">
              {/* Facetten */}
              <aside className="lg:col-span-1">
                <h2 className="font-serif text-xl">{dict.common.filters}</h2>

                {result.facets.type.length > 0 ? (
                  <fieldset className="mt-4">
                    <legend className="mb-2 text-sm font-semibold">{dict.search.facetType}</legend>
                    <ul className="flex flex-wrap gap-2">
                      <li>
                        <Link href={hrefWith({ tipo: undefined })} className={chip(!query.tipo)}>
                          {dict.common.all}
                        </Link>
                      </li>
                      {result.facets.type.map((facet) => (
                        <li key={facet.value}>
                          <Link
                            href={hrefWith({ tipo: facet.value })}
                            className={chip(query.tipo === facet.value)}
                          >
                            {TYPE_LABELS[facet.value as SearchType] ?? facet.value}
                            <span className="tabular-nums opacity-70">{facet.count}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </fieldset>
                ) : null}

                {result.facets.section.length > 1 ? (
                  <fieldset className="mt-6">
                    <legend className="mb-2 text-sm font-semibold">{dict.search.facetSection}</legend>
                    <ul className="flex flex-wrap gap-2">
                      <li>
                        <Link href={hrefWith({ rubrica: undefined })} className={chip(!query.rubrica)}>
                          {dict.common.all}
                        </Link>
                      </li>
                      {result.facets.section.slice(0, 10).map((facet) => (
                        <li key={facet.value}>
                          <Link
                            href={hrefWith({ rubrica: facet.value })}
                            className={chip(query.rubrica === facet.value)}
                          >
                            {facet.value}
                            <span className="tabular-nums opacity-70">{facet.count}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </fieldset>
                ) : null}

                {result.facets.year.length > 1 ? (
                  <fieldset className="mt-6">
                    <legend className="mb-2 text-sm font-semibold">{dict.search.facetYear}</legend>
                    <ul className="flex flex-wrap gap-2">
                      <li>
                        <Link href={hrefWith({ ano: undefined })} className={chip(!query.ano)}>
                          {dict.common.all}
                        </Link>
                      </li>
                      {result.facets.year.map((facet) => (
                        <li key={facet.value}>
                          <Link
                            href={hrefWith({ ano: facet.value })}
                            className={chip(query.ano === facet.value)}
                          >
                            {facet.value}
                            <span className="tabular-nums opacity-70">{facet.count}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </fieldset>
                ) : null}
              </aside>

              {/* Ergebnisse */}
              <div className="lg:col-span-3">
                {result.hits.length === 0 ? (
                  <div className="rounded-lg border border-line bg-surface-alt p-8">
                    <p className="font-serif text-xl">
                      {dict.search.noResultsFor} «{term}»
                    </p>
                    <p className="mt-2 text-ink-muted">{dict.search.noResultsHelp}</p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {['certidão', 'água', 'obras', 'apoios', 'reuniões'].map((suggestion) => (
                        <li key={suggestion}>
                          <Link href={hrefWith({ q: suggestion, tipo: undefined })} className={chip(false)}>
                            {suggestion}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-4">
                    {result.hits.slice(0, 30).map((hit) => (
                      <li key={hit.document.id}>
                        <article className="group relative rounded-lg border border-line bg-surface p-5 hover:border-primary-600">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge tone="info">
                              {TYPE_LABELS[hit.document.type] ?? hit.document.type}
                            </Badge>
                            <span className="text-sm text-ink-muted">{hit.document.section}</span>
                            {hit.matchedInFile ? (
                              <Badge tone="neutral" icon="fileText">
                                {dict.search.inPdf}
                              </Badge>
                            ) : null}
                          </div>

                          <h2 className="mt-2 font-serif text-xl">
                            <Link
                              href={hit.document.href}
                              className="text-ink no-underline after:absolute after:inset-0 after:content-[''] hover:underline underline-offset-[0.2em]"
                            >
                              {hit.document.title}
                            </Link>
                          </h2>

                          <p className="mt-1.5 text-ink-muted">{hit.excerpt}</p>
                        </article>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        ) : (
          <p className="mt-8 text-ink-muted">
            Escreva o que procura. A pesquisa cobre serviços, notícias, eventos, documentos — e o
            texto dentro dos ficheiros PDF.
          </p>
        )}
      </div>
    </>
  );
}
