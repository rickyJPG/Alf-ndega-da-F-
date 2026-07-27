'use client';

import { useState } from 'react';
import type { Occurrence } from '@/content/types';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { formatDate } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { occurrenceStatusLabel, occurrenceStatusTone } from '@/lib/occurrence-status';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/field';
import { Icon } from '@/components/ui/icon';

/**
 * Acompanhamento do estado pelo número de referência.
 *
 * A pesquisa corre sobre a lista já carregada — sem pedido ao servidor e sem
 * autenticação. Quem tem o número vê o estado; os dados pessoais de quem
 * participou a ocorrência não constam daí.
 */
export function ReportTracker({
  occurrences,
  locale,
  dict,
}: {
  occurrences: Occurrence[];
  locale: Locale;
  dict: Dictionary;
}) {
  const [reference, setReference] = useState('');
  const [result, setResult] = useState<Occurrence | null | undefined>(undefined);

  return (
    <div>
      <form
        className="flex flex-col gap-4 sm:flex-row sm:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          const needle = reference.trim().toLowerCase();
          setResult(
            occurrences.find((item) => item.reference.toLowerCase() === needle) ?? null,
          );
        }}
      >
        <TextField
          className="flex-1"
          label={dict.reports.reference}
          placeholder="OC-2026-0431"
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          hint="A referência foi-lhe mostrada quando registou a ocorrência."
        />
        <Button type="submit" variant="secondary" icon="search">
          {dict.common.search}
        </Button>
      </form>

      <div aria-live="polite" className="mt-6">
        {result === null ? (
          <p className="rounded-md border border-line bg-surface-alt p-5 text-ink-muted">
            Não encontrámos nenhuma ocorrência com essa referência. Verifique se a copiou
            corretamente — o formato é OC-ANO-NÚMERO.
          </p>
        ) : null}

        {result ? (
          <article className="rounded-lg border border-line bg-surface p-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone={occurrenceStatusTone[result.status]}>{occurrenceStatusLabel(result.status, dict)}</Badge>
              <span className="font-serif text-lg font-semibold tabular-nums">
                {result.reference}
              </span>
            </div>

            <p className="mt-3">{result.description}</p>

            <dl className="mt-4 grid gap-3 sm:grid-cols-3">
              <div>
                <dt className="text-sm font-semibold text-ink-muted">Comunicada a</dt>
                <dd>{formatDate(result.reportedAt, locale)}</dd>
              </div>
              {result.resolvedAt ? (
                <div>
                  <dt className="text-sm font-semibold text-ink-muted">Resolvida a</dt>
                  <dd>{formatDate(result.resolvedAt, locale)}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-sm font-semibold text-ink-muted">{dict.forms.freguesia}</dt>
                <dd>{result.freguesia.replace(/-/g, ' ')}</dd>
              </div>
            </dl>

            {result.response ? (
              <p className="mt-4 flex items-start gap-2.5 rounded-md border-s-4 border-primary-600 bg-primary-100/50 p-4">
                <Icon name="info" size={18} className="mt-0.5 shrink-0 text-primary-700" />
                <span>{result.response}</span>
              </p>
            ) : null}
          </article>
        ) : null}
      </div>
    </div>
  );
}
