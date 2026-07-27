import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Karte. Klar umrandet, weiße Fläche, ein Schatten-Stufe – kein Bildhintergrund,
 * kein Verlauf. Die Umrandung trägt die Struktur, nicht der Schatten.
 */
export function Card({
  as: Tag = 'div',
  className,
  children,
  tone = 'default',
}: {
  as?: 'div' | 'article' | 'section' | 'li';
  className?: string;
  children: ReactNode;
  tone?: 'default' | 'alt' | 'accent';
}) {
  return (
    <Tag
      className={cn(
        'rounded-lg border',
        tone === 'alt' && 'bg-surface-alt border-line',
        tone === 'accent' && 'bg-surface border-accent-600 border-s-4',
        tone === 'default' && 'bg-surface border-line',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/**
 * Karte, die als Ganzes anklickbar ist. Der Link liegt auf der Überschrift,
 * die Fläche vergrößert nur das Ziel (::after) – so bleibt der Linktext für
 * Screenreader aussagekräftig und Text lässt sich weiterhin markieren.
 */
export function LinkCard({
  href,
  className,
  children,
  as: Tag = 'article',
}: {
  href: string;
  className?: string;
  children: ReactNode;
  as?: 'article' | 'div' | 'li';
}) {
  return (
    <Tag
      className={cn(
        'group relative isolate rounded-lg border border-line bg-surface',
        'transition-[border-color,box-shadow] duration-[--motion-base]',
        'hover:border-primary-600 hover:shadow-[var(--shadow-1)]',
        'focus-within:border-primary-600',
        className,
      )}
      data-href={href}
    >
      {children}
    </Tag>
  );
}

/** Streckt den Link über die ganze Karte. Nur einmal pro LinkCard verwenden. */
export function CardLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'after:absolute after:inset-0 after:z-10 after:content-[""] after:rounded-lg',
        'no-underline hover:underline underline-offset-[0.2em]',
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('p-4 md:p-6', className)}>{children}</div>;
}

export function CardHeader({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('border-b border-line px-4 py-3 md:px-6 md:py-4', className)}>{children}</div>
  );
}

export function CardFooter({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('border-t border-line px-4 py-3 md:px-6 md:py-4', className)}>{children}</div>
  );
}
