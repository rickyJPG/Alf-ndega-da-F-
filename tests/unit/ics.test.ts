import { describe, expect, it } from 'vitest';
import { eventToIcs } from '@/lib/ics';
import type { EventItem } from '@/content/types';

const timedEvent: EventItem = {
  id: 'e-teste',
  slug: 'concerto-de-teste',
  title: { pt: 'Concerto; com ponto e vírgula, e vírgula' },
  summary: { pt: 'Primeira linha\nSegunda linha' },
  category: 'Música',
  startDate: '2026-08-14',
  startTime: '21:30',
  endTime: '23:00',
  location: 'Jardim Municipal',
  geo: { lat: 41.3451, lon: -6.9578 },
};

const allDayEvent: EventItem = {
  ...timedEvent,
  id: 'e-feira',
  slug: 'feira-de-teste',
  title: { pt: 'Feira anual' },
  startTime: undefined,
  endTime: undefined,
  startDate: '2026-09-11',
  endDate: '2026-09-13',
};

describe('ficheiro .ics', () => {
  const ics = eventToIcs(timedEvent, 'https://www.cm-alfandegadafe.pt');

  it('usa terminadores de linha CRLF, como manda o RFC 5545', () => {
    expect(ics.includes('\r\n')).toBe(true);
    expect(ics.split('\r\n').some((line) => line.endsWith('\n'))).toBe(false);
  });

  it('abre e fecha o calendário e o evento', () => {
    expect(ics.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0')).toBe(true);
    expect(ics.trimEnd().endsWith('END:VCALENDAR')).toBe(true);
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('END:VEVENT');
  });

  it('escapa ponto e vírgula, vírgula e quebras de linha', () => {
    expect(ics).toContain('SUMMARY:Concerto\\; com ponto e vírgula\\, e vírgula');
    expect(ics).toContain('DESCRIPTION:Primeira linha\\nSegunda linha');
  });

  it('escreve horas como marca temporal UTC', () => {
    expect(ics).toContain('DTSTART:20260814T213000Z');
    expect(ics).toContain('DTEND:20260814T230000Z');
  });

  it('trata eventos sem hora como todo o dia, com fim exclusivo', () => {
    const allDay = eventToIcs(allDayEvent, 'https://www.cm-alfandegadafe.pt');
    expect(allDay).toContain('DTSTART;VALUE=DATE:20260911');
    // O fim de um evento de dia inteiro é o dia seguinte ao último.
    expect(allDay).toContain('DTEND;VALUE=DATE:20260914');
  });

  it('dobra linhas com mais de 75 octetos', () => {
    const lines = ics.split('\r\n');
    for (const line of lines) {
      expect(line.length).toBeLessThanOrEqual(75);
    }
  });

  it('inclui as coordenadas quando existem', () => {
    expect(ics).toContain('GEO:41.3451;-6.9578');
  });
});
