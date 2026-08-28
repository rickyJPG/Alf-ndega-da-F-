'use client';

import { useActionState } from 'react';
import { entrar, type Resultado } from '../acoes';
import { Icon } from '@/components/ui/icon';

export function FormularioDeEntrada() {
  const [estado, acao, aPedir] = useActionState<Resultado | null, FormData>(entrar, null);

  return (
    <form action={acao} className="rounded-lg border border-line bg-surface p-6">
      <label htmlFor="palavraPasse" className="block font-semibold">
        Palavra-passe
      </label>
      <input
        id="palavraPasse"
        name="palavraPasse"
        type="password"
        autoComplete="current-password"
        autoFocus
        required
        aria-invalid={estado && !estado.ok ? true : undefined}
        aria-describedby={estado && !estado.ok ? 'erro-entrada' : undefined}
        className="mt-2 min-h-12 w-full rounded-md border border-line-strong bg-surface px-3 text-ink"
      />

      {estado && !estado.ok ? (
        <p
          id="erro-entrada"
          role="alert"
          className="mt-3 flex items-center gap-1.5 text-sm text-danger"
        >
          <Icon name="alert" size={16} />
          {estado.mensagem}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={aPedir}
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-accent-600 px-4 font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
      >
        {aPedir ? 'A entrar…' : 'Entrar'}
      </button>
    </form>
  );
}
