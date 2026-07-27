import type { Metadata } from 'next';
import Link from 'next/link';

import { getDictionary } from '@/i18n';
import { isLocale, type Locale } from '@/i18n/config';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';
import { routes } from '@/lib/routes';
import { getNews, getNewsArchive, getNewsCategories } from '@/content';

import { JsonLd } from '@/components/seo/json-ld';
import { PageHeader } from '@/components/layout/page-shell';
import { NewsCard } from '@/components/content/news-card';
import { Pagination } from '@/components/ui/pagination';
import { Alert } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

const PER_PAGE = 9;

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
    path: '/noticias',
    title: dict.news.title,
    description: dict.news.lead,
  });
}

export default async function NewsIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ pagina?: string; rubrica?: string; arquivo?: string }>;
}) {
  const { locale: raw } = await params;
  const query = await searchParams;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const dict = getDictionary(locale);

  const isArchive = query.arquivo === 'covid-19';
  const categories = await getNewsCategories();
  const all = isArchive
    ? await getNewsArchive('covid-19')
    : await getNews({ category: query.rubrica });

  const page = Math.max(1, Number.parseInt(query.pagina ?? '1', 10) || 1);
  const totalPages = Math.max(1, Math.ceil(all.length / PER_PAGE));
  const items = all.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function hrefFor(next: { pagina?: number; rubrica?: string }) {
    const search = new URLSearchParams();
    const rubrica = next.rubrica ?? query.rubrica;
    if (rubrica) search.set('rubrica', rubrica);
    if (next.pagina && next.pagina > 1) search.set('pagina', String(next.pagina));
    const suffix = search.toString();
    return `${routes.news(locale)}${suffix ? `?${suffix}` : ''}`;
  }

  const crumbs = [{ label: dict.common.home, href: '/' }, { label: dict.news.title }];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />

      <PageHeader
        title={isArchive ? `${dict.news.title} — ${dict.news.archive}` : dict.news.title}
        lead={dict.news.lead}
        tone="alt"
        breadcrumbLabel={dict.common.breadcrumb}
        breadcrumb={[{ label: dict.common.home, href: routes.home(locale) }, { label: dict.news.title }]}
      />

      <div className="container-page py-10 md:py-14">
        {isArchive ? (
          <Alert tone="info" title="Conteúdo de arquivo" className="mb-8">
            <p>
              Estas notícias dizem respeito ao período da pandemia de COVID-19 e são mantidas apenas
              por interesse histórico. Nenhuma das medidas descritas se mantém em vigor.
            </p>
            <p className="mt-2">
              <Link href={routes.news(locale)} className="text-primary-600 underline underline-offset-[0.2em]">
                Ver as notícias atuais
              </Link>
            </p>
          </Alert>
        ) : (
          <nav aria-label={dict.common.category} className="mb-8">
            <ul className="flex flex-wrap gap-2">
              <li>
                <Link
                  href={hrefFor({ rubrica: '' })}
                  aria-current={!query.rubrica ? 'true' : undefined}
                  className={cn(
                    'inline-flex min-h-11 items-center rounded-pill border px-4 no-underline',
                    !query.rubrica
                      ? 'border-primary-800 bg-primary-800 font-semibold text-white'
                      : 'border-line-strong bg-surface text-ink hover:bg-surface-alt',
                  )}
                >
                  {dict.common.all}
                </Link>
              </li>
              {categories.map((category) => (
                <li key={category}>
                  <Link
                    href={hrefFor({ rubrica: category })}
                    aria-current={query.rubrica === category ? 'true' : undefined}
                    className={cn(
                      'inline-flex min-h-11 items-center rounded-pill border px-4 no-underline',
                      query.rubrica === category
                        ? 'border-primary-800 bg-primary-800 font-semibold text-white'
                        : 'border-line-strong bg-surface text-ink hover:bg-surface-alt',
                    )}
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <p className="mb-6 text-sm text-ink-muted" aria-live="polite">
          {all.length} {all.length === 1 ? dict.common.result : dict.common.results}
        </p>

        {items.length === 0 ? (
          <p className="rounded-lg border border-line bg-surface-alt p-8 text-ink-muted">
            {dict.news.empty}
          </p>
        ) : (
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <li key={item.id} className="flex">
                <NewsCard
                  item={item}
                  locale={locale}
                  priority={index < 3}
                  headingLevel={2}
                  className="w-full"
                />
              </li>
            ))}
          </ul>
        )}

        <Pagination
          className="mt-10"
          currentPage={page}
          totalPages={totalPages}
          buildHref={(target) => hrefFor({ pagina: target })}
          labels={{
            previous: dict.common.previous,
            next: dict.common.next,
            page: dict.common.page,
            of: dict.common.of,
          }}
        />

        {!isArchive ? (
          <p className="mt-10 text-sm text-ink-muted">
            <Link
              href={`${routes.news(locale)}?arquivo=covid-19`}
              className="text-primary-600 underline underline-offset-[0.2em]"
            >
              {dict.news.archive}: COVID-19 (2020–2023)
            </Link>
          </p>
        ) : null}
      </div>
    </>
  );
}
