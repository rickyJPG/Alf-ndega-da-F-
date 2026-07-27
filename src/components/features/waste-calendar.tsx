'use client';

import { useMemo, useState } from 'react';
import type { Freguesia, WasteSchedule, WasteStream } from '@/content/types';
import { tx } from '@/content/types';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { formatDate } from '@/lib/format';
import { Icon, type IconName } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

const STREAM_META: Record<
  WasteStream,
  { icon: IconName; key: keyof Dictionary['waste']; color: string }
> = {
  indiferenciado: { icon: 'trash', key: 'undifferentiated', color: 'bg-ink-muted' },
  embalagens: { icon: 'recycle', key: 'packaging', color: 'bg-warning' },
  papel: { icon: 'book', key: 'paper', color: 'bg-info' },
  vidro: { icon: 'recycle', key: 'glass', color: 'bg-support-700' },
  monstros: { icon: 'wrench', key: 'bulky', color: 'bg-accent-600' },
};

/**
 * Calendário de recolha de resíduos por freguesia, com subscrição ICS.
 *
 * O calendário é gerado no navegador a partir do ritmo semanal: uma série
 * VEVENT com repetição semanal e aviso na véspera. É pouco código e funciona
 * em qualquer aplicação de calendário.
 */
export function WasteCalendar({
  schedules,
  freguesias,
  locale,
  dict,
  fixedFreguesia,
  headingLevel = 3,
}: {
  schedules: WasteSchedule[];
  freguesias: Freguesia[];
  locale: Locale;
  dict: Dictionary;
  /** Na página da freguesia a escolha já está feita. */
  fixedFreguesia?: string;
  /**
   * Nível dos subtítulos. Na página própria o bloco vem logo a seguir ao H1
   * (portanto 2); dentro de uma secção com título próprio o correto é 3.
   * Saltar níveis seria um erro de acessibilidade.
   */
  headingLevel?: 2 | 3;
}) {
  const [selected, setSelected] = useState(fixedFreguesia ?? freguesias[0]?.slug ?? '');
  const Heading = (headingLevel === 2 ? 'h2' : 'h3') as 'h2' | 'h3';

  const schedule = schedules.find((entry) => entry.freguesiaSlug === selected);
  const freguesia = freguesias.find((entry) => entry.slug === selected);

  /** Os próximos sete dias, com o que acontece em cada um. */
  const upcoming = useMemo(() => {
    if (!schedule) return [];
    const days: { date: string; streams: WasteStream[] }[] = [];
    const cursor = new Date();
    cursor.setUTCHours(0, 0, 0, 0);

    for (let index = 0; index < 7; index += 1) {
      const weekday = cursor.getUTCDay();
      const streams = (Object.keys(schedule.streams) as WasteStream[]).filter((stream) =>
        schedule.streams[stream].includes(weekday),
      );
      days.push({ date: cursor.toISOString().slice(0, 10), streams });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return days;
  }, [schedule]);

  function downloadIcs() {
    if (!schedule || !freguesia) return;

    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Municipio de Alfandega da Fe//Recolha de residuos//PT',
      'CALSCALE:GREGORIAN',
    ];

    const rruleDay = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);

    for (const stream of Object.keys(schedule.streams) as WasteStream[]) {
      for (const weekday of schedule.streams[stream]) {
        // Erstes Vorkommen dieses Wochentags ab heute.
        const first = new Date(start);
        first.setUTCDate(first.getUTCDate() + ((weekday - first.getUTCDay() + 7) % 7));
        const stamp = first.toISOString().slice(0, 10).replace(/-/g, '');

        lines.push(
          'BEGIN:VEVENT',
          `UID:${stream}-${weekday}-${freguesia.slug}@cm-alfandegadafe.pt`,
          `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
          `DTSTART;VALUE=DATE:${stamp}`,
          `RRULE:FREQ=WEEKLY;BYDAY=${rruleDay[weekday]}`,
          `SUMMARY:Recolha — ${dict.waste[STREAM_META[stream].key]} (${freguesia.name})`,
          'DESCRIPTION:Coloque o contentor na rua na véspera, depois das 20:00.',
          'BEGIN:VALARM',
          'TRIGGER:-PT14H',
          'ACTION:DISPLAY',
          `DESCRIPTION:Amanhã há recolha de ${dict.waste[STREAM_META[stream].key]}`,
          'END:VALARM',
          'END:VEVENT',
        );
      }
    }

    lines.push('END:VCALENDAR');

    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recolha-${freguesia.slug}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      {!fixedFreguesia ? (
        <div className="mb-6 flex flex-wrap items-end gap-3">
          <div className="flex-1 sm:max-w-sm">
            <label htmlFor="waste-freguesia" className="mb-1.5 block font-semibold">
              {dict.waste.chooseFreguesia}
            </label>
            <select
              id="waste-freguesia"
              value={selected}
              onChange={(event) => setSelected(event.target.value)}
              className="min-h-11 w-full rounded-md border border-line-strong bg-surface px-3"
            >
              {freguesias.map((entry) => (
                <option key={entry.slug} value={entry.slug}>
                  {entry.name}
                </option>
              ))}
            </select>
          </div>

          <Button variant="subtle" icon="calendar" onClick={downloadIcs}>
            {dict.waste.subscribe}
          </Button>
        </div>
      ) : (
        <div className="mb-6">
          <Button variant="subtle" icon="calendar" onClick={downloadIcs}>
            {dict.waste.subscribe}
          </Button>
        </div>
      )}

      {!schedule ? (
        <p className="rounded-lg border border-line bg-surface p-6 text-ink-muted">
          Ainda não há calendário publicado para esta freguesia. Ligue para 279 468 120.
        </p>
      ) : (
        <>
          <Heading className="sr-only">{dict.waste.nextCollection}</Heading>
          <ol className="grid gap-2 md:grid-cols-7">
            {upcoming.map((day, index) => {
              const date = new Date(`${day.date}T00:00:00.000Z`);
              return (
                <li
                  key={day.date}
                  className={cn(
                    'rounded-md border bg-surface p-3',
                    index === 0 ? 'border-primary-600 border-2' : 'border-line',
                  )}
                >
                  <p className="border-b border-line pb-1.5">
                    <span className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
                      {WEEKDAYS[date.getUTCDay()].slice(0, 3)}
                    </span>{' '}
                    <time dateTime={day.date} className="font-serif font-semibold">
                      {date.getUTCDate()}
                    </time>
                    {index === 0 ? (
                      <span className="ms-1 text-xs font-semibold text-primary-700">
                        · {dict.events.today}
                      </span>
                    ) : null}
                  </p>

                  {day.streams.length === 0 ? (
                    <p className="mt-2 text-sm text-ink-muted/70">—</p>
                  ) : (
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {day.streams.map((stream) => (
                        <li key={stream} className="flex items-center gap-1.5 text-sm">
                          <span
                            aria-hidden="true"
                            className={cn('size-2.5 shrink-0 rounded-pill', STREAM_META[stream].color)}
                          />
                          {dict.waste[STREAM_META[stream].key]}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ol>

          <Heading className="mt-8 font-serif text-xl">O que passa e quando</Heading>
          <ul className="mt-3 divide-y divide-line rounded-lg border border-line bg-surface">
            {(Object.keys(schedule.streams) as WasteStream[]).map((stream) => {
              const days = schedule.streams[stream];
              return (
                <li key={stream} className="flex flex-wrap items-center gap-x-4 gap-y-1 p-4">
                  <Icon name={STREAM_META[stream].icon} size={20} className="text-primary-700" />
                  <span className="w-56 font-semibold">{dict.waste[STREAM_META[stream].key]}</span>
                  <span className="text-ink-muted">
                    {days.length === 0
                      ? dict.waste.bulkyHint
                      : days.map((day) => WEEKDAYS[day]).join(', ')}
                  </span>
                </li>
              );
            })}
          </ul>

          {schedule.notes ? (
            <p className="mt-4 flex items-start gap-2 text-sm text-ink-muted">
              <Icon name="info" size={17} className="mt-0.5 shrink-0" />
              {tx(schedule.notes, locale)}
            </p>
          ) : null}

          <p className="mt-2 text-sm text-ink-muted">
            Calendário gerado a {formatDate(new Date(), locale)}.
          </p>
        </>
      )}
    </div>
  );
}
