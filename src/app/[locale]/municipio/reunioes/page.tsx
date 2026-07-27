import type { Metadata } from 'next';
import Link from 'next/link';

import { getDictionary } from '@/i18n';
import { isLocale, type Locale } from '@/i18n/config';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';
import { routes } from '@/lib/routes';
import { getMeetings } from '@/content';
import { formatDate } from '@/lib/format';
import { deburr } from '@/lib/utils';

import { JsonLd } from '@/components/seo/json-ld';
import { PageHeader } from '@/components/layout/page-shell';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { FileLink } from '@/components/ui/link';
import { cn } from '@/lib/utils';

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
    path: '/municipio/reunioes',
    title: dict.meetings.title,
    description: dict.meetings.lead,
  });
}

export default async function MeetingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; tipo?: string; ano?: string }>;
}) {
  const { locale: raw } = await params;
  const query = await searchParams;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const dict = getDictionary(locale);

  const body = query.tipo === 'assembleia' ? 'assembleia' : query.tipo === 'camara' ? 'camara' : undefined;
  const all = await getMeetings({ body });
  const years = [...new Set(all.map((meeting) => meeting.date.slice(0, 4)))].sort().reverse();

  const needle = deburr(query.q ?? '').toLowerCase().trim();

  const meetings = all.filter((meeting) => {
    if (query.ano && !meeting.date.startsWith(query.ano)) return false;
    if (!needle) return true;
    const haystack = deburr(
      [
        ...meeting.agenda,
        ...meeting.decisions.map((decision) => decision.title),
        meeting.minutes?.extractedText ?? '',
      ].join(' '),
    ).toLowerCase();
    return haystack.includes(needle);
  });

  function hrefWith(patch: Record<string, string | undefined>) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...query, ...patch })) {
      if (value) search.set(key, value);
    }
    const suffix = search.toString();
    return `${routes.meetings(locale)}${suffix ? `?${suffix}` : ''}`;
  }

  const chip = (active: boolean) =>
    cn(
      'inline-flex min-h-11 items-center rounded-pill border px-4 text-sm no-underline',
      active
        ? 'border-primary-800 bg-primary-800 font-semibold text-white'
        : 'border-line-strong bg-surface text-ink hover:bg-surface-alt',
    );

  const crumbs = [
    { label: dict.common.home, href: '/' },
    { label: dict.nav.municipio, href: '/municipio' },
    { label: dict.meetings.title },
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />

      <PageHeader
        title={dict.meetings.title}
        lead={dict.meetings.lead}
        tone="alt"
        breadcrumbLabel={dict.common.breadcrumb}
        breadcrumb={[
          { label: dict.common.home, href: routes.home(locale) },
          { label: dict.nav.municipio, href: routes.municipality(locale) },
          { label: dict.meetings.title },
        ]}
      />

      <div className="container-page py-10 md:py-14">
        <form action={routes.meetings(locale)} method="get" role="search" className="max-w-xl">
          <label htmlFor="meetings-q" className="mb-1.5 block font-semibold">
            {dict.meetings.searchPlaceholder}
          </label>
          <div className="flex">
            <input
              id="meetings-q"
              type="search"
              name="q"
              defaultValue={query.q ?? ''}
              placeholder="Ex.: conduta de água, bolsas de estudo"
              className="min-h-11 w-full rounded-s-md border border-e-0 border-line-strong bg-surface px-3"
            />
            <button
              type="submit"
              className="inline-flex min-h-11 items-center gap-2 rounded-e-md border border-primary-800 bg-primary-800 px-4 font-semibold text-white"
            >
              <Icon name="search" size={18} />
              {dict.common.search}
            </button>
          </div>
          {query.tipo ? <input type="hidden" name="tipo" value={query.tipo} /> : null}
          {query.ano ? <input type="hidden" name="ano" value={query.ano} /> : null}
          <p className="mt-2 text-sm text-ink-muted">
            A pesquisa percorre a ordem do dia, as deliberações e o texto das atas.
          </p>
        </form>

        <div className="mt-6 flex flex-wrap gap-6">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Órgão</legend>
            <ul className="flex flex-wrap gap-2">
              <li>
                <Link href={hrefWith({ tipo: undefined })} className={chip(!query.tipo)}>
                  {dict.common.all}
                </Link>
              </li>
              <li>
                <Link href={hrefWith({ tipo: 'camara' })} className={chip(query.tipo === 'camara')}>
                  Câmara Municipal
                </Link>
              </li>
              <li>
                <Link
                  href={hrefWith({ tipo: 'assembleia' })}
                  className={chip(query.tipo === 'assembleia')}
                >
                  Assembleia Municipal
                </Link>
              </li>
            </ul>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold">{dict.common.year}</legend>
            <ul className="flex flex-wrap gap-2">
              <li>
                <Link href={hrefWith({ ano: undefined })} className={chip(!query.ano)}>
                  {dict.common.all}
                </Link>
              </li>
              {years.map((year) => (
                <li key={year}>
                  <Link href={hrefWith({ ano: year })} className={chip(query.ano === year)}>
                    {year}
                  </Link>
                </li>
              ))}
            </ul>
          </fieldset>
        </div>

        <p className="mt-8 mb-4 text-sm text-ink-muted" aria-live="polite">
          {meetings.length} {meetings.length === 1 ? dict.common.result : dict.common.results}
        </p>

        {meetings.length === 0 ? (
          <p className="rounded-lg border border-line bg-surface-alt p-8 text-ink-muted">
            {dict.meetings.empty}
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {meetings.map((meeting) => (
              <li key={meeting.id}>
                <article className="group relative rounded-lg border border-line bg-surface p-5 hover:border-primary-600">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={meeting.body === 'camara' ? 'info' : 'support'}>
                      {meeting.body === 'camara' ? 'Câmara Municipal' : 'Assembleia Municipal'}
                    </Badge>
                    <Badge>
                      {meeting.kind === 'ordinaria' ? dict.meetings.ordinary : dict.meetings.extraordinary}
                    </Badge>
                    {meeting.isPublic ? <Badge tone="success">{dict.meetings.public}</Badge> : null}
                  </div>

                  <h2 className="mt-3 font-serif text-xl">
                    <Link
                      href={routes.meeting(locale, meeting)}
                      className="text-ink no-underline after:absolute after:inset-0 after:content-[''] hover:underline underline-offset-[0.2em]"
                    >
                      {meeting.body === 'camara' ? 'Reunião' : 'Sessão'} de{' '}
                      <time dateTime={meeting.date}>{formatDate(meeting.date, locale)}</time>
                    </Link>
                  </h2>

                  <p className="mt-2 text-ink-muted">
                    {meeting.agenda.slice(0, 3).join(' · ')}
                    {meeting.agenda.length > 3 ? ' …' : ''}
                  </p>

                  <p className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                    <span className="flex items-center gap-1.5 text-ink-muted">
                      <Icon name="check" size={15} />
                      {meeting.decisions.length} {dict.meetings.decisions.toLowerCase()}
                    </span>
                    {meeting.minutes ? (
                      <span className="relative z-10">
                        <FileLink
                          href={meeting.minutes.href}
                          format={meeting.minutes.format}
                          bytes={meeting.minutes.bytes}
                          locale={locale}
                        >
                          {dict.meetings.minutes}
                        </FileLink>
                      </span>
                    ) : null}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
