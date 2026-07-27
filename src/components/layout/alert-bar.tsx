'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Alert as AlertRecord } from '@/content/types';
import { localePath, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { Icon, type IconName } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'cmadf:alerts-dismissed';

const severityStyles: Record<AlertRecord['severity'], { bar: string; icon: IconName; label: keyof Dictionary['alerts'] }> = {
  info: { bar: 'bg-info-surface text-ink border-primary-600', icon: 'info', label: 'levelInfo' },
  warning: { bar: 'bg-warning-surface text-ink border-warning', icon: 'alert', label: 'levelWarning' },
  danger: { bar: 'bg-accent-700 text-white border-accent-700', icon: 'alert', label: 'levelDanger' },
};

/**
 * Alert-Leiste ganz oben – nur sichtbar, wenn wirklich etwas anliegt:
 * Zivilschutz, Wassersperrung, Waldbrandstufe 4/5, Straßensperrungen.
 *
 * Sie wird serverseitig gerendert (kein Nachladen, kein Layout-Sprung) und
 * lässt sich schließen; die Entscheidung gilt für die laufende Sitzung.
 * Bei Stufe „danger“ ist sie bewusst nicht schließbar.
 */
export function AlertBar({
  alerts,
  locale,
  dict,
}: {
  alerts: AlertRecord[];
  locale: Locale;
  dict: Dictionary;
}) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) setDismissed(JSON.parse(raw) as string[]);
    } catch {
      /* ignorieren */
    }
    setHydrated(true);
  }, []);

  function dismiss(id: string) {
    const next = [...dismissed, id];
    setDismissed(next);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignorieren */
    }
  }

  const visible = alerts.filter((alert) => !hydrated || !dismissed.includes(alert.id));
  if (visible.length === 0) return null;

  return (
    /* Ein einziger benannter Bereich für alle Meldungen: mehrere Regionen mit
       demselben Namen wären für die Landmarken-Navigation nicht unterscheidbar. */
    <section aria-label={dict.alerts.label} data-print="hide">
      {visible.map((alert) => {
        const style = severityStyles[alert.severity];
        const canDismiss = alert.severity !== 'danger';

        return (
          <div
            key={alert.id}
            role={alert.severity === 'danger' ? 'alert' : undefined}
            className={cn('border-b-2', style.bar)}
          >
            <div className="container-page flex items-start gap-3 py-2.5">
              <Icon name={style.icon} size={20} className="mt-0.5 shrink-0" />
              <p className="flex-1 text-sm">
                <span className="font-semibold">{dict.alerts[style.label]}: </span>
                <span>{alert.title[locale] ?? alert.title.pt}</span>{' '}
                {alert.href ? (
                  <Link
                    href={localePath(locale, alert.href)}
                    className={cn(
                      'font-semibold underline underline-offset-[0.2em] whitespace-nowrap',
                      alert.severity === 'danger' ? 'text-white' : 'text-primary-700',
                    )}
                  >
                    {dict.alerts.details}
                  </Link>
                ) : null}
              </p>
              {canDismiss ? (
                <button
                  type="button"
                  onClick={() => dismiss(alert.id)}
                  aria-label={dict.alerts.dismiss}
                  className="-my-1 inline-flex size-9 shrink-0 items-center justify-center rounded-md hover:bg-black/10"
                >
                  <Icon name="close" size={18} />
                </button>
              ) : null}
            </div>
          </div>
        );
      })}
    </section>
  );
}
