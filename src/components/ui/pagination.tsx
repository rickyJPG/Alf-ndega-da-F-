import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Icon } from './icon';

/** Números de página à volta da página atual, com reticências. */
function pageWindow(current: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((p) => pages.add(p));

  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (previous && page - previous > 1) out.push('gap');
    out.push(page);
    previous = page;
  }
  return out;
}

export function Pagination({
  currentPage,
  totalPages,
  buildHref,
  labels,
  className,
}: {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
  labels: { previous: string; next: string; page: string; of: string };
  className?: string;
}) {
  if (totalPages <= 1) return null;
  const items = pageWindow(currentPage, totalPages);

  const cell =
    'inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border px-3 no-underline';

  return (
    <nav
      aria-label={`${labels.page} ${currentPage} ${labels.of} ${totalPages}`}
      className={cn('flex flex-wrap items-center justify-center gap-1', className)}
    >
      {currentPage > 1 ? (
        <Link
          href={buildHref(currentPage - 1)}
          rel="prev"
          /* O texto é escondido em ecrã pequeno; o nome acessível não pode ser. */
          aria-label={`${labels.previous} — ${labels.page} ${currentPage - 1}`}
          className={cn(cell, 'border-line-strong text-ink hover:bg-primary-100 gap-1')}
        >
          <Icon name="chevronLeft" size={16} />
          <span className="hidden sm:inline">{labels.previous}</span>
        </Link>
      ) : null}

      <ol className="flex items-center gap-1">
        {items.map((item, index) =>
          item === 'gap' ? (
            <li key={`gap-${index}`} aria-hidden="true" className="px-1 text-ink-muted">
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                href={buildHref(item)}
                aria-current={item === currentPage ? 'page' : undefined}
                aria-label={`${labels.page} ${item}`}
                className={cn(
                  cell,
                  item === currentPage
                    ? 'border-primary-800 bg-primary-800 font-semibold text-white'
                    : 'border-line-strong text-ink hover:bg-primary-100',
                )}
              >
                {item}
              </Link>
            </li>
          ),
        )}
      </ol>

      {currentPage < totalPages ? (
        <Link
          href={buildHref(currentPage + 1)}
          rel="next"
          aria-label={`${labels.next} — ${labels.page} ${currentPage + 1}`}
          className={cn(cell, 'border-line-strong text-ink hover:bg-primary-100 gap-1')}
        >
          <span className="hidden sm:inline">{labels.next}</span>
          <Icon name="chevronRight" size={16} />
        </Link>
      ) : null}
    </nav>
  );
}
