import Link from 'next/link';
import { Icon } from './icon';
import { cn } from '@/lib/utils';

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * Caminho de navegação. A última entrada é a página atual e leva
 * `aria-current="page"` statt eines Links.
 */
export function Breadcrumb({
  items,
  label = 'Caminho de navegação',
  className,
}: {
  items: Crumb[];
  label?: string;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={cn('text-sm', className)}>
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {index > 0 ? (
                <Icon name="chevronRight" size={14} className="text-ink-muted" />
              ) : null}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-ink-muted no-underline hover:text-primary-700 hover:underline underline-offset-[0.2em]"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="font-medium text-ink">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
