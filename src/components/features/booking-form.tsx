'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@/lib/forms/zod-resolver';
import { bookingSchema, type BookingInput } from '@/lib/forms/schemas';
import { submitBooking } from '@/app/actions';
import { localePath, type Locale } from '@/i18n/config';
import { fill, type Dictionary } from '@/i18n';
import type { BookableService } from '@/content/types';
import { tx } from '@/content/types';
import { formatDate, formatWeekdayShort } from '@/lib/format';
import { CheckboxField, Honeypot, TextArea, TextField } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

/**
 * Terminbuchung in drei Schritten: Dienst, Tag, Uhrzeit.
 *
 * Der Slot-Kalender ist eine Gruppe von Optionsfeldern, kein Raster aus
 * `div`s: Pfeiltasten wechseln die Uhrzeit, die Auswahl wird angesagt, und
 * die Beschriftung nennt Datum und Uhrzeit vollständig – „14:30 de 4 ago“
 * statt nur „14:30“.
 */
export function BookingForm({
  services,
  slotsByDay,
  days,
  locale,
  dict,
}: {
  services: BookableService[];
  /** Vorberechnet auf dem Server: { serviceId: { 'YYYY-MM-DD': ['09:00', …] } } */
  slotsByDay: Record<string, Record<string, string[]>>;
  days: string[];
  locale: Locale;
  dict: Dictionary;
}) {
  const [serviceId, setServiceId] = useState(services[0]?.id ?? '');
  const [day, setDay] = useState(days[0] ?? '');
  const [time, setTime] = useState('');
  const [reference, setReference] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BookingInput>({ resolver: zodResolver(bookingSchema), mode: 'onBlur' });

  const service = services.find((item) => item.id === serviceId);
  const slots = useMemo(() => slotsByDay[serviceId]?.[day] ?? [], [slotsByDay, serviceId, day]);

  if (reference && service) {
    return (
      <Alert tone="success" title={dict.booking.confirmed} live="polite">
        <p>{dict.booking.confirmedLead}</p>
        <p className="mt-3">
          <strong>{tx(service.label, locale)}</strong> — {formatDate(day, locale)}, {time}
          <br />
          {dict.reports.reference}: <strong className="tabular-nums">{reference}</strong>
        </p>
        <p className="mt-3 font-semibold">{dict.booking.bringDocuments}:</p>
        <ul className="mt-1 list-disc ps-5">
          {tx(service.bring, locale).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Alert>
    );
  }

  return (
    <form
      noValidate
      className="flex flex-col gap-8"
      onSubmit={handleSubmit(async (values) => {
        setServerError(null);
        const result = await submitBooking({ ...values, serviceId, date: day, time });
        if (result.ok && result.reference) setReference(result.reference);
        else setServerError(result.message ?? dict.forms.errorTitle);
      })}
    >
      {serverError ? (
        <Alert tone="danger" title={dict.forms.errorTitle} live="assertive">
          {serverError}
        </Alert>
      ) : null}

      {/* 1 — Dienst */}
      <fieldset>
        <legend className="mb-3 font-serif text-xl">1. {dict.booking.chooseService}</legend>
        <ul className="grid gap-2 sm:grid-cols-2">
          {services.map((item) => (
            <li key={item.id}>
              <label
                className={cn(
                  'flex min-h-14 cursor-pointer items-start gap-3 rounded-md border p-3',
                  serviceId === item.id
                    ? 'border-accent-600 bg-accent-100/50'
                    : 'border-line hover:bg-surface-alt',
                )}
              >
                <input
                  type="radio"
                  name="servico"
                  value={item.id}
                  checked={serviceId === item.id}
                  onChange={() => {
                    setServiceId(item.id);
                    setTime('');
                  }}
                  className="mt-1 size-5 shrink-0 accent-[var(--color-accent-600)]"
                />
                <span>
                  <span className="block font-semibold">{tx(item.label, locale)}</span>
                  <span className="block text-sm text-ink-muted">
                    {item.department} · {item.durationMinutes} min
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      {/* 2 — Tag */}
      <fieldset>
        <legend className="mb-3 font-serif text-xl">2. {dict.booking.chooseDay}</legend>
        <ul className="flex flex-wrap gap-2">
          {days.map((candidate) => {
            const count = slotsByDay[serviceId]?.[candidate]?.length ?? 0;
            const date = new Date(`${candidate}T00:00:00.000Z`);
            return (
              <li key={candidate}>
                <label
                  className={cn(
                    'focus-ring-within flex min-h-16 w-20 cursor-pointer flex-col items-center justify-center rounded-md border',
                    count === 0 && 'cursor-not-allowed opacity-45',
                    day === candidate
                      ? 'border-accent-600 bg-accent-100/50 font-semibold'
                      : 'border-line hover:bg-surface-alt',
                  )}
                >
                  <input
                    type="radio"
                    name="dia"
                    value={candidate}
                    disabled={count === 0}
                    checked={day === candidate}
                    onChange={() => {
                      setDay(candidate);
                      setTime('');
                    }}
                    className="sr-only"
                  />
                  <span className="text-xs text-ink-muted">
                    {formatWeekdayShort(candidate, locale)}
                  </span>
                  <span className="font-serif text-lg tabular-nums">{date.getUTCDate()}</span>
                  <span className="text-xs text-ink-muted tabular-nums">{count}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      {/* 3 — Uhrzeit */}
      <fieldset>
        <legend className="mb-3 font-serif text-xl">3. {dict.booking.chooseSlot}</legend>
        <p aria-live="polite" className="mb-3 text-sm text-ink-muted">
          {formatDate(day, locale)} —{' '}
          {slots.length > 0 ? fill(dict.booking.slotsAvailable, { n: slots.length }) : dict.booking.noSlots}
        </p>
        {slots.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {slots.map((slot) => (
              <li key={slot}>
                <label
                  className={cn(
                    'focus-ring-within inline-flex min-h-11 cursor-pointer items-center rounded-md border px-4 tabular-nums',
                    time === slot
                      ? 'border-accent-600 bg-accent-600 font-semibold text-white'
                      : 'border-line-strong hover:bg-surface-alt',
                  )}
                >
                  <input
                    type="radio"
                    name="hora"
                    value={slot}
                    checked={time === slot}
                    onChange={() => setTime(slot)}
                    className="sr-only"
                  />
                  <span className="sr-only">{formatDate(day, locale)}, </span>
                  {slot}
                </label>
              </li>
            ))}
          </ul>
        ) : null}
      </fieldset>

      {/* 4 — Daten */}
      <fieldset className="flex flex-col gap-5">
        <legend className="mb-3 font-serif text-xl">4. {dict.booking.yourData}</legend>
        <TextField
          label={dict.forms.fullName}
          required
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />
        <TextField
          label={dict.forms.email}
          type="email"
          required
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label={dict.forms.phone}
          type="tel"
          required
          autoComplete="tel"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <TextArea
          label="Assunto (ajuda-nos a preparar o atendimento)"
          rows={3}
          error={errors.notes?.message}
          {...register('notes')}
        />
      </fieldset>

      {service ? (
        <div className="rounded-lg border border-line bg-surface-alt p-5">
          <h2 className="flex items-center gap-2 font-serif text-lg">
            <Icon name="briefcase" size={19} className="text-primary-700" />
            {dict.booking.bringDocuments}
          </h2>
          <ul className="mt-2 flex flex-col gap-1.5">
            {tx(service.bring, locale).map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Icon name="check" size={17} className="mt-1 shrink-0 text-success" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <CheckboxField error={errors.consent?.message} {...register('consent')}>
        {dict.forms.consent}{' '}
        <Link
          href={localePath(locale, '/privacidade')}
          className="text-primary-600 underline underline-offset-[0.2em]"
        >
          {dict.forms.consentLink}
        </Link>
      </CheckboxField>

      <Honeypot />

      <div>
        <Button type="submit" size="lg" disabled={isSubmitting || !time} icon="calendar">
          {isSubmitting ? dict.forms.sending : dict.booking.confirmBooking}
        </Button>
        {!time ? (
          <p className="mt-2 text-sm text-ink-muted">Escolha primeiro uma hora disponível.</p>
        ) : null}
      </div>
    </form>
  );
}
