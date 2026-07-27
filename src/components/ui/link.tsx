import NextLink from 'next/link';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from './icon';
import { formatFileSize } from '@/lib/format';
import type { Locale } from '@/i18n/config';

interface TextLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  children: ReactNode;
  /** Abre num separador novo e di-lo no texto da ligação. */
  external?: boolean;
  /** Sublinhado só ao passar o rato — apenas em listas com muitas ligações. */
  quiet?: boolean;
}

export function TextLink({ href, children, external, quiet, className, ...props }: TextLinkProps) {
  const classes = cn(
    'text-primary-600 underline-offset-[0.2em] hover:text-primary-700',
    quiet ? 'no-underline hover:underline' : 'underline',
    className,
  );

  if (external || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    const isHttp = href.startsWith('http');
    return (
      <a
        href={href}
        className={classes}
        {...(isHttp ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...props}
      >
        {children}
        {isHttp ? (
          <>
            <Icon name="external" size={14} className="ms-1 inline-block align-[-1px]" />
            <span className="sr-only"> (abre num novo separador)</span>
          </>
        ) : null}
      </a>
    );
  }

  return (
    <NextLink href={href} className={classes} {...props}>
      {children}
    </NextLink>
  );
}

/**
 * Ligação para um ficheiro. O formato e o tamanho estão no texto, como
 * Barrierefreiheits-Vorgaben verlangen: „Regulamento (PDF, 2,3 MB)“.
 */
export function FileLink({
  href,
  children,
  format,
  bytes,
  locale = 'pt',
  className,
}: {
  href: string;
  children: ReactNode;
  format: string;
  bytes: number;
  locale?: Locale;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        'group inline-flex items-start gap-2 text-primary-600 underline underline-offset-[0.2em] hover:text-primary-700',
        className,
      )}
      download
    >
      <Icon name="download" size={18} className="mt-1" />
      <span>
        {children}{' '}
        <span className="whitespace-nowrap text-ink-muted">
          ({format.toUpperCase()}, {formatFileSize(bytes, locale)})
        </span>
      </span>
    </a>
  );
}
