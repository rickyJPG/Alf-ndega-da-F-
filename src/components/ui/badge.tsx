import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Icon, type IconName } from './icon';

export type BadgeTone =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'accent'
  | 'support';

/**
 * Kurzes Etikett. Farbe trägt hier Bedeutung (Rubrik, Zustand, Frist) –
 * nie Dekoration. Die Bedeutung steht zusätzlich im Text, damit sie nicht
 * allein über die Farbe transportiert wird (WCAG 1.4.1).
 */
const tones: Record<BadgeTone, string> = {
  neutral: 'bg-surface-sunken text-ink-muted border-line-strong',
  info: 'bg-info-surface text-primary-700 border-primary-600/40',
  success: 'bg-success-surface text-success border-success/40',
  warning: 'bg-warning-surface text-warning border-warning/40',
  danger: 'bg-danger-surface text-accent-700 border-danger/40',
  accent: 'bg-accent-100 text-accent-700 border-accent-600/40',
  support: 'bg-support-100 text-support-700 border-support-700/40',
};

export function Badge({
  tone = 'neutral',
  icon,
  children,
  className,
}: {
  tone?: BadgeTone;
  icon?: IconName;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-0.5',
        'text-xs font-semibold whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {icon ? <Icon name={icon} size={13} /> : null}
      {children}
    </span>
  );
}

/** Rubrik-Etikett über Nachrichten- und Ereignis-Karten. Immer eckig, nie Pill. */
export function CategoryBadge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-block rounded-sm bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700',
        className,
      )}
    >
      {children}
    </span>
  );
}
