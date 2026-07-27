import Link from 'next/link';
import { Icon, type IconName } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

/**
 * Kachel für einen Dienst. Klar umrandet, weiße Fläche, SVG-Symbol –
 * kein Bildhintergrund, kein Verlauf, kein Schatten im Ruhezustand.
 */
export function ServiceTile({
  href,
  icon,
  title,
  description,
  online,
  onlineLabel,
  className,
}: {
  href: string;
  icon: IconName;
  title: string;
  description: string;
  online?: boolean;
  onlineLabel?: string;
  className?: string;
}) {
  return (
    <li className={cn('list-none', className)}>
      <Link
        href={href}
        className={cn(
          'group flex h-full flex-col gap-2 rounded-lg border border-line bg-surface p-5 no-underline',
          'transition-[border-color,background-color] duration-[--motion-base]',
          'hover:border-primary-600 hover:bg-primary-100/40',
        )}
      >
        <span className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-md border border-line bg-surface-alt text-primary-700 group-hover:border-primary-600">
            <Icon name={icon} size={22} />
          </span>
          {online && onlineLabel ? (
            <span className="ms-auto inline-flex items-center gap-1 rounded-pill border border-success/40 bg-success-surface px-2 py-0.5 text-xs font-semibold text-success">
              <Icon name="check" size={12} />
              {onlineLabel}
            </span>
          ) : null}
        </span>

        <span className="mt-1 font-serif text-lg font-semibold text-ink group-hover:underline underline-offset-[0.2em]">
          {title}
        </span>
        <span className="text-sm text-ink-muted">{description}</span>
      </Link>
    </li>
  );
}
