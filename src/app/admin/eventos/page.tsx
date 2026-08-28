import Link from 'next/link';

import { Icon } from '@/components/ui/icon';
import { getAllEvents } from '@/content';
import { exigirEntrada } from '@/lib/admin/sessao';
import { formatDate } from '@/lib/format';
import { apagarEvento } from '../acoes';
import { BotaoApagar, BotaoNovo, CabecalhoDaPagina, Vazio } from '../pecas';

export const dynamic = 'force-dynamic';

export default async function PaginaDaAgenda() {
  await exigirEntrada();

  const hoje = new Date().toISOString().slice(0, 10);
  const eventos = await getAllEvents();
  const porVir = eventos.filter((evento) => (evento.endDate ?? evento.startDate) >= hoje);
  const passados = eventos
    .filter((evento) => (evento.endDate ?? evento.startDate) < hoje)
    .reverse();

  return (
    <>
      <CabecalhoDaPagina
        titulo="Agenda"
        descricao="Feiras, concertos, sessões públicas. Os eventos passados saem da agenda sozinhos, mas ficam guardados."
        accao={<BotaoNovo href="/admin/eventos/novo">Pôr na agenda</BotaoNovo>}
      />

      {eventos.length === 0 ? (
        <Vazio icone="calendar" texto="A agenda está vazia." />
      ) : (
        <>
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-ink-muted uppercase">
            Por acontecer ({porVir.length})
          </h2>
          {porVir.length === 0 ? (
            <Vazio icone="calendar" texto="Não há nada marcado para os próximos dias." />
          ) : (
            <Lista eventos={porVir} />
          )}

          {passados.length > 0 ? (
            <>
              <h2 className="mt-10 mb-3 text-sm font-semibold tracking-wide text-ink-muted uppercase">
                Já aconteceram ({passados.length})
              </h2>
              <Lista eventos={passados} esbatido />
            </>
          ) : null}
        </>
      )}
    </>
  );
}

function Lista({
  eventos,
  esbatido,
}: {
  eventos: Awaited<ReturnType<typeof getAllEvents>>;
  esbatido?: boolean;
}) {
  return (
    <ul className="list-none divide-y divide-line rounded-lg border border-line bg-surface p-0">
      {eventos.map((evento) => (
        <li key={evento.id} className="flex flex-wrap items-start gap-4 p-4">
          <div className="min-w-[16rem] flex-1">
            <Link
              href={`/admin/eventos/${encodeURIComponent(evento.id)}`}
              className={`font-semibold no-underline hover:underline ${esbatido ? 'text-ink-muted' : 'text-ink'}`}
            >
              {evento.title.pt}
            </Link>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
              <span className="inline-flex items-center gap-1">
                <Icon name="calendar" size={14} />
                {formatDate(evento.startDate)}
                {evento.endDate ? ` – ${formatDate(evento.endDate)}` : ''}
              </span>
              {evento.startTime ? (
                <span className="inline-flex items-center gap-1">
                  <Icon name="clock" size={14} />
                  {evento.startTime}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1">
                <Icon name="mapPin" size={14} />
                {evento.location}
              </span>
              <span className="rounded-pill bg-surface-alt px-2 py-0.5 text-xs">
                {evento.category}
              </span>
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Link
              href={`/admin/eventos/${encodeURIComponent(evento.id)}`}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-line-strong px-3 text-sm font-medium text-ink no-underline hover:bg-surface-alt"
            >
              <Icon name="wrench" size={16} />
              Corrigir
            </Link>
            <BotaoApagar
              acao={apagarEvento}
              id={evento.id}
              descricao={`«${evento.title.pt}»`}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
