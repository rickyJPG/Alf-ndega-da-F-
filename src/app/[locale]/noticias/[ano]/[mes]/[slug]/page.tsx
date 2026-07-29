import type { Metadata } from 'next';
import Image from 'next/image';
import { ehFotoExterna, fotoReal } from '@/lib/imagens';
import { notFound } from 'next/navigation';

import { getDictionary } from '@/i18n';
import { isLocale, locales, type Locale } from '@/i18n/config';
import { breadcrumbJsonLd, buildMetadata, newsArticleJsonLd } from '@/lib/seo';
import { routes } from '@/lib/routes';
import { getNews, getNewsArchive, getNewsItem, getRelatedNews } from '@/content';
import { tx } from '@/content/types';
import { formatDateLong, isoDate } from '@/lib/format';

import { JsonLd } from '@/components/seo/json-ld';
import { Section } from '@/components/layout/page-shell';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { CategoryBadge } from '@/components/ui/badge';
import { NewsCard } from '@/components/content/news-card';
import { Alert } from '@/components/ui/alert';
import { ShareRow } from '@/components/content/share-row';

export async function generateStaticParams() {
  const [current, archived] = await Promise.all([
    getNews({ limit: 500 }),
    getNewsArchive('covid-19'),
  ]);

  return locales.flatMap((locale) =>
    [...current, ...archived].map((item) => ({
      locale,
      ano: item.date.slice(0, 4),
      mes: item.date.slice(5, 7),
      slug: item.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; ano: string; mes: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, ano, mes, slug } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const item = await getNewsItem(ano, mes, slug);
  if (!item) return {};

  return buildMetadata({
    locale,
    path: `/noticias/${ano}/${mes}/${slug}`,
    title: tx(item.title, locale),
    description: tx(item.summary, locale),
    image: item.image?.src,
    type: 'article',
    publishedTime: item.date,
    noIndex: Boolean(item.archive),
  });
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ locale: string; ano: string; mes: string; slug: string }>;
}) {
  const { locale: raw, ano, mes, slug } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const dict = getDictionary(locale);

  const item = await getNewsItem(ano, mes, slug);
  if (!item) notFound();

  const related = await getRelatedNews(item);
  const body = tx(item.body, locale);

  const crumbs = [
    { label: dict.common.home, href: '/' },
    { label: dict.news.title, href: '/noticias' },
    { label: tx(item.title, locale) },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(locale, crumbs),
          newsArticleJsonLd({
            locale,
            headline: tx(item.title, locale),
            description: tx(item.summary, locale),
            datePublished: item.date,
            dateModified: item.updatedAt,
            path: `/noticias/${ano}/${mes}/${slug}`,
            image: item.image?.src,
            section: item.category,
          }),
        ]}
      />

      <article>
        <div className="border-b border-line bg-surface-alt">
          <div className="container-page py-6 md:py-10">
            <Breadcrumb
              className="mb-5"
              label={dict.common.breadcrumb}
              items={[
                { label: dict.common.home, href: routes.home(locale) },
                { label: dict.news.title, href: routes.news(locale) },
                { label: tx(item.title, locale) },
              ]}
            />

            <div className="measure">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <CategoryBadge>{item.category}</CategoryBadge>
                <time dateTime={isoDate(item.date)} className="text-sm text-ink-muted">
                  {dict.common.publishedOn} {formatDateLong(item.date, locale)}
                </time>
              </div>

              <h1 className="text-3xl">{tx(item.title, locale)}</h1>
              <p className="mt-4 text-lg text-ink-muted">{tx(item.summary, locale)}</p>
            </div>
          </div>
        </div>

        <div className="container-page py-10 md:py-14">
          {item.archive ? (
            <Alert tone="warning" title="Conteúdo de arquivo" className="measure mb-8">
              Esta página é mantida por interesse histórico. A informação já não está em vigor.
            </Alert>
          ) : null}

          {item.image ? (
            <figure className="mb-8">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-line bg-surface-alt">
                <Image
                  src={fotoReal(item.image.src)}
                  unoptimized={ehFotoExterna(fotoReal(item.image.src))}
                  alt={tx(item.image.alt, locale)}
                  fill
                  priority
                  sizes="(min-width: 1280px) 1216px, 100vw"
                  className="object-cover"
                />
              </div>
              {item.image.credit ? (
                <figcaption className="mt-2 text-sm text-ink-muted">{item.image.credit}</figcaption>
              ) : null}
            </figure>
          ) : null}

          <div className="prose-cm">
            {body.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {item.tags && item.tags.length > 0 ? (
            <div className="measure mt-10">
              <h2 className="sr-only">Etiquetas</h2>
              <ul className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-pill border border-line-strong bg-surface-alt px-3 py-1 text-sm text-ink-muted"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <ShareRow
            className="mt-8"
            title={tx(item.title, locale)}
            labels={{ share: dict.common.share, copy: dict.common.copyLink, copied: dict.common.linkCopied, print: dict.common.print }}
          />
        </div>
      </article>

      {related.length > 0 ? (
        <Section tone="alt" title={dict.news.related}>
          <ul className="grid gap-6 md:grid-cols-3">
            {related.map((entry) => (
              <li key={entry.id} className="flex">
                <NewsCard item={entry} locale={locale} className="w-full" />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  );
}
