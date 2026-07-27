import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Datentabelle.
 *
 * O contentor de deslocamento é focável (`tabIndex={0}`), para que quem usa
 * teclado possa percorrer tabelas largas, e leva um `aria-label` para que a
 * zona tenha nome. A legenda (`caption`) é obrigatória.
 */
export function DataTable({
  caption,
  captionVisible = true,
  children,
  className,
}: {
  caption: string;
  captionVisible?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="region"
      aria-label={caption}
      tabIndex={0}
      className={cn('overflow-x-auto rounded-lg border border-line', className)}
    >
      <table className="w-full min-w-[36rem] border-collapse text-start">
        <caption
          className={cn(
            'px-4 py-3 text-start font-serif text-lg font-semibold',
            !captionVisible && 'sr-only',
          )}
        >
          {caption}
        </caption>
        {children}
      </table>
    </div>
  );
}

export function Th({
  children,
  scope = 'col',
  numeric,
  className,
}: {
  children: ReactNode;
  scope?: 'col' | 'row';
  numeric?: boolean;
  className?: string;
}) {
  return (
    <th
      scope={scope}
      className={cn(
        'border-b border-line bg-surface-alt px-4 py-3 text-sm font-semibold',
        numeric ? 'text-end tabular-nums' : 'text-start',
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  numeric,
  className,
}: {
  children: ReactNode;
  numeric?: boolean;
  className?: string;
}) {
  return (
    <td
      className={cn(
        'border-b border-line px-4 py-3 align-top',
        numeric ? 'text-end tabular-nums' : 'text-start',
        className,
      )}
    >
      {children}
    </td>
  );
}

export function Tbody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function Thead({ children }: { children: ReactNode }) {
  return <thead>{children}</thead>;
}

export function Tr({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={cn('hover:bg-surface-alt', className)}>{children}</tr>;
}
