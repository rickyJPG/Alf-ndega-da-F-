import Link from 'next/link';
import type { Consultation } from '@/content/types';
import { tx } from '@/content/types';
import { localePath, type Locale } from '@/i18n/config';
import { formatDate, formatDeadline } from '@/lib/format';
import { fill, type Dictionary } from '@/i18n';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

/**
 * Cartão de consulta pública, com o prazo que falta.
 *
 * O prazo aparece por extenso («termina em 12 dias») e não apenas como data
 * final — é essa a informação que leva alguém a agir. A cor reforça a
 * urgência, mas não a transmite sozinha.
 */
export function ConsultationCard({
  consultation,
  locale,
  dict,
  today,
  className,
  headingLevel = 3,
}: {
  consultation: Consultation;
  locale: Locale;
  dict: Dictionary;
  /** Data de referência — passada para que servidor e cliente coincidam. */
  today: string;
  className?: string;
  headingLevel?: 2 | 3 | 4;
}) {
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  const href = localePath(locale, `/transparencia/consultas-publicas/${consultation.slug}`);

  const notStarted = consultation.startsAt > today;
  const deadline = formatDeadline(
    consultation.endsAt,
    {
      today: dict.consultations.endsToday,
      tomorrow: dict.consultations.endsTomorrow,
      days: (n) => fill(dict.consultations.endsInDays, { days: n }),
      ended: dict.consultations.ended,
    },
    today,
  );

  const status = notStarted
    ? { tone: 'info' as const, label: dict.consultations.upcoming }
    : deadline.tone === 'ended'
      ? { tone: 'neutral' as const, label: dict.consultations.closed }
      : { tone: 'success' as const, label: dict.consultations.open };

  return (
    <article
      className={cn(
        'group relative flex flex-col gap-3 rounded-lg border border-line bg-surface p-5',
        'transition-[border-color] duration-[--motion-base] hover:border-primary-600',
        'focus-within:border-primary-600',
        deadline.tone === 'danger' && !notStarted && 'border-s-4 border-s-accent-600',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={status.tone}>{status.label}</Badge>
        <span className="text-sm text-ink-muted">{consultation.area}</span>
      </div>

      <Heading className="font-serif text-xl">
        <Link
          href={href}
          className="text-ink no-underline after:absolute after:inset-0 after:content-[''] hover:underline underline-offset-[0.2em]"
        >
          {tx(consultation.title, locale)}
        </Link>
      </Heading>

      <p className="text-ink-muted">{tx(consultation.summary, locale)}</p>

      <p className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-sm">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 font-semibold',
            deadline.tone === 'danger' && 'text-accent-700',
            deadline.tone === 'warning' && 'text-warning',
            deadline.tone === 'neutral' && 'text-ink',
            deadline.tone === 'ended' && 'text-ink-muted',
          )}
        >
          <Icon name="clock" size={15} />
          {notStarted
            ? `${dict.consultations.upcoming} — ${formatDate(consultation.startsAt, locale)}`
            : deadline.text}
        </span>
        <span className="text-ink-muted">
          {dict.consultations.period}: {formatDate(consultation.startsAt, locale)} –{' '}
          {formatDate(consultation.endsAt, locale)}
        </span>
      </p>
    </article>
  );
}
