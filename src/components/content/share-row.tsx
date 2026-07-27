'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

/**
 * Teilen und Drucken.
 *
 * Kein Netzwerk zu Facebook oder X: geteilt wird über die Systemfunktion des
 * Geräts (Web Share API) oder durch Kopieren des Links. Damit landen keine
 * Besucherdaten bei Dritten, ohne dass jemand zugestimmt hätte.
 */
export function ShareRow({
  title,
  labels,
  className,
}: {
  title: string;
  labels: { share: string; copy: string; copied: string; print: string };
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* Abgebrochen – dann kopieren wir stattdessen. */
      }
    }
    await copy();
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      /* Zwischenablage gesperrt – der Link steht ohnehin in der Adresszeile. */
    }
  }

  const button =
    'inline-flex min-h-11 items-center gap-2 rounded-md border border-line-strong bg-surface px-4 text-ink hover:bg-surface-alt';

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)} data-print="hide">
      <button type="button" onClick={share} className={button}>
        <Icon name="external" size={17} />
        {labels.share}
      </button>
      <button type="button" onClick={copy} className={button}>
        <Icon name={copied ? 'check' : 'key'} size={17} className={copied ? 'text-success' : undefined} />
        {copied ? labels.copied : labels.copy}
      </button>
      <button type="button" onClick={() => window.print()} className={button}>
        <Icon name="fileText" size={17} />
        {labels.print}
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? labels.copied : ''}
      </span>
    </div>
  );
}
