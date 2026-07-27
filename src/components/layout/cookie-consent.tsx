'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { localePath, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

const CONSENT_KEY = 'cmadf:consent';

type Consent = { analytics: boolean; decidedAt: string };

/**
 * Cookie-Hinweis.
 *
 * A predefinição é «apenas o essencial». Recusar é tão fácil como aceitar:
 * mesmo tamanho, mesma posição, mesmo peso — nada de esconder o botão de
 * recusa. Sem consentimento não se mede coisa nenhuma.
 *
 * A escolha fica em localStorage e não num cookie: assim o próprio registo
 * do consentimento não precisa de consentimento.
 */
export function CookieConsent({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CONSENT_KEY);
      if (!stored) setVisible(true);
    } catch {
      /* Sem armazenamento disponível: não se mede nada nem se pergunta nada. */
    }
  }, []);

  /**
   * O aviso fica fixo no fundo do ecrã. Sem espaço reservado por baixo,
   * em ecrãs pequenos taparia de forma permanente os últimos controlos da
   * página — por exemplo o botão de submeter um formulário.
   */
  useEffect(() => {
    const root = document.documentElement;
    if (!visible) {
      root.style.removeProperty('--consent-height');
      return;
    }

    const element = bannerRef.current;
    if (!element) return;

    const observer = new ResizeObserver(() => {
      root.style.setProperty('--consent-height', `${element.offsetHeight}px`);
    });
    observer.observe(element);
    root.style.setProperty('--consent-height', `${element.offsetHeight}px`);

    return () => {
      observer.disconnect();
      root.style.removeProperty('--consent-height');
    };
  }, [visible, showDetails]);

  function decide(value: boolean) {
    const consent: Consent = { analytics: value, decidedAt: new Date().toISOString() };
    try {
      window.localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    } catch {
      /* ignorieren */
    }
    window.dispatchEvent(new CustomEvent('cmadf:consent', { detail: consent }));
    setVisible(false);
  }

  if (!visible) return null;

  const buttonBase =
    'inline-flex min-h-11 flex-1 items-center justify-center rounded-md border px-4 py-2 font-semibold sm:flex-none';

  return (
    <div
      ref={bannerRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-title"
      className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-primary-800 bg-surface shadow-[var(--shadow-2)]"
    >
      <div className="container-page py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="measure">
            <h2 id="cookie-title" className="font-serif text-lg font-semibold">
              {dict.cookies.title}
            </h2>
            <p className="mt-1 text-sm text-ink-muted">{dict.cookies.body}</p>
            <p className="mt-2 text-sm">
              <Link
                href={localePath(locale, '/cookies')}
                className="text-primary-600 underline underline-offset-[0.2em]"
              >
                {dict.footer.cookies}
              </Link>
              {' · '}
              <Link
                href={localePath(locale, '/privacidade')}
                className="text-primary-600 underline underline-offset-[0.2em]"
              >
                {dict.footer.privacy}
              </Link>
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => decide(false)}
                className={cn(buttonBase, 'border-line-strong bg-surface text-ink hover:bg-surface-alt')}
              >
                {dict.cookies.rejectAll}
              </button>
              <button
                type="button"
                onClick={() => decide(true)}
                className={cn(buttonBase, 'border-primary-800 bg-primary-800 text-white hover:bg-primary-900')}
              >
                {dict.cookies.acceptAll}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowDetails((value) => !value)}
              aria-expanded={showDetails}
              className="inline-flex min-h-9 items-center justify-center gap-1.5 text-sm text-primary-600 underline underline-offset-[0.2em]"
            >
              {dict.cookies.settings}
              <Icon name={showDetails ? 'chevronUp' : 'chevronDown'} size={15} />
            </button>
          </div>
        </div>

        {showDetails ? (
          <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4">
            <div className="flex items-start gap-3">
              <Icon name="check" size={18} className="mt-1 text-success" />
              <div>
                <p className="font-semibold">{dict.cookies.essential}</p>
                <p className="text-sm text-ink-muted">{dict.cookies.essentialHint}</p>
              </div>
            </div>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(event) => setAnalytics(event.target.checked)}
                className="mt-1 size-5 shrink-0 rounded-sm border-2 border-line-strong accent-[var(--color-accent-600)]"
              />
              <span>
                <span className="font-semibold">{dict.cookies.analytics}</span>
                <span className="block text-sm text-ink-muted">{dict.cookies.analyticsHint}</span>
              </span>
            </label>
            <button
              type="button"
              onClick={() => decide(analytics)}
              className={cn(buttonBase, 'self-start border-line-strong bg-surface text-ink hover:bg-surface-alt')}
            >
              {dict.cookies.save}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
