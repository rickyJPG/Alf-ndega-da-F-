'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@/lib/forms/zod-resolver';
import { occurrenceSchema, type OccurrenceInput } from '@/lib/forms/schemas';
import { submitOccurrence } from '@/app/actions';
import { localePath, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import type { Freguesia } from '@/content/types';
import { CheckboxField, Honeypot, SelectField, TextArea, TextField } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Icon } from '@/components/ui/icon';

/** Leaflet só no navegador — poupa cerca de 45 kB em todas as outras páginas. */
const LocationMap = dynamic(
  () => import('./location-map').then((module) => module.LocationMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 w-full rounded-lg border border-line bg-surface-alt" aria-hidden="true" />
    ),
  },
);

const CATEGORIES: { value: OccurrenceInput['category']; label: string }[] = [
  { value: 'via-publica', label: 'Via pública (buracos, passeios)' },
  { value: 'iluminacao', label: 'Iluminação pública' },
  { value: 'residuos', label: 'Resíduos e limpeza' },
  { value: 'agua-e-saneamento', label: 'Água e saneamento' },
  { value: 'espacos-verdes', label: 'Espaços verdes e árvores' },
  { value: 'sinalizacao', label: 'Sinalização' },
  { value: 'outro', label: 'Outro assunto' },
];

/**
 * Meldeportal.
 *
 * Bastam quatro indicações: o quê, onde, um ponto no mapa e o consentimento
 * para o tratamento dos dados. Nome e contacto são facultativos — quem os
 * deixar recebe resposta, quem não deixar acompanha pelo número de referência
 * verfolgen.
 */
export function ReportForm({
  dict,
  locale,
  freguesias,
}: {
  dict: Dictionary;
  locale: Locale;
  freguesias: Freguesia[];
}) {
  const [position, setPosition] = useState<{ lat: number; lon: number } | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OccurrenceInput>({
    resolver: zodResolver(occurrenceSchema),
    mode: 'onBlur',
  });

  function choosePosition(next: { lat: number; lon: number }) {
    setPosition(next);
    setValue('lat', next.lat, { shouldValidate: true });
    setValue('lon', next.lon, { shouldValidate: true });
  }

  function onPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setPhotoError(null);
    if (!file) {
      setPhotoName(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('A fotografia tem mais de 5 MB. Escolha outra ou reduza o tamanho.');
      setPhotoName(null);
      event.target.value = '';
      return;
    }
    setPhotoName(file.name);
  }

  if (reference) {
    return (
      <Alert tone="success" title={dict.reports.submitted} live="polite">
        <p>{dict.reports.submittedLead}</p>
        <p className="mt-3">
          {dict.reports.reference}:{' '}
          <strong className="font-serif text-xl tabular-nums">{reference}</strong>
        </p>
        <p className="mt-1 text-sm">{dict.reports.referenceHint}</p>
      </Alert>
    );
  }

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form
      noValidate
      className="relative flex flex-col gap-6"
      onSubmit={handleSubmit(async (values) => {
        setServerError(null);
        const result = await submitOccurrence(values);
        if (result.ok && result.reference) setReference(result.reference);
        else setServerError(result.message ?? dict.forms.errorTitle);
      })}
    >
      {hasErrors || serverError ? (
        <Alert tone="danger" title={dict.forms.errorTitle} live="assertive">
          {serverError ?? dict.forms.errorSummary}
        </Alert>
      ) : null}

      <SelectField
        label={dict.forms.category}
        required
        error={errors.category?.message}
        options={[{ value: '', label: '— escolha —' }, ...CATEGORIES]}
        {...register('category')}
      />

      <TextArea
        label="O que se passa"
        required
        rows={5}
        hint="Descreva o problema e, se puder, um ponto de referência («em frente ao número 22»)."
        error={errors.description?.message}
        {...register('description')}
      />

      <SelectField
        label={dict.forms.freguesia}
        required
        error={errors.freguesia?.message}
        options={[
          { value: '', label: '— escolha —' },
          ...freguesias.map((freguesia) => ({ value: freguesia.slug, label: freguesia.name })),
        ]}
        {...register('freguesia')}
      />

      <div>
        <p className="mb-1.5 font-semibold">
          {dict.reports.pickOnMap}
          <span aria-hidden="true" className="ms-1 text-accent-700">
            *
          </span>
        </p>
        <LocationMap
          selectable
          value={position}
          onChange={choosePosition}
          label={dict.reports.mapLabel}
          hint={dict.reports.pickOnMapHint}
        />
        <input type="hidden" {...register('lat', { valueAsNumber: true })} />
        <input type="hidden" {...register('lon', { valueAsNumber: true })} />
        {errors.lat || errors.lon ? (
          <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-accent-700">
            <Icon name="alert" size={16} />
            Marque o local no mapa ou use a sua localização.
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="report-photo" className="font-semibold">
          {dict.forms.photo}
          <span className="ms-1 font-normal text-ink-muted">({dict.common.optional})</span>
        </label>
        <p id="report-photo-hint" className="text-sm text-ink-muted">
          {dict.forms.photoHint}
        </p>
        <input
          id="report-photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onPhoto}
          aria-describedby="report-photo-hint"
          className="min-h-11 rounded-md border border-line-strong bg-surface p-2 file:me-3 file:rounded-md file:border-0 file:bg-primary-100 file:px-3 file:py-1.5 file:font-semibold file:text-primary-700"
        />
        {photoName ? (
          <p className="flex items-center gap-1.5 text-sm text-success">
            <Icon name="check" size={16} />
            {photoName}
          </p>
        ) : null}
        {photoError ? (
          <p role="alert" className="flex items-center gap-1.5 text-sm font-medium text-accent-700">
            <Icon name="alert" size={16} />
            {photoError}
          </p>
        ) : null}
      </div>

      <fieldset className="flex flex-col gap-5 rounded-lg border border-line bg-surface-alt p-5">
        <legend className="px-2 font-semibold">Quer que lhe respondamos? ({dict.common.optional})</legend>
        <TextField label={dict.forms.name} autoComplete="name" error={errors.name?.message} {...register('name')} />
        <TextField
          label={dict.forms.email}
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label={dict.forms.phone}
          type="tel"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register('phone')}
        />
      </fieldset>

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
        <Button type="submit" size="lg" disabled={isSubmitting} icon="megaphone">
          {isSubmitting ? dict.forms.sending : dict.common.submit}
        </Button>
      </div>
    </form>
  );
}
