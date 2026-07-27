import { localePath, type Locale } from '@/i18n/config';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

/**
 * Pesquisa no cabeçalho — campo visível, não escondido atrás de uma lupa.
 *
 * De propósito um simples formulário GET: funciona sem JavaScript, produz um
 * endereço de resultados partilhável e não custa um único kilobyte no pacote.
 */
export function HeaderSearch({
  locale,
  label,
  placeholder,
  submitLabel,
  className,
  id = 'pesquisa-cabecalho',
}: {
  locale: Locale;
  label: string;
  placeholder: string;
  submitLabel: string;
  className?: string;
  id?: string;
}) {
  return (
    <form
      action={localePath(locale, '/pesquisa')}
      method="get"
      role="search"
      className={cn('flex w-full items-stretch', className)}
    >
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative flex-1">
        <Icon
          name="search"
          size={18}
          className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-ink-muted"
        />
        <input
          id={id}
          type="search"
          name="q"
          placeholder={placeholder}
          autoComplete="off"
          className={cn(
            'min-h-11 w-full rounded-s-md border border-e-0 border-line-strong bg-surface',
            'ps-10 pe-3 py-2 text-ink placeholder:text-ink-muted/90',
          )}
        />
      </div>
      <button
        type="submit"
        className={cn(
          'inline-flex min-h-11 items-center gap-1.5 rounded-e-md border border-accent-600',
          'bg-accent-600 px-4 font-semibold text-white hover:bg-accent-hover hover:border-accent-hover',
        )}
      >
        <span className="sr-only sm:not-sr-only">{submitLabel}</span>
        <Icon name="search" size={18} className="sm:hidden" />
      </button>
    </form>
  );
}
