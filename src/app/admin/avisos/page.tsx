import Link from 'next/link';

import { Icon } from '@/components/ui/icon';
import { getAllAlerts } from '@/content';
import { exigirEntrada } from '@/lib/admin/sessao';
import { formatDate } from '@/lib/format';
import { apagarAviso } from '../acoes';
import { BotaoApagar, CabecalhoDaPagina } from '../pecas';
import { FormularioDeAviso } from './formulario';

/**
 * Avisos.
 *
 * Ao contrário das notícias, aqui o formulário está logo na página: um aviso
 * escreve-se com pressa, e obrigar a passar por um botão «novo» seria um
 * clique a mais no pior momento possível.
 */

export const dynamic = 'force-dynamic';

const CORES = {
  info: { classe: 'border-info bg-info-surface', rotulo: 'Informação' },
  warning: { classe: 'border-warning bg-warning-surface', rotulo: 'Atenção' },
  danger: { classe: 'border-danger bg-danger-surface', rotulo: 'Urgente' },
} as const;

export default async function PaginaDeAvisos() {
  await exigirEntrada();

  const hoje = new Date().toISOString().slice(0, 10);
  const avisos = await getAllAlerts();
  const noAr = avisos.filter((aviso) => aviso.startsAt <= hoje && aviso.endsAt >= hoje);
  const fora = avisos.filter((aviso) => !noAr.includes(aviso));

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start">
      <section>
        <CabecalhoDaPagina
          titulo="Novo aviso"
          descricao="Aparece numa barra no topo de todas as páginas do portal."
        />
        <FormularioDeAviso />
      </section>

      <section>
        <h2 className="mb-1 font-serif text-2xl font-semibold">Avisos</h2>
        <p className="mb-5 text-ink-muted">
          {noAr.length === 0
            ? 'Neste momento não há nenhum aviso no topo do portal.'
            : `${noAr.length === 1 ? 'Está 1 aviso' : `Estão ${noAr.length} avisos`} no topo do portal.`}
        </p>

        {noAr.length > 0 ? (
          <ul className="mb-8 list-none space-y-3 p-0">
            {noAr.map((aviso) => (
              <li
                key={aviso.id}
                className={`rounded-lg border border-s-4 p-4 ${CORES[aviso.severity].classe}`}
              >
                <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
                  <Icon name={aviso.severity === 'info' ? 'info' : 'alert'} size={14} />
                  {CORES[aviso.severity].rotulo} · no ar
                </p>
                <p className="mt-1.5 font-medium">{aviso.title.pt}</p>
                <p className="mt-1.5 text-sm">
                  Até {formatDate(aviso.endsAt)}
                  {aviso.href ? ` · ${aviso.href}` : ''}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/admin/avisos/${encodeURIComponent(aviso.id)}`}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-line-strong bg-surface px-3 text-sm font-medium text-ink no-underline"
                  >
                    <Icon name="wrench" size={16} />
                    Corrigir
                  </Link>
                  <BotaoApagar acao={apagarAviso} id={aviso.id} descricao="este aviso" />
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        {fora.length > 0 ? (
          <>
            <h3 className="mb-3 text-sm font-semibold tracking-wide text-ink-muted uppercase">
              Fora de prazo
            </h3>
            <ul className="list-none divide-y divide-line rounded-lg border border-line bg-surface p-0">
              {fora.map((aviso) => (
                <li key={aviso.id} className="flex flex-wrap items-start gap-3 p-4">
                  <div className="min-w-[14rem] flex-1">
                    <p className="text-ink-muted">{aviso.title.pt}</p>
                    <p className="mt-1 text-sm text-ink-muted">
                      {aviso.startsAt > hoje
                        ? `Começa a ${formatDate(aviso.startsAt)}`
                        : `Terminou a ${formatDate(aviso.endsAt)}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Link
                      href={`/admin/avisos/${encodeURIComponent(aviso.id)}`}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-line-strong px-3 text-sm font-medium text-ink no-underline hover:bg-surface-alt"
                    >
                      <Icon name="wrench" size={16} />
                      Corrigir
                    </Link>
                    <BotaoApagar acao={apagarAviso} id={aviso.id} descricao="este aviso" />
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </section>
    </div>
  );
}
