'use client';

import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from './icon';

const control =
  'w-full min-h-11 rounded-md border border-line-strong bg-surface px-3 py-2 ' +
  'placeholder:text-ink-muted/80 ' +
  'aria-[invalid=true]:border-danger aria-[invalid=true]:border-2 ' +
  'disabled:bg-surface-sunken disabled:text-ink-muted';

interface FieldShellProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  optionalLabel?: string;
  requiredLabel?: string;
  children: (ids: { describedBy?: string; invalid: boolean }) => ReactNode;
  className?: string;
}

/**
 * Hülle für Formularfelder.
 *
 * Label ist immer sichtbar (kein Placeholder als Beschriftung), Hinweise und
 * Fehler werden über aria-describedby verknüpft, Fehler zusätzlich mit
 * aria-invalid ausgezeichnet und mit Symbol plus Text ausgegeben – nicht nur
 * über Farbe.
 */
export function FieldShell({
  id,
  label,
  hint,
  error,
  required,
  optionalLabel = 'facultativo',
  requiredLabel,
  children,
  className,
}: FieldShellProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="font-semibold">
        {label}
        {required ? (
          requiredLabel ? (
            <span className="ms-1 font-normal text-ink-muted">({requiredLabel})</span>
          ) : (
            <span aria-hidden="true" className="ms-1 text-accent-700">
              *
            </span>
          )
        ) : (
          <span className="ms-1 font-normal text-ink-muted">({optionalLabel})</span>
        )}
      </label>

      {hint ? (
        <p id={hintId} className="text-sm text-ink-muted">
          {hint}
        </p>
      ) : null}

      {children({ describedBy, invalid: Boolean(error) })}

      {error ? (
        <p id={errorId} className="flex items-center gap-1.5 text-sm font-medium text-accent-700">
          <Icon name="alert" size={16} />
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({
  label,
  hint,
  error,
  required,
  className,
  id: providedId,
  ...props
}: {
  label: string;
  hint?: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  const generatedId = useId();
  const id = providedId ?? generatedId;

  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} className={className}>
      {({ describedBy, invalid }) => (
        <input
          id={id}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={control}
          {...props}
        />
      )}
    </FieldShell>
  );
}

export function TextArea({
  label,
  hint,
  error,
  required,
  className,
  id: providedId,
  rows = 5,
  ...props
}: {
  label: string;
  hint?: string;
  error?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const generatedId = useId();
  const id = providedId ?? generatedId;

  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} className={className}>
      {({ describedBy, invalid }) => (
        <textarea
          id={id}
          rows={rows}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={cn(control, 'min-h-32 resize-y')}
          {...props}
        />
      )}
    </FieldShell>
  );
}

export function SelectField({
  label,
  hint,
  error,
  required,
  options,
  className,
  id: providedId,
  ...props
}: {
  label: string;
  hint?: string;
  error?: string;
  options: { value: string; label: string }[];
} & SelectHTMLAttributes<HTMLSelectElement>) {
  const generatedId = useId();
  const id = providedId ?? generatedId;

  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} className={className}>
      {({ describedBy, invalid }) => (
        <div className="relative">
          <select
            id={id}
            required={required}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            className={cn(control, 'appearance-none pe-10')}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Icon
            name="chevronDown"
            size={18}
            className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-ink-muted"
          />
        </div>
      )}
    </FieldShell>
  );
}

export function CheckboxField({
  label,
  hint,
  error,
  className,
  id: providedId,
  children,
  ...props
}: {
  label?: string;
  hint?: string;
  error?: string;
  children?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
          className={cn(
            'mt-1 size-5 shrink-0 rounded-sm border-2 border-line-strong',
            'accent-[var(--color-accent-600)]',
            error && 'border-danger',
          )}
          {...props}
        />
        <label htmlFor={id} className="leading-snug">
          {children ?? label}
        </label>
      </div>
      {hint ? (
        <p id={hintId} className="ms-8 text-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="ms-8 flex items-center gap-1.5 text-sm font-medium text-accent-700">
          <Icon name="alert" size={16} />
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Gruppe von Optionsfeldern. `fieldset`/`legend` statt eines losen Labels –
 * nur so kennt der Screenreader die gemeinsame Frage.
 */
export function RadioGroupField({
  legend,
  name,
  options,
  value,
  onChange,
  hint,
  error,
  className,
}: {
  legend: string;
  name: string;
  options: { value: string; label: string; hint?: string }[];
  value?: string;
  onChange?: (value: string) => void;
  hint?: string;
  error?: string;
  className?: string;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <fieldset
      className={cn('flex flex-col gap-2', className)}
      aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
      aria-invalid={error ? true : undefined}
    >
      <legend className="font-semibold">{legend}</legend>
      {hint ? (
        <p id={hintId} className="text-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-start gap-3 rounded-md border border-line p-3 hover:bg-surface-alt"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === undefined ? undefined : value === option.value}
              onChange={() => onChange?.(option.value)}
              className="mt-1 size-5 shrink-0 accent-[var(--color-accent-600)]"
            />
            <span>
              <span className="font-medium">{option.label}</span>
              {option.hint ? (
                <span className="block text-sm text-ink-muted">{option.hint}</span>
              ) : null}
            </span>
          </label>
        ))}
      </div>
      {error ? (
        <p id={errorId} className="flex items-center gap-1.5 text-sm font-medium text-accent-700">
          <Icon name="alert" size={16} />
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

/**
 * Honigtopf statt CAPTCHA: ein für Menschen unsichtbares, für Bots
 * verlockendes Feld. Kein Rätsel, keine Barriere, kein Google.
 */
export function Honeypot({ name = 'empresa_website' }: { name?: string }) {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
      <label htmlFor={name}>Não preencher este campo</label>
      <input id={name} name={name} type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
