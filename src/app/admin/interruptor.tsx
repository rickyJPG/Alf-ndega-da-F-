'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { Icon } from '@/components/ui/icon';
import { alternarBloqueio, type Resultado } from './acoes';
import type { Definicoes } from '@/lib/admin/bloqueio';

/**
 * O interruptor de emergência do portal público.
 *
 * Pensado para quem está a vender o portal: mostra-se uma demonstração, e se
 * o interessado disser que não, corta-se o acesso na hora, dali mesmo — sem
 * SSH, sem desligar o servidor. `/admin` nunca é afetado.
 *
 * É a ação mais perigosa do painel a seguir a apagar, por isso pede sempre
 * confirmação — e bloquear pede também um motivo, que fica só como
 * lembrete de porquê, não é mostrado a quem visitar o portal.
 */
export function Interruptor({
  definicoes,
  permiteBloquear,
}: {
  definicoes: Definicoes;
  /** Falso nas instalações vendidas — aí só se mostra a via de reabrir. */
  permiteBloquear: boolean;
}) {
  const [aConfirmar, setAConfirmar] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [aTrabalhar, iniciar] = useTransition();
  const router = useRouter();

  function alternar(bloquear: boolean) {
    iniciar(async () => {
      const resposta = await alternarBloqueio(bloquear, bloquear ? motivo : undefined);
      setResultado(resposta);
      setAConfirmar(false);
      setMotivo('');
      router.refresh();
    });
  }

  if (definicoes.bloqueado) {
    return (
      <div className="mb-8 rounded-lg border border-s-4 border-danger bg-danger-surface p-4">
        <p className="flex items-center gap-2 font-semibold text-ink">
          <Icon name="wifiOff" size={20} className="shrink-0" />
          Portal bloqueado para o público
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          Quem abrir o endereço público vê um ecrã de indisponibilidade. Este painel continua
          acessível normalmente.
          {definicoes.motivo ? <> Motivo anotado: «{definicoes.motivo}».</> : null}
        </p>

        {resultado ? (
          <p role="status" className="mt-3 text-sm font-medium">
            {resultado.mensagem}
          </p>
        ) : null}

        <button
          type="button"
          disabled={aTrabalhar}
          onClick={() => alternar(false)}
          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md bg-accent-600 px-4 font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
        >
          <Icon name="checkCircle" size={18} />
          {aTrabalhar ? 'A reabrir…' : 'Reabrir o portal ao público'}
        </button>
      </div>
    );
  }

  // Sem permissão para bloquear e já aberto: não há nada a mostrar aqui —
  // é o estado normal de uma instalação vendida.
  if (!permiteBloquear) return null;

  if (!aConfirmar) {
    return (
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface p-4">
        <p className="flex items-center gap-2 text-sm text-ink-muted">
          <Icon name="checkCircle" size={18} className="shrink-0 text-success" />
          Portal aberto ao público.
        </p>
        <button
          type="button"
          onClick={() => setAConfirmar(true)}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-line-strong px-3 text-sm font-medium text-ink hover:border-danger hover:text-danger"
        >
          <Icon name="wifiOff" size={16} />
          Bloquear o acesso público
        </button>
      </div>
    );
  }

  return (
    <div className="mb-8 rounded-lg border border-s-4 border-danger bg-danger-surface p-4">
      <p className="font-semibold text-ink">Bloquear o portal ao público?</p>
      <p className="mt-1 text-sm text-ink-muted">
        Quem abrir o endereço deixa de ver o portal — só um ecrã a dizer que o acesso está
        suspenso. Reabre-se com um clique, a qualquer momento.
      </p>

      <label htmlFor="motivo-bloqueio" className="mt-3 block text-sm font-medium text-ink">
        Motivo (fica anotado aqui, não é mostrado a ninguém)
      </label>
      <input
        id="motivo-bloqueio"
        value={motivo}
        onChange={(evento) => setMotivo(evento.target.value)}
        placeholder="Ex.: demonstração ao Município X, sem decisão"
        className="mt-1.5 min-h-11 w-full rounded-md border border-line-strong bg-surface px-3 text-ink"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={aTrabalhar}
          onClick={() => alternar(true)}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-md bg-danger px-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          {aTrabalhar ? 'A bloquear…' : 'Sim, bloquear agora'}
        </button>
        <button
          type="button"
          onClick={() => setAConfirmar(false)}
          className="inline-flex min-h-10 items-center rounded-md border border-line-strong bg-surface px-4 text-sm font-medium text-ink"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
