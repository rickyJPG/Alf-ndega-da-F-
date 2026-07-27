'use client';

import { useState, type FormEvent } from 'react';
import type { Dictionary } from '@/i18n';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

const TOPICS = [
  { id: 'noticias', label: 'Notícias do Município' },
  { id: 'agenda', label: 'Agenda cultural' },
  { id: 'consultas', label: 'Consultas públicas' },
  { id: 'concursos', label: 'Concursos e recrutamento' },
  { id: 'avisos', label: 'Avisos e proteção civil' },
];

/**
 * Boletim informativo com subscrição por temas e dupla confirmação.
 *
 * Sem o clique de confirmação na ligação enviada não há subscrição — é a
 * forma conforme ao RGPD e é isso que o texto de aviso diz.
 */
export function NewsletterForm({ dict }: { dict: Dictionary }) {
  const [email, setEmail] = useState('');
  const [topics, setTopics] = useState<string[]>(['noticias']);
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.includes('@')) {
      setState('error');
      return;
    }
    setState('sending');
    // Ligação ao serviço de envio: ver o README, secção «Boletim informativo».
    await new Promise((resolve) => setTimeout(resolve, 400));
    setState('done');
  }

  if (state === 'done') {
    return (
      <div className="rounded-md border border-s-4 border-success bg-success-surface p-4" role="status">
        <p className="flex items-start gap-2 text-sm text-ink">
          <Icon name="checkCircle" size={20} className="mt-0.5 shrink-0 text-success" />
          <span>{dict.footer.newsletterDoubleOptIn}</span>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-semibold text-ink">
          {dict.footer.newsletterTopics}
        </legend>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((topic) => {
            const checked = topics.includes(topic.id);
            return (
              <label
                key={topic.id}
                className={cn(
                  'focus-ring-within cursor-pointer rounded-pill border px-3 py-1.5 text-sm',
                  checked
                    ? 'border-accent-600 bg-accent-600 font-semibold text-white'
                    : 'border-line-strong bg-surface text-ink hover:border-accent-600',
                )}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() =>
                    setTopics((current) =>
                      checked ? current.filter((id) => id !== topic.id) : [...current, topic.id],
                    )
                  }
                />
                {topic.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="newsletter-email" className="sr-only">
            {dict.forms.email}
          </label>
          <input
            id="newsletter-email"
            type="email"
            name="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={state === 'error' || undefined}
            aria-describedby={state === 'error' ? 'newsletter-error' : 'newsletter-hint'}
            placeholder="nome@exemplo.pt"
            className="min-h-11 w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-ink placeholder:text-ink-muted"
          />
        </div>
        <button
          type="submit"
          disabled={state === 'sending'}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-accent-600 bg-accent-600 px-4 font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {state === 'sending' ? dict.forms.sending : dict.footer.newsletterCta}
        </button>
      </div>

      {/* Campo-armadilha em vez de CAPTCHA */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor="newsletter-company">Não preencher</label>
        <input id="newsletter-company" name="empresa" tabIndex={-1} autoComplete="off" />
      </div>

      {state === 'error' ? (
        <p id="newsletter-error" role="alert" className="flex items-center gap-1.5 text-sm text-danger">
          <Icon name="alert" size={16} />
          {dict.forms.fieldEmail}
        </p>
      ) : (
        <p id="newsletter-hint" className="text-sm text-ink-muted">
          {dict.footer.newsletterDoubleOptIn}
        </p>
      )}
    </form>
  );
}
