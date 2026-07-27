'use client';

import { useMemo, useState } from 'react';
import type { ParticipatoryProject } from '@/content/types';
import { tx } from '@/content/types';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { formatCurrency, formatNumber } from '@/lib/format';
import { Badge, type BadgeTone } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

const STATUS: Record<
  ParticipatoryProject['status'],
  { tone: BadgeTone; label: string }
> = {
  'em-votacao': { tone: 'accent', label: 'Em votação' },
  vencedor: { tone: 'success', label: 'Vencedor' },
  'em-execucao': { tone: 'warning', label: 'Em execução' },
  concluido: { tone: 'success', label: 'Concluído' },
  'nao-selecionado': { tone: 'neutral', label: 'Não selecionado' },
};

const STRANDS: { id: ParticipatoryProject['strand'] | 'todas'; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'geral', label: 'Geral' },
  { id: 'jovem', label: 'Jovem' },
  { id: 'senior', label: 'Sénior' },
];

/**
 * Orçamento Participativo: Vorschläge ansehen, abstimmen, Umsetzung verfolgen.
 *
 * Die Stimmabgabe ist hier absichtlich nur bis zur Bestätigung geführt: in
 * Produktion wird an dieser Stelle die Authentifizierung mit Chave Móvel
 * Digital vorgeschaltet, weil eine Stimme pro Person zählbar sein muss.
 */
export function ParticipatoryBudget({
  projects,
  locale,
  dict,
}: {
  projects: ParticipatoryProject[];
  locale: Locale;
  dict: Dictionary;
}) {
  const [strand, setStrand] = useState<(typeof STRANDS)[number]['id']>('todas');
  const [voted, setVoted] = useState<string[]>([]);

  const editions = useMemo(
    () => [...new Set(projects.map((project) => project.edition))].sort((a, b) => b - a),
    [projects],
  );

  const visible = projects.filter(
    (project) => strand === 'todas' || project.strand === strand,
  );

  return (
    <div>
      <fieldset className="mb-6">
        <legend className="mb-2 font-semibold">Vertente</legend>
        <ul className="flex flex-wrap gap-2">
          {STRANDS.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => setStrand(entry.id)}
                aria-pressed={strand === entry.id}
                className={cn(
                  'inline-flex min-h-11 items-center rounded-pill border px-4',
                  strand === entry.id
                    ? 'border-primary-800 bg-primary-800 font-semibold text-white'
                    : 'border-line-strong bg-surface text-ink hover:bg-surface-alt',
                )}
              >
                {entry.label}
              </button>
            </li>
          ))}
        </ul>
      </fieldset>

      {editions.map((edition) => {
        const forEdition = visible.filter((project) => project.edition === edition);
        if (forEdition.length === 0) return null;

        return (
          <section key={edition} aria-labelledby={`op-${edition}`} className="mb-12">
            <h3 id={`op-${edition}`} className="mb-4 font-serif text-2xl">
              Edição de {edition}
            </h3>

            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {forEdition.map((project) => {
                const status = STATUS[project.status];
                const hasVoted = voted.includes(project.id);
                const votes = project.votes + (hasVoted ? 1 : 0);

                return (
                  <li key={project.id} className="flex">
                    <article className="flex w-full flex-col gap-3 rounded-lg border border-line bg-surface p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={status.tone}>{status.label}</Badge>
                        <span className="text-sm text-ink-muted capitalize">{project.strand}</span>
                      </div>

                      <h4 className="font-serif text-lg font-semibold">
                        {tx(project.title, locale)}
                      </h4>
                      <p className="text-sm text-ink-muted">{tx(project.summary, locale)}</p>

                      <dl className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                        <div className="flex items-center gap-1.5">
                          <dt className="text-ink-muted">{dict.participation.budgetOfProject}</dt>
                          <dd className="font-semibold tabular-nums">
                            {formatCurrency(project.budget, locale)}
                          </dd>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <dt className="text-ink-muted">{dict.participation.votes}</dt>
                          <dd className="font-semibold tabular-nums">
                            {formatNumber(votes, locale)}
                          </dd>
                        </div>
                      </dl>

                      {project.status === 'em-execucao' && project.progress !== undefined ? (
                        <div className="mt-auto">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-ink-muted">{dict.participation.projectStatus}</span>
                            <span className="font-semibold tabular-nums">{project.progress}%</span>
                          </div>
                          <div
                            role="progressbar"
                            aria-valuenow={project.progress}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${dict.participation.projectStatus}: ${tx(project.title, locale)}`}
                            className="mt-1.5 h-2.5 overflow-hidden rounded-pill bg-surface-sunken"
                          >
                            <div
                              className="h-full rounded-pill bg-support-700"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                      ) : null}

                      {project.status === 'em-votacao' ? (
                        <div className="mt-auto pt-2">
                          {hasVoted ? (
                            <p className="flex items-center gap-2 font-semibold text-success">
                              <Icon name="checkCircle" size={19} />
                              {dict.participation.voted}
                            </p>
                          ) : (
                            <Button
                              size="sm"
                              icon="check"
                              onClick={() => setVoted((current) => [...current, project.id])}
                            >
                              {dict.participation.vote}
                            </Button>
                          )}
                        </div>
                      ) : null}
                    </article>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <p aria-live="polite" className="sr-only">
        {voted.length > 0 ? `${voted.length} ${dict.participation.votes}` : ''}
      </p>
    </div>
  );
}
