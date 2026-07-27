'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { EventItem } from '@/content/types';
import { tx } from '@/content/types';
import { localePath, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { formatDate, formatTime, isoDate } from '@/lib/format';
import { Icon } from '@/components/ui/icon';
import { CategoryBadge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const WEEKDAYS_PT = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];

/**
 * Agenda mit Wochen- und Listenansicht.
 *
 * Die Wochenansicht ist eine Tabelle mit sieben Spalten – als echte Liste
 * pro Tag ausgezeichnet, damit sie mit dem Screenreader in sinnvoller
 * Reihenfolge vorgelesen wird und nicht als Raster ohne Bezug.
 */
export function WeekAgenda({
  events,
  locale,
  dict,
  weekStart,
  categories,
}: {
  events: EventItem[];
  locale: Locale;
  dict: Dictionary;
  /** Montag der angezeigten Woche, ISO. Kommt vom Server. */
  weekStart: string;
  categories: string[];
}) {
  const [view, setView] = useState<'week' | 'list'>('week');
  const [offset, setOffset] = useState(0);
  const [category, setCategory] = useState<string>('');

  const days = useMemo(() => {
    const start = new Date(`${weekStart}T00:00:00.000Z`);
    start.setUTCDate(start.getUTCDate() + offset * 7);
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(start);
      day.setUTCDate(day.getUTCDate() + index);
      return day.toISOString().slice(0, 10);
    });
  }, [weekStart, offset]);

  const filtered = useMemo(
    () => (category ? events.filter((event) => event.category === category) : events),
    [events, category],
  );

  function eventsOn(day: string) {
    return filtered.filter((event) => {
      const end = event.endDate ?? event.startDate;
      return event.startDate <= day && end >= day;
    });
  }

  const listed = filtered.filter((event) => {
    const end = event.endDate ?? event.startDate;
    return end >= days[0] && event.startDate <= days[6];
  });

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1" role="group" aria-label={dict.common.filter}>
          <button
            type="button"
            onClick={() => setView('week')}
            aria-pressed={view === 'week'}
            className={cn(
              'min-h-11 rounded-md border px-3 font-semibold',
              view === 'week'
                ? 'border-primary-800 bg-primary-800 text-white'
                : 'border-line-strong bg-surface text-ink hover:bg-surface-alt',
            )}
          >
            {dict.events.week}
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            aria-pressed={view === 'list'}
            className={cn(
              'min-h-11 rounded-md border px-3 font-semibold',
              view === 'list'
                ? 'border-primary-800 bg-primary-800 text-white'
                : 'border-line-strong bg-surface text-ink hover:bg-surface-alt',
            )}
          >
            {dict.events.list}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="agenda-category" className="text-sm font-medium">
            {dict.common.category}
          </label>
          <select
            id="agenda-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="min-h-11 rounded-md border border-line-strong bg-surface px-3"
          >
            <option value="">{dict.common.all}</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setOffset((value) => value - 1)}
            className="inline-flex min-h-11 items-center gap-1 rounded-md border border-line-strong bg-surface px-3 hover:bg-surface-alt"
          >
            <Icon name="chevronLeft" size={16} />
            <span className="sr-only sm:not-sr-only sm:text-sm">{dict.events.previousWeek}</span>
          </button>
          <button
            type="button"
            onClick={() => setOffset((value) => value + 1)}
            className="inline-flex min-h-11 items-center gap-1 rounded-md border border-line-strong bg-surface px-3 hover:bg-surface-alt"
          >
            <span className="sr-only sm:not-sr-only sm:text-sm">{dict.events.nextWeek}</span>
            <Icon name="chevronRight" size={16} />
          </button>
        </div>
      </div>

      <p aria-live="polite" className="mb-3 text-sm text-ink-muted">
        {formatDate(days[0], locale)} – {formatDate(days[6], locale)}
      </p>

      {view === 'week' ? (
        <ol className="grid gap-2 md:grid-cols-7">
          {days.map((day, index) => {
            const dayEvents = eventsOn(day);
            const date = new Date(`${day}T00:00:00.000Z`);

            return (
              <li
                key={day}
                className="rounded-md border border-line bg-surface p-2 md:min-h-40"
              >
                <p className="mb-2 border-b border-line pb-1.5">
                  <span className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
                    {WEEKDAYS_PT[index]}
                  </span>{' '}
                  <time dateTime={day} className="font-serif font-semibold">
                    {date.getUTCDate()}
                  </time>
                </p>

                {dayEvents.length === 0 ? (
                  <p className="text-sm text-ink-muted/70">—</p>
                ) : (
                  <ul className="flex flex-col gap-1.5">
                    {dayEvents.map((event) => (
                      <li key={event.id}>
                        <Link
                          href={localePath(locale, `/eventos/${event.slug}`)}
                          className="block rounded-sm border-s-2 border-accent-600 bg-surface-alt px-2 py-1.5 text-sm text-ink no-underline hover:bg-primary-100"
                        >
                          {event.startTime ? (
                            <span className="block font-semibold tabular-nums">
                              {formatTime(event.startTime)}
                            </span>
                          ) : (
                            <span className="block text-xs text-ink-muted">{dict.events.allDay}</span>
                          )}
                          {tx(event.title, locale)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>
      ) : listed.length === 0 ? (
        <p className="rounded-md border border-line bg-surface-alt p-6 text-ink-muted">
          {dict.events.empty}
        </p>
      ) : (
        <ul className="divide-y divide-line rounded-lg border border-line">
          {listed.map((event) => (
            <li key={event.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 p-4">
              <time
                dateTime={isoDate(event.startDate)}
                className="w-32 shrink-0 font-semibold tabular-nums"
              >
                {formatDate(event.startDate, locale)}
              </time>
              <span className="w-14 shrink-0 text-sm text-ink-muted tabular-nums">
                {event.startTime ? formatTime(event.startTime) : '—'}
              </span>
              <Link
                href={localePath(locale, `/eventos/${event.slug}`)}
                className="flex-1 text-ink no-underline hover:underline underline-offset-[0.2em]"
              >
                {tx(event.title, locale)}
              </Link>
              <CategoryBadge>{event.category}</CategoryBadge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
