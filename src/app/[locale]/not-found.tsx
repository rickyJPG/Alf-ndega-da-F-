import Link from 'next/link';
import { getDictionary } from '@/i18n';
import { defaultLocale } from '@/i18n/config';
import { routes } from '@/lib/routes';
import { topTasks, navLabel } from '@/lib/navigation';
import { localePath } from '@/i18n/config';
import { Icon } from '@/components/ui/icon';

/**
 * 404.
 *
 * Die alte Seite adressierte alles über /pages/<id>; viele dieser Links leben
 * noch in Suchmaschinen und auf Papier. Die bekannten sind umgeleitet
 * (src/lib/redirects.ts) – wer trotzdem hier landet, bekommt eine Suche und
 * die meistgesuchten Wege, keine Sackgasse.
 *
 * Die Sprache lässt sich hier nicht aus den Parametern lesen (Next rendert
 * not-found ohne sie), deshalb die Standardsprache.
 */
export default function NotFound() {
  const locale = defaultLocale;
  const dict = getDictionary(locale);

  return (
    <div className="container-page py-16 md:py-24">
      <div className="measure">
        <p className="font-serif text-6xl font-semibold text-primary-600">404</p>
        <h1 className="mt-4 text-3xl">{dict.errors.notFoundTitle}</h1>
        <p className="mt-4 text-lg text-ink-muted">{dict.errors.notFoundLead}</p>

        <form action={routes.search(locale)} method="get" role="search" className="mt-8 flex">
          <label htmlFor="notfound-q" className="sr-only">
            {dict.errors.notFoundSearch}
          </label>
          <input
            id="notfound-q"
            type="search"
            name="q"
            placeholder={dict.common.searchPlaceholder}
            className="min-h-12 w-full rounded-s-md border-2 border-e-0 border-primary-800 bg-surface px-4"
          />
          <button
            type="submit"
            className="inline-flex min-h-12 items-center gap-2 rounded-e-md border-2 border-accent-600 bg-accent-600 px-5 font-semibold text-white hover:bg-accent-700"
          >
            <Icon name="search" size={19} />
            {dict.common.search}
          </button>
        </form>
      </div>

      <h2 className="mt-12 font-serif text-xl">{dict.errors.notFoundPopular}</h2>
      <ul className="mt-4 flex flex-wrap gap-2">
        {topTasks.map((task) => (
          <li key={task.href}>
            <Link
              href={localePath(locale, task.href)}
              className="inline-flex min-h-11 items-center rounded-pill border border-line-strong bg-surface px-4 text-ink no-underline hover:bg-primary-100"
            >
              {navLabel(task, locale)}
            </Link>
          </li>
        ))}
        <li>
          <Link
            href={routes.sitemap(locale)}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-pill border border-line-strong bg-surface px-4 text-ink no-underline hover:bg-primary-100"
          >
            <Icon name="fileText" size={16} />
            {dict.footer.sitemap}
          </Link>
        </li>
      </ul>

      <p className="mt-10">
        <Link
          href={routes.home(locale)}
          className="inline-flex items-center gap-2 text-primary-600 underline underline-offset-[0.2em]"
        >
          <Icon name="arrowLeft" size={18} />
          {dict.common.home}
        </Link>
      </p>
    </div>
  );
}
