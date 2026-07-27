'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { zodResolver } from '@/lib/forms/zod-resolver';
import { consultationSchema, type ConsultationInput } from '@/lib/forms/schemas';
import { submitConsultation } from '@/app/actions';
import { localePath, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { CheckboxField, Honeypot, TextArea, TextField } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

/**
 * Beitrag zu einer laufenden Konsultation.
 *
 * Fehler werden zusammengefasst am Kopf des Formulars ausgegeben und
 * zusätzlich am Feld – wer mit dem Screenreader arbeitet, erfährt sofort,
 * wie viele Felder betroffen sind, statt sie einzeln suchen zu müssen.
 */
export function ConsultationForm({
  dict,
  locale,
  consultationTitle,
}: {
  dict: Dictionary;
  locale: Locale;
  consultationTitle: string;
}) {
  const [reference, setReference] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ConsultationInput>({
    resolver: zodResolver(consultationSchema),
    mode: 'onBlur',
  });

  if (reference) {
    return (
      <Alert tone="success" title={dict.forms.sent} live="polite" className="mt-6">
        <p>
          Obrigado pelo seu contributo para «{consultationTitle}». Todos os contributos são
          analisados e respondidos no relatório de ponderação, publicado no fim do prazo.
        </p>
        <p className="mt-2">
          Referência: <strong className="tabular-nums">{reference}</strong>
        </p>
      </Alert>
    );
  }

  const errorCount = Object.keys(errors).length;

  return (
    <form
      noValidate
      className="relative mt-6 flex max-w-2xl flex-col gap-5"
      onSubmit={handleSubmit(async (values) => {
        setServerError(null);
        const result = await submitConsultation(values);
        if (result.ok && result.reference) setReference(result.reference);
        else setServerError(result.message ?? dict.forms.errorTitle);
      })}
    >
      {errorCount > 0 || serverError ? (
        <Alert tone="danger" title={dict.forms.errorTitle} live="assertive">
          {serverError ?? dict.forms.errorSummary}
        </Alert>
      ) : null}

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
        hint="Usamos o endereço apenas para lhe responder."
        error={errors.email?.message}
        {...register('email')}
      />

      <TextArea
        label="O seu contributo"
        required
        rows={7}
        hint="Diga o que propõe alterar e porquê. Quanto mais concreto, mais útil."
        error={errors.contribution?.message}
        {...register('contribution')}
      />

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
        <Button type="submit" disabled={isSubmitting} icon="arrowRight">
          {isSubmitting ? dict.forms.sending : dict.consultations.participate}
        </Button>
      </div>
    </form>
  );
}
