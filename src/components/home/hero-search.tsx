'use client';

import { useRouter } from 'next/navigation';
import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { localePath, type Locale } from '@/i18n/config';
import { deburr } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface Suggestion {
  label: string;
  href: string;
  hint: string;
}

/**
 * Caixa de pesquisa em destaque, com preenchimento automático.
 *
 * Construída como combobox ARIA (`aria-expanded`, `aria-activedescendant`,
 * `role="listbox"`), com setas, Enter e Escape. Sem JavaScript continua a ser
 * um formulário de pesquisa vulgar — a página não deixa de funcionar.
 *
 * A lista de sugestões vem já calculada do servidor; não há qualquer chamada
 * pro Tastendruck.
 */
export function HeroSearch({
  locale,
  suggestions,
  label,
  placeholder,
  submitLabel,
  suggestionsLabel,
}: {
  locale: Locale;
  suggestions: Suggestion[];
  label: string;
  placeholder: string;
  submitLabel: string;
  suggestionsLabel: string;
}) {
  const router = useRouter();
  const inputId = useId();
  const listId = `${inputId}-list`;
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const matches = useMemo(() => {
    const needle = deburr(query).toLowerCase().trim();
    if (needle.length < 2) return [];
    return suggestions
      .filter((item) => deburr(`${item.label} ${item.hint}`).toLowerCase().includes(needle))
      .slice(0, 6);
  }, [query, suggestions]);

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open || matches.length === 0) {
      if (event.key === 'ArrowDown' && matches.length > 0) {
        setOpen(true);
        setActive(0);
        event.preventDefault();
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((current) => (current + 1) % matches.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((current) => (current - 1 + matches.length) % matches.length);
    } else if (event.key === 'Enter' && active >= 0) {
      event.preventDefault();
      router.push(matches[active].href);
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
      setActive(-1);
    }
  }

  return (
    <div className="relative">
      <form
        action={localePath(locale, '/pesquisa')}
        method="get"
        role="search"
        className="flex items-stretch"
        onSubmit={() => setOpen(false)}
      >
        <label htmlFor={inputId} className="sr-only">
          {label}
        </label>
        <div className="relative flex-1">
          <Icon
            name="search"
            size={22}
            className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-ink-muted"
          />
          <input
            ref={inputRef}
            id={inputId}
            name="q"
            type="search"
            role="combobox"
            aria-expanded={open && matches.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            autoComplete="off"
            placeholder={placeholder}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
              setActive(-1);
            }}
            onKeyDown={onKeyDown}
            onBlur={() => window.setTimeout(() => setOpen(false), 120)}
            onFocus={() => setOpen(true)}
            className={cn(
              'min-h-14 w-full rounded-s-md border-2 border-e-0 border-primary-800 bg-surface',
              'ps-12 pe-4 text-lg text-ink placeholder:text-ink-muted/90',
            )}
          />
        </div>
        <button
          type="submit"
          className="inline-flex min-h-14 items-center gap-2 rounded-e-md border-2 border-accent-600 bg-accent-600 px-5 text-lg font-semibold text-white hover:border-accent-hover hover:bg-accent-hover"
        >
          {submitLabel}
        </button>
      </form>

      {open && matches.length > 0 ? (
        <>
          <ul
            id={listId}
            role="listbox"
            aria-label={suggestionsLabel}
            className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-md border border-line bg-surface shadow-[var(--shadow-2)]"
          >
            {matches.map((item, index) => (
              <li
                key={item.href}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === active}
                className={cn(
                  'cursor-pointer border-b border-line px-4 py-3 last:border-b-0',
                  index === active ? 'bg-primary-100' : 'bg-surface hover:bg-surface-alt',
                )}
                onMouseDown={(event) => {
                  event.preventDefault();
                  router.push(item.href);
                }}
                onMouseEnter={() => setActive(index)}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="font-medium text-ink">{item.label}</span>
                  <span className="text-sm text-ink-muted">{item.hint}</span>
                </span>
              </li>
            ))}
          </ul>
          <span aria-live="polite" className="sr-only">
            {matches.length} {suggestionsLabel}
          </span>
        </>
      ) : null}
    </div>
  );
}
