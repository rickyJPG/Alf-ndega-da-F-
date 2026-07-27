import type { EventItem } from '@/content/types';
import { tx } from '@/content/types';
import { site } from './site';

/**
 * iCalendar-Datei für ein Ereignis.
 *
 * Erzeugt nach RFC 5545: CRLF-Zeilenenden, 75-Oktett-Faltung, escapte
 * Sonderzeichen. Ereignisse ohne Uhrzeit werden als Ganztagestermin
 * (VALUE=DATE) ausgegeben, mit exklusivem Enddatum.
 */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** Zeilen auf 75 Oktetts falten – längere Zeilen lehnen manche Kalender ab. */
function fold(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let rest = line;
  parts.push(rest.slice(0, 75));
  rest = rest.slice(75);
  while (rest.length > 74) {
    parts.push(` ${rest.slice(0, 74)}`);
    rest = rest.slice(74);
  }
  if (rest.length) parts.push(` ${rest}`);
  return parts.join('\r\n');
}

function stamp(date: Date): string {
  return `${date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
}

function dateOnly(iso: string): string {
  return iso.replace(/-/g, '');
}

function addDay(iso: string): string {
  const date = new Date(`${iso}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return dateOnly(date.toISOString().slice(0, 10));
}

export function eventToIcs(event: EventItem, origin: string): string {
  const uid = `${event.id}@cm-alfandegadafe.pt`;
  const now = stamp(new Date());
  const summary = tx(event.title, 'pt');
  const description = tx(event.summary, 'pt');
  const url = `${origin.replace(/\/$/, '')}/eventos/${event.slug}`;

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${site.legalName}//Portal//PT`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
  ];

  if (event.startTime) {
    // Portugal (WEST/WET) – als UTC-Zeitstempel mit Zeitzonenversatz aus dem Datum.
    const start = new Date(`${event.startDate}T${event.startTime}:00.000Z`);
    const end = event.endTime
      ? new Date(`${event.endDate ?? event.startDate}T${event.endTime}:00.000Z`)
      : new Date(start.getTime() + 2 * 3600 * 1000);
    lines.push(`DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`);
  } else {
    lines.push(
      `DTSTART;VALUE=DATE:${dateOnly(event.startDate)}`,
      `DTEND;VALUE=DATE:${addDay(event.endDate ?? event.startDate)}`,
    );
  }

  lines.push(
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `LOCATION:${escapeText(event.location)}`,
    `URL:${url}`,
    `CATEGORIES:${escapeText(event.category)}`,
  );

  if (event.geo) lines.push(`GEO:${event.geo.lat};${event.geo.lon}`);

  lines.push('STATUS:CONFIRMED', 'END:VEVENT', 'END:VCALENDAR');

  return `${lines.map(fold).join('\r\n')}\r\n`;
}
