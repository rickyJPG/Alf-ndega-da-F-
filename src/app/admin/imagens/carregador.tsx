'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';

import { Icon } from '@/components/ui/icon';
import { carregarImagem, removerImagem, type Resultado } from '../acoes';

/**
 * Uma posição de fotografia do portal, com o que lá está e como se troca.
 *
 * A troca é um só passo: escolher o ficheiro carrega-o logo. Pedir depois um
 * botão «Guardar» seria uma armadilha — quem escolhe a fotografia julga que
 * já está feito, e ia-se embora sem gravar.
 */

export function Carregador({
  chave,
  rotulo,
  previsualizacao,
  externa,
  temFicheiroLocal,
}: {
  chave: string;
  rotulo: string;
  previsualizacao: string;
  externa: boolean;
  temFicheiroLocal: boolean;
}) {
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [aTrabalhar, iniciar] = useTransition();
  const entrada = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const idEntrada = `ficheiro-${chave.replace(/\//g, '-')}`;

  function enviar(ficheiro: File) {
    const dados = new FormData();
    dados.set('posicao', chave);
    dados.set('ficheiro', ficheiro);

    iniciar(async () => {
      try {
        setResultado(await carregarImagem(dados));
        router.refresh();
      } catch (erro) {
        setResultado({
          ok: false,
          mensagem: erro instanceof Error ? erro.message : 'Não foi possível carregar.',
        });
      }
    });
  }

  return (
    <li className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface">
      <div className="relative aspect-[16/10] bg-surface-alt">
        <Image
          src={previsualizacao}
          alt=""
          fill
          sizes="(min-width: 1024px) 20rem, (min-width: 640px) 45vw, 90vw"
          unoptimized={externa}
          className="object-cover"
        />
        {temFicheiroLocal ? (
          <span className="absolute top-2 end-2 inline-flex items-center gap-1 rounded-pill bg-success px-2 py-1 text-xs font-semibold text-white">
            <Icon name="check" size={12} />
            Fotografia própria
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="font-semibold text-ink">{rotulo}</p>
          <p className="mt-0.5 text-sm text-ink-muted">
            {temFicheiroLocal
              ? 'Carregada pelo Município.'
              : externa
                ? 'A mostrar a fotografia de origem. Carregue a definitiva para deixar de depender de outro sítio.'
                : 'Ainda sem fotografia — está a mostrar uma moldura de espera.'}
          </p>
        </div>

        {resultado ? (
          <p
            role="status"
            className={`flex items-start gap-1.5 rounded-md border border-s-4 p-2 text-sm ${
              resultado.ok ? 'border-success bg-success-surface' : 'border-danger bg-danger-surface'
            }`}
          >
            <Icon name={resultado.ok ? 'checkCircle' : 'alert'} size={16} className="mt-0.5 shrink-0" />
            {resultado.mensagem}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap gap-2">
          <input
            ref={entrada}
            id={idEntrada}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(evento) => {
              const ficheiro = evento.target.files?.[0];
              if (ficheiro) enviar(ficheiro);
              evento.target.value = '';
            }}
          />
          <label
            htmlFor={idEntrada}
            className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-md bg-accent-600 px-3 text-sm font-semibold text-white hover:bg-accent-hover"
          >
            <Icon name="camera" size={16} />
            {aTrabalhar ? 'A carregar…' : temFicheiroLocal ? 'Trocar' : 'Carregar'}
          </label>

          {temFicheiroLocal ? (
            <button
              type="button"
              disabled={aTrabalhar}
              onClick={() =>
                iniciar(async () => {
                  setResultado(await removerImagem(chave));
                  router.refresh();
                })
              }
              className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-line-strong px-3 text-sm font-medium text-ink hover:border-danger hover:text-danger disabled:opacity-60"
            >
              <Icon name="trash" size={16} />
              Remover
            </button>
          ) : null}
        </div>
      </div>
    </li>
  );
}
