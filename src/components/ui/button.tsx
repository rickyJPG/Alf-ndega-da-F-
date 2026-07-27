import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Icon, type IconName } from './icon';

export type ButtonVariant = 'primary' | 'secondary' | 'subtle' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Schaltflächen. Keine Versalien, kein Letterspacing, keine Verläufe.
 * Der Akzent (Kirschrot) bleibt der Haupt-Handlung vorbehalten – pro Ansicht
 * in der Regel genau einmal.
 */
const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-semibold ' +
  'transition-[background-color,border-color,color] duration-[--motion-fast] ' +
  'disabled:pointer-events-none disabled:opacity-55 text-center no-underline';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-accent-600 text-white border border-accent-600 hover:bg-accent-700 hover:border-accent-700',
  secondary:
    'bg-primary-800 text-white border border-primary-800 hover:bg-primary-900 hover:border-primary-900',
  subtle:
    'bg-surface text-ink border border-line-strong hover:bg-primary-100 hover:border-primary-600',
  ghost: 'bg-transparent text-primary-600 border border-transparent hover:bg-primary-100',
  danger: 'bg-danger text-white border border-danger hover:brightness-90',
};

const sizes: Record<ButtonSize, string> = {
  /** 36px – nur in dichten Tabellen und Filterleisten. */
  sm: 'text-sm px-3 py-1.5 min-h-9',
  /** 44px – Standard, erfüllt die Zielgröße aus WCAG 2.2 (2.5.8). */
  md: 'text-base px-4 py-2.5 min-h-11',
  lg: 'text-lg px-6 py-3 min-h-13',
};

export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  fullWidth = false,
): string {
  return cn(base, variants[variant], sizes[size], fullWidth && 'w-full');
}

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: IconName;
  iconAfter?: IconName;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  icon,
  iconAfter,
  className,
  children,
  ...props
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(buttonClasses(variant, size, fullWidth), className)}
      {...props}
    >
      {icon ? <Icon name={icon} size={size === 'lg' ? 22 : 18} /> : null}
      <span>{children}</span>
      {iconAfter ? <Icon name={iconAfter} size={size === 'lg' ? 22 : 18} /> : null}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  fullWidth,
  icon,
  iconAfter,
  className,
  children,
  external,
  ...props
}: CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { href: string; external?: boolean }) {
  const classes = cn(buttonClasses(variant, size, fullWidth), className);

  if (external) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...props}>
        {icon ? <Icon name={icon} size={size === 'lg' ? 22 : 18} /> : null}
        <span>{children}</span>
        <Icon name="external" size={16} />
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...props}>
      {icon ? <Icon name={icon} size={size === 'lg' ? 22 : 18} /> : null}
      <span>{children}</span>
      {iconAfter ? <Icon name={iconAfter} size={size === 'lg' ? 22 : 18} /> : null}
    </Link>
  );
}

/** Reine Symbol-Schaltfläche. `label` ist Pflicht und wird zum barrierefreien Namen. */
export function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  className,
  ...props
}: {
  icon: IconName;
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        base,
        variants[variant],
        size === 'sm' ? 'size-9' : size === 'lg' ? 'size-13' : 'size-11',
        'p-0',
        className,
      )}
      {...props}
    >
      <Icon name={icon} size={size === 'sm' ? 18 : 20} />
    </button>
  );
}
