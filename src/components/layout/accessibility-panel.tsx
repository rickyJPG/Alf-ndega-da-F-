'use client';

import * as Dialog from '@radix-ui/react-dialog';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  FONT_SCALE_STEPS,
  applyPreferences,
  defaultPreferences,
  readPreferences,
  writePreferences,
  type Preferences,
  type ThemeChoice,
} from '@/lib/preferences';
import { localePath, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Barrierefreiheits-Panel.
 *
 * Alle Optionen wirken sofort und werden lokal gespeichert. Die Umsetzung
 * läuft über data-Attribute auf <html> und CSS-Variablen – kein Neuladen,
 * keine zweite Stylesheet-Variante, kein Server-Roundtrip.
 */
export function AccessibilityPanel({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [prefs, setPrefs] = useState<Preferences>(defaultPreferences);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPrefs(readPreferences());
    setReady(true);
  }, []);

  const update = useCallback((patch: Partial<Preferences>) => {
    setPrefs((current) => {
      const next = { ...current, ...patch };
      writePreferences(next);
      applyPreferences(next, document.documentElement);
      return next;
    });
  }, []);

  // Folgt der Systemeinstellung, solange der Nutzer „Sistema“ gewählt hat.
  useEffect(() => {
    if (!ready || prefs.theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyPreferences(prefs, document.documentElement);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [prefs, ready]);

  const scaleIndex = Math.max(0, FONT_SCALE_STEPS.indexOf(prefs.fontScale as (typeof FONT_SCALE_STEPS)[number]));
  const scalePercent = Math.round(prefs.fontScale * 100);

  return (
    <Dialog.Root>
      <Dialog.Trigger
        className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white"
        aria-label={dict.utility.accessibilityOptions}
      >
        <Icon name="accessibility" size={17} />
        <span className="hidden sm:inline">{dict.utility.accessibility}</span>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-primary-900/60" />
        <Dialog.Content className="fixed inset-y-0 end-0 z-50 flex w-full max-w-sm flex-col overflow-y-auto bg-surface shadow-[var(--shadow-2)] outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div>
              <Dialog.Title className="font-serif text-xl font-semibold">
                {dict.a11y.panelTitle}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-ink-muted">
                {dict.a11y.panelLead}
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label={dict.common.close}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-md hover:bg-surface-alt"
            >
              <Icon name="close" size={22} />
            </Dialog.Close>
          </div>

          <div className="flex flex-1 flex-col gap-6 p-5">
            {/* Textgröße */}
            <div>
              <p className="mb-2 font-semibold" id="a11y-textsize">
                {dict.a11y.textSize}
              </p>
              <div className="flex items-center gap-2" role="group" aria-labelledby="a11y-textsize">
                <Button
                  variant="subtle"
                  size="sm"
                  icon="minus"
                  disabled={scaleIndex <= 0}
                  onClick={() => update({ fontScale: FONT_SCALE_STEPS[Math.max(0, scaleIndex - 1)] })}
                >
                  {dict.a11y.decrease}
                </Button>
                <output
                  aria-live="polite"
                  className="min-w-16 rounded-md border border-line bg-surface-alt px-2 py-1.5 text-center font-semibold tabular-nums"
                >
                  {scalePercent}%
                </output>
                <Button
                  variant="subtle"
                  size="sm"
                  icon="plus"
                  disabled={scaleIndex >= FONT_SCALE_STEPS.length - 1}
                  onClick={() =>
                    update({
                      fontScale: FONT_SCALE_STEPS[Math.min(FONT_SCALE_STEPS.length - 1, scaleIndex + 1)],
                    })
                  }
                >
                  {dict.a11y.increase}
                </Button>
              </div>
            </div>

            {/* Thema */}
            <fieldset>
              <legend className="mb-2 font-semibold">{dict.utility.theme}</legend>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    ['light', dict.utility.themeLight, 'sun'],
                    ['dark', dict.utility.themeDark, 'moon'],
                    ['system', dict.utility.themeSystem, 'globe'],
                  ] as const
                ).map(([value, label, icon]) => (
                  <label
                    key={value}
                    className={cn(
                      'focus-ring-within flex min-h-11 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border p-2 text-sm',
                      prefs.theme === value
                        ? 'border-accent-600 bg-accent-100 font-semibold text-accent-700'
                        : 'border-line hover:bg-surface-alt',
                    )}
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={value}
                      checked={prefs.theme === value}
                      onChange={() => update({ theme: value as ThemeChoice })}
                      className="sr-only"
                    />
                    <Icon name={icon} size={18} />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <Toggle
              label={dict.a11y.contrast}
              checked={prefs.highContrast}
              onChange={(v) => update({ highContrast: v })}
            />
            <Toggle
              label={dict.a11y.lineSpacing}
              checked={prefs.looseSpacing}
              onChange={(v) => update({ looseSpacing: v })}
            />
            <Toggle
              label={dict.a11y.legibleFont}
              hint={dict.a11y.legibleFontHint}
              checked={prefs.legibleFont}
              onChange={(v) => update({ legibleFont: v })}
            />
            <Toggle
              label={dict.a11y.reduceMotion}
              checked={prefs.reduceMotion}
              onChange={(v) => update({ reduceMotion: v })}
            />

            <div className="mt-auto flex flex-col gap-3 border-t border-line pt-5">
              <Button
                variant="subtle"
                onClick={() => {
                  writePreferences(defaultPreferences);
                  applyPreferences(defaultPreferences, document.documentElement);
                  setPrefs(defaultPreferences);
                }}
              >
                {dict.a11y.reset}
              </Button>
              <Link
                href={localePath(locale, '/acessibilidade')}
                className="inline-flex items-center gap-1.5 text-primary-600 underline underline-offset-[0.2em]"
              >
                <Icon name="fileText" size={16} />
                {dict.a11y.statement}
              </Link>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * Schalter als natives Kontrollkästchen mit `role="switch"`.
 * Der Zustand steht auch als Text da, nicht nur als Position des Reglers.
 */
function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="flex-1">
        <span className="font-semibold">{label}</span>
        {hint ? <span className="mt-0.5 block text-sm text-ink-muted">{hint}</span> : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-7 w-13 shrink-0 items-center rounded-pill border-2 transition-colors',
          checked ? 'border-accent-600 bg-accent-600' : 'border-line-strong bg-surface-sunken',
        )}
      >
        <span
          className={cn(
            'absolute size-5 rounded-pill bg-surface transition-[inset-inline-start]',
            checked ? 'start-[calc(100%-1.5rem)]' : 'start-0.5',
          )}
        />
      </button>
    </div>
  );
}
