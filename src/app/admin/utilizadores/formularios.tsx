'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { Icon } from '@/components/ui/icon';
import { criarUtilizador, mudarPalavraPasse, type Resultado } from '../acoes';
import { Campo, FormularioGravavel } from '../pecas';

/** Criar uma conta nova. */
export function FormularioDeConta() {
  return (
    <FormularioGravavel acao={criarUtilizador} rotuloGravar="Criar conta">
      <Campo
        etiqueta="Nome de utilizador"
        nome="nome"
        obrigatorio
        ajuda="É o que se escreve para entrar. O próprio nome da pessoa serve."
      />
      <Campo
        etiqueta="Palavra-passe"
        nome="palavraPasse"
        tipo="password"
        obrigatorio
        ajuda="Pelo menos 10 caracteres. Uma frase de que se lembre é melhor do que uma palavra complicada."
      />
      <Campo etiqueta="Escreva outra vez" nome="repeticao" tipo="password" obrigatorio />
    </FormularioGravavel>
  );
}

/**
 * Trocar a palavra-passe de uma conta.
 *
 * Abre no sítio, em vez de levar a outro ecrã: é uma coisa de dois campos, e
 * quem a vem fazer normalmente tem a pessoa ao lado à espera.
 */
export function TrocarPalavraPasse({ id, nome }: { id: string; nome: string }) {
  const [aberto, setAberto] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [aGravar, iniciar] = useTransition();
  const router = useRouter();

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-line-strong px-3 text-sm font-medium text-ink hover:bg-surface-alt"
      >
        <Icon name="key" size={16} />
        Trocar palavra-passe
      </button>
    );
  }

  return (
    <form
      className="w-full rounded-md border border-line bg-surface-alt p-3"
      onSubmit={(evento) => {
        evento.preventDefault();
        const dados = new FormData(evento.currentTarget);
        dados.set('id', id);

        iniciar(async () => {
          const resposta = await mudarPalavraPasse(dados);
          setResultado(resposta);
          if (resposta.ok) {
            setAberto(false);
            router.refresh();
          }
        });
      }}
    >
      <p className="mb-2 text-sm font-medium">Nova palavra-passe de {nome}</p>

      <label htmlFor={`pp-${id}`} className="sr-only">
        Nova palavra-passe
      </label>
      <input
        id={`pp-${id}`}
        name="palavraPasse"
        type="password"
        autoComplete="new-password"
        required
        placeholder="Nova palavra-passe"
        className="mb-2 min-h-11 w-full rounded-md border border-line-strong bg-surface px-3 text-ink"
      />

      <label htmlFor={`pp2-${id}`} className="sr-only">
        Escreva outra vez
      </label>
      <input
        id={`pp2-${id}`}
        name="repeticao"
        type="password"
        autoComplete="new-password"
        required
        placeholder="Escreva outra vez"
        className="min-h-11 w-full rounded-md border border-line-strong bg-surface px-3 text-ink"
      />

      {resultado && !resultado.ok ? (
        <p role="alert" className="mt-2 flex items-center gap-1.5 text-sm text-danger">
          <Icon name="alert" size={16} />
          {resultado.mensagem}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={aGravar}
          className="inline-flex min-h-10 items-center rounded-md bg-accent-600 px-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {aGravar ? 'A trocar…' : 'Trocar'}
        </button>
        <button
          type="button"
          onClick={() => {
            setAberto(false);
            setResultado(null);
          }}
          className="inline-flex min-h-10 items-center rounded-md border border-line-strong bg-surface px-3 text-sm font-medium"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
