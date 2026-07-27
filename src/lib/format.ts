import type { Locale } from '@/i18n/config';

const INTL_LOCALE: Record<Locale, string> = {
  pt: 'pt-PT',
  en: 'en-GB',
  es: 'es-ES',
  fr: 'fr-FR',
};

/** Meses abreviados segundo a convenção pt-PT: minúsculas e sem ponto. */
const PT_MONTHS_SHORT = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
];

const PT_MONTHS_LONG = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

const PT_WEEKDAYS_SHORT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

/** `25 jul 2026` — o formato de data normal do portal. */
export function formatDate(value: string | Date, locale: Locale = 'pt'): string {
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return '';
  if (locale === 'pt') {
    return `${date.getUTCDate()} ${PT_MONTHS_SHORT[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
  }
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** `25 de julho de 2026` — para texto corrido e páginas de detalhe. */
export function formatDateLong(value: string | Date, locale: Locale = 'pt'): string {
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return '';
  if (locale === 'pt') {
    return `${date.getUTCDate()} de ${PT_MONTHS_LONG[date.getUTCMonth()]} de ${date.getUTCFullYear()}`;
  }
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function formatWeekdayShort(value: string | Date, locale: Locale = 'pt'): string {
  const date = toDate(value);
  if (locale === 'pt') return PT_WEEKDAYS_SHORT[date.getUTCDay()] ?? '';
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    weekday: 'short',
    timeZone: 'UTC',
  }).format(date);
}

export function formatMonthLong(value: string | Date, locale: Locale = 'pt'): string {
  const date = toDate(value);
  if (locale === 'pt') return `${PT_MONTHS_LONG[date.getUTCMonth()]} de ${date.getUTCFullYear()}`;
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** Formato de 24 horas, como se usa em Portugal. */
export function formatTime(value: string): string {
  const match = /^(\d{1,2}):(\d{2})/.exec(value);
  if (match) return `${match[1].padStart(2, '0')}:${match[2]}`;
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`;
}

/** Legível por máquinas, para <time datetime="…">. */
export function isoDate(value: string | Date): string {
  const date = toDate(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

export function formatNumber(value: number, locale: Locale = 'pt', digits = 0): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

/** `1 234 567 €` — em pt-PT o símbolo vem depois do número. */
export function formatCurrency(value: number, locale: Locale = 'pt', digits = 0): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

/** Forma compacta para indicadores: `4,2 M€`. */
export function formatCurrencyCompact(value: number, locale: Locale = 'pt'): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: 'currency',
    currency: 'EUR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatPercent(value: number, locale: Locale = 'pt', digits = 1): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: 'percent',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

/** Indica o tamanho do ficheiro no texto da ligação: «PDF, 2,3 MB». */
export function formatFileSize(bytes: number, locale: Locale = 'pt'): string {
  const mb = bytes / 1024 / 1024;
  if (mb >= 1) return `${formatNumber(mb, locale, 1)} MB`;
  return `${formatNumber(Math.max(1, Math.round(bytes / 1024)), locale, 0)} kB`;
}

/**
 * Dias inteiros até uma data-limite — a base de «termina em 12 dias».
 * Conta em dias UTC, para que servidor e cliente cheguem ao mesmo resultado.
 */
export function daysUntil(deadline: string | Date, from: string | Date = new Date()): number {
  const a = toDate(from);
  const b = toDate(deadline);
  const startA = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const startB = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.round((startB - startA) / 86_400_000);
}

/** O prazo por extenso. `null` quando não é preciso avisar de nada. */
export function formatDeadline(
  deadline: string | Date,
  labels: { today: string; tomorrow: string; days: (n: number) => string; ended: string },
  from: string | Date = new Date(),
): { text: string; days: number; tone: 'neutral' | 'warning' | 'danger' | 'ended' } {
  const days = daysUntil(deadline, from);
  if (days < 0) return { text: labels.ended, days, tone: 'ended' };
  if (days === 0) return { text: labels.today, days, tone: 'danger' };
  if (days === 1) return { text: labels.tomorrow, days, tone: 'danger' };
  return {
    text: labels.days(days),
    days,
    tone: days <= 7 ? 'warning' : 'neutral',
  };
}
