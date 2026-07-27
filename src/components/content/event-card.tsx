import Link from 'next/link';
import type { EventItem } from '@/content/types';
import { tx } from '@/content/types';
import { localePath, type Locale } from '@/i18n/config';
import { formatDate, formatTime, isoDate } from '@/lib/format';
import type { Dictionary } from '@/i18n';
import { Icon } from '@/components/ui/icon';
import { CategoryBadge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const PT_MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/**
 * Cartão de evento com bloco de data. A hora é legível por máquinas
 * (`<time datetime>`) e vem no formato de 24 horas, como se usa em Portugal.
 */
export function EventCard({
  event,
  locale,
  dict,
  className,
  headingLevel = 3,
}: {
  event: EventItem;
  locale: Locale;
  dict: Dictionary;
  className?: string;
  headingLevel?: 2 | 3 | 4;
}) {
  const href = localePath(locale, `/eventos/${event.slug}`);
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  const start = new Date(`${event.startDate}T00:00:00.000Z`);
  const multiDay = Boolean(event.endDate && event.endDate !== event.startDate);

  return (
    <article
      className={cn(
        'group relative flex gap-4 rounded-lg border border-line bg-surface p-4',
        'transition-[border-color] duration-[--motion-base] hover:border-primary-600',
        'focus-within:border-primary-600',
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="flex size-16 shrink-0 flex-col items-center justify-center rounded-md border border-line bg-surface-alt"
      >
        <span className="font-serif text-2xl leading-none font-semibold text-ink">
          {start.getUTCDate()}
        </span>
        <span className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
          {PT_MONTHS[start.getUTCMonth()]}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge>{event.category}</CategoryBadge>
          <time dateTime={isoDate(event.startDate)} className="text-sm text-ink-muted">
            {formatDate(event.startDate, locale)}
            {multiDay ? ` – ${formatDate(event.endDate!, locale)}` : ''}
            {event.startTime ? ` · ${formatTime(event.startTime)}` : ` · ${dict.events.allDay}`}
          </time>
        </div>

        <Heading className="font-serif text-lg">
          <Link
            href={href}
            className="text-ink no-underline after:absolute after:inset-0 after:content-[''] hover:underline underline-offset-[0.2em]"
          >
            {tx(event.title, locale)}
          </Link>
        </Heading>

        <p className="text-sm text-ink-muted">{tx(event.summary, locale)}</p>

        <p className="mt-auto flex items-center gap-1.5 pt-1 text-sm text-ink-muted">
          <Icon name="mapPin" size={15} />
          {event.location}
        </p>
      </div>
    </article>
  );
}
