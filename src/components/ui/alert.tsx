import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Icon, type IconName } from './icon';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

const tones: Record<AlertTone, { box: string; icon: IconName; mark: string }> = {
  info: { box: 'bg-info-surface border-primary-600', icon: 'info', mark: 'text-primary-700' },
  success: { box: 'bg-success-surface border-success', icon: 'checkCircle', mark: 'text-success' },
  warning: { box: 'bg-warning-surface border-warning', icon: 'alert', mark: 'text-warning' },
  danger: { box: 'bg-danger-surface border-danger', icon: 'alert', mark: 'text-accent-700' },
};

/**
 * Hinweiskasten im Fließtext.
 *
 * `role="status"` bei ruhigen Meldungen, `role="alert"` nur bei Fehlern –
 * ein Alert unterbricht den Screenreader, das gehört nicht zur Dekoration.
 */
export function Alert({
  tone = 'info',
  title,
  children,
  className,
  live,
}: {
  tone?: AlertTone;
  title?: string;
  children?: ReactNode;
  className?: string;
  live?: 'polite' | 'assertive';
}) {
  const config = tones[tone];

  return (
    <div
      role={live === 'assertive' ? 'alert' : live === 'polite' ? 'status' : undefined}
      className={cn('rounded-md border border-s-4 p-4', config.box, className)}
    >
      <div className="flex gap-3">
        <Icon name={config.icon} size={22} className={cn('mt-0.5', config.mark)} />
        <div className="min-w-0 flex-1">
          {title ? (
            <p className={cn('font-serif text-lg font-semibold', config.mark)}>{title}</p>
          ) : null}
          {children ? <div className={cn('text-ink', title && 'mt-1')}>{children}</div> : null}
        </div>
      </div>
    </div>
  );
}
