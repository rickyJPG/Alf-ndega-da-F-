import type { FireRiskDay } from '@/content/types';
import type { Dictionary } from '@/i18n';
import type { Locale } from '@/i18n/config';
import { formatWeekdayShort } from '@/lib/format';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

const LEVEL_KEYS = ['level1', 'level2', 'level3', 'level4', 'level5'] as const;

/**
 * Risco de incêndio rural segundo a escala oficial do IPMA — o substituto do
 * GIF meteorológico animado do sítio antigo.
 *
 * O nível aparece em número e por extenso; a cor apenas reforça. Assim a
 * informação mantém-se para quem tem daltonismo e na impressão a preto e
 * erhalten.
 */
export function FireRiskWidget({
  days,
  advice,
  locale,
  dict,
  className,
}: {
  days: FireRiskDay[];
  advice: Record<number, { pt: string; en: string }>;
  locale: Locale;
  dict: Dictionary;
  className?: string;
}) {
  const today = days[0];
  if (!today) return null;

  /**
   * As cores são as dos níveis oficiais do IPMA e não podem ser alteradas.
   * Só a cor do texto por cima é ajustável: sobre amarelo e laranja o texto é
   * escuro, caso contrário o número ficaria abaixo de 4,5:1.
   */
  const levelClasses: Record<number, string> = {
    1: 'bg-risk-1 text-white',
    2: 'bg-risk-2 text-ink',
    3: 'bg-risk-3 text-ink',
    4: 'bg-risk-4 text-white',
    5: 'bg-risk-5 text-white',
  };

  const adviceText = locale === 'pt' ? advice[today.level]?.pt : advice[today.level]?.en;

  return (
    <section
      aria-labelledby="fire-risk-title"
      className={cn('rounded-lg border border-line bg-surface p-5', className)}
    >
      <div className="flex items-start justify-between gap-4">
        <h3 id="fire-risk-title" className="flex items-center gap-2 font-serif text-lg">
          <Icon name="flame" size={20} className="text-accent-700" />
          {dict.fireRisk.title}
        </h3>
        <span className="text-xs text-ink-muted">{dict.fireRisk.source}</span>
      </div>

      <p className="mt-4 flex items-center gap-3">
        <span
          className={cn(
            'inline-flex size-12 items-center justify-center rounded-md font-serif text-2xl font-semibold',
            levelClasses[today.level],
          )}
          aria-hidden="true"
        >
          {today.level}
        </span>
        <span>
          <span className="block font-semibold">{dict.fireRisk[LEVEL_KEYS[today.level - 1]]}</span>
          <span className="block text-sm text-ink-muted">
            {dict.fireRisk.today} — nível {today.level} de 5
          </span>
        </span>
      </p>

      {adviceText ? <p className="mt-3 text-sm text-ink">{adviceText}</p> : null}

      <ol className="mt-4 flex gap-1.5">
        {days.slice(1).map((day) => (
          <li key={day.date} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-xs text-ink-muted">{formatWeekdayShort(day.date, locale)}</span>
            <span
              className={cn(
                'flex h-8 w-full items-center justify-center rounded-sm text-sm font-semibold',
                levelClasses[day.level],
              )}
            >
              <span className="sr-only">
                {dict.fireRisk[LEVEL_KEYS[day.level - 1]]} —{' '}
              </span>
              {day.level}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
