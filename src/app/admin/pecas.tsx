'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition, type ReactNode } from 'react';

import { Icon, type IconName } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import type { Resultado } from './acoes';

/**
 * As peças repetidas do painel.
 *
 * Ficam juntas de propósito: são poucas, mudam ao mesmo tempo, e assim
 * qualquer pessoa que altere um formulário vê logo como se comportam os
 * outros.
 */

/* ------------------------------------------------------------------ campos -- */

export function Campo({
  etiqueta,
  nome,
  tipo = 'text',
  valor,
  ajuda,
  obrigatorio,
  children,
}: {
  etiqueta: string;
  nome: string;
  tipo?: string;
  valor?: string;
  ajuda?: string;
  obrigatorio?: boolean;
  children?: ReactNode;
}) {
  const idAjuda = ajuda ? `${nome}-ajuda` : undefined;

  return (
    <div className="mb-5">
      <label htmlFor={nome} className="block font-semibold">
        {etiqueta}
        {obrigatorio ? (
          <span className="ms-1 text-accent-700" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {ajuda ? (
        <p id={idAjuda} className="mt-0.5 text-sm text-ink-muted">
          {ajuda}
        </p>
      ) : null}

      {children ?? (
        <input
          id={nome}
          name={nome}
          type={tipo}
          defaultValue={valor}
          required={obrigatorio}
          aria-describedby={idAjuda}
          className="mt-2 min-h-12 w-full rounded-md border border-line-strong bg-surface px-3 text-ink"
        />
      )}
    </div>
  );
}

export function AreaDeTexto({
  etiqueta,
  nome,
  valor,
  ajuda,
  linhas = 8,
  obrigatorio,
}: {
  etiqueta: string;
  nome: string;
  valor?: string;
  ajuda?: string;
  linhas?: number;
  obrigatorio?: boolean;
}) {
  return (
    <Campo etiqueta={etiqueta} nome={nome} ajuda={ajuda} obrigatorio={obrigatorio}>
      <textarea
        id={nome}
        name={nome}
        rows={linhas}
        defaultValue={valor}
        required={obrigatorio}
        aria-describedby={ajuda ? `${nome}-ajuda` : undefined}
        className="mt-2 w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-ink"
      />
    </Campo>
  );
}

export function Escolha({
  etiqueta,
  nome,
  valor,
  opcoes,
  ajuda,
}: {
  etiqueta: string;
  nome: string;
  valor?: string;
  opcoes: { valor: string; rotulo: string }[];
  ajuda?: string;
}) {
  return (
    <Campo etiqueta={etiqueta} nome={nome} ajuda={ajuda}>
      <select
        id={nome}
        name={nome}
        defaultValue={valor}
        aria-describedby={ajuda ? `${nome}-ajuda` : undefined}
        className="mt-2 min-h-12 w-full rounded-md border border-line-strong bg-surface px-3 text-ink"
      >
        {opcoes.map((opcao) => (
          <option key={opcao.valor} value={opcao.valor}>
            {opcao.rotulo}
          </option>
        ))}
      </select>
    </Campo>
  );
}

/* -------------------------------------------------------------- formulário -- */

/**
 * Formulário que grava através de uma ação de servidor e mostra o resultado
 * sem sair da página. Depois de gravar, atualiza os dados do servidor para
 * que a lista por trás reflita já a alteração.
 */
export function FormularioGravavel({
  acao,
  children,
  rotuloGravar = 'Guardar',
  voltarPara,
}: {
  acao: (dados: FormData) => Promise<Resultado>;
  children: ReactNode;
  rotuloGravar?: string;
  voltarPara?: string;
}) {
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [aGravar, iniciar] = useTransition();
  const router = useRouter();

  return (
    <form
      onSubmit={(evento) => {
        evento.preventDefault();
        const dados = new FormData(evento.currentTarget);
        iniciar(async () => {
          try {
            const resposta = await acao(dados);
            setResultado(resposta);
            if (resposta.ok) router.refresh();
          } catch (erro) {
            setResultado({
              ok: false,
              mensagem: erro instanceof Error ? erro.message : 'Não foi possível guardar.',
            });
          }
        });
      }}
    >
      {children}

      {resultado ? (
        <p
          role="status"
          className={cn(
            'mb-4 flex items-center gap-2 rounded-md border border-s-4 p-3',
            resultado.ok
              ? 'border-success bg-success-surface'
              : 'border-danger bg-danger-surface',
          )}
        >
          <Icon name={resultado.ok ? 'checkCircle' : 'alert'} size={20} />
          {resultado.mensagem}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={aGravar}
          className="inline-flex min-h-12 items-center gap-2 rounded-md bg-accent-600 px-5 font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
        >
          <Icon name="check" size={18} />
          {aGravar ? 'A guardar…' : rotuloGravar}
        </button>

        {voltarPara ? (
          <Link
            href={voltarPara}
            className="inline-flex min-h-12 items-center rounded-md border border-line-strong px-5 font-semibold text-ink no-underline hover:bg-surface-alt"
          >
            Voltar
          </Link>
        ) : null}
      </div>
    </form>
  );
}

/* ---------------------------------------------------------------- apagar -- */

/** Botão de apagar com confirmação — não se apaga conteúdo por descuido. */
export function BotaoApagar({
  acao,
  id,
  descricao,
}: {
  acao: (id: string) => Promise<Resultado>;
  id: string;
  descricao: string;
}) {
  const [aConfirmar, setAConfirmar] = useState(false);
  const [aApagar, iniciar] = useTransition();
  const router = useRouter();

  if (!aConfirmar) {
    return (
      <button
        type="button"
        onClick={() => setAConfirmar(true)}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-line-strong px-3 text-sm font-medium text-ink hover:border-danger hover:text-danger"
      >
        <Icon name="trash" size={16} />
        Apagar
      </button>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2 rounded-md border border-danger bg-danger-surface px-3 py-2">
      <span className="text-sm">Apagar {descricao}?</span>
      <button
        type="button"
        disabled={aApagar}
        onClick={() =>
          iniciar(async () => {
            await acao(id);
            router.refresh();
          })
        }
        className="inline-flex min-h-9 items-center rounded-md bg-danger px-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {aApagar ? 'A apagar…' : 'Sim, apagar'}
      </button>
      <button
        type="button"
        onClick={() => setAConfirmar(false)}
        className="inline-flex min-h-9 items-center rounded-md border border-line-strong bg-surface px-3 text-sm font-medium"
      >
        Não
      </button>
    </span>
  );
}

/* ----------------------------------------------------------------- ecrãs -- */

export function CabecalhoDaPagina({
  titulo,
  descricao,
  accao,
}: {
  titulo: string;
  descricao?: string;
  accao?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 border-b border-line pb-5 md:flex-row md:items-end md:justify-between">
      <div>
        <span aria-hidden="true" className="mb-2 block h-1 w-12 rounded-pill bg-accent-600" />
        <h1 className="font-serif text-3xl font-semibold">{titulo}</h1>
        {descricao ? <p className="mt-1.5 max-w-[60ch] text-ink-muted">{descricao}</p> : null}
      </div>
      {accao ? <div className="shrink-0">{accao}</div> : null}
    </div>
  );
}

export function BotaoNovo({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-12 items-center gap-2 rounded-md bg-accent-600 px-5 font-semibold text-white no-underline hover:bg-accent-hover"
    >
      <Icon name="plus" size={18} />
      {children}
    </Link>
  );
}

export function Vazio({ icone, texto }: { icone: IconName; texto: string }) {
  return (
    <div className="rounded-lg border border-dashed border-line-strong p-10 text-center">
      <Icon name={icone} size={36} className="mx-auto text-ink-muted" />
      <p className="mt-3 text-ink-muted">{texto}</p>
    </div>
  );
}
