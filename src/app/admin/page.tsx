import Link from 'next/link';

import { Icon, type IconName } from '@/components/ui/icon';
import { getActiveAlerts, getAllAlerts, getAllEvents, getNews } from '@/content';
import { exigirEntrada } from '@/lib/admin/sessao';
import { formatDate } from '@/lib/format';
import { imagensCarregadas } from './acoes';

/**
 * Ecrã inicial do painel.
 *
 * Responde a três perguntas, por esta ordem: o que está publicado agora, o
 * que precisa de atenção, e o que se faz a seguir. Nada de gráficos nem de
 * contadores decorativos — quem entra aqui vem publicar uma coisa concreta.
 */

export const dynamic = 'force-dynamic';

const HOJE = () => new Date().toISOString().slice(0, 10);

export default async function PainelInicial() {
  await exigirEntrada();

  const hoje = HOJE();
  const [noticias, eventos, avisosAtivos, todosOsAvisos, fotografias] = await Promise.all([
    getNews({ includeArchive: true }),
    getAllEvents(),
    getActiveAlerts(),
    getAllAlerts(),
    imagensCarregadas(),
  ]);

  const proximos = eventos.filter((evento) => (evento.endDate ?? evento.startDate) >= hoje);
  const ultimas = noticias.slice(0, 5);

  return (
    <>
      <div className="mb-8">
        <span aria-hidden="true" className="mb-2 block h-1 w-12 rounded-pill bg-accent-600" />
        <h1 className="font-serif text-3xl font-semibold">Bom dia. O que vamos publicar?</h1>
        <p className="mt-1.5 max-w-[62ch] text-ink-muted">
          Tudo o que altere aqui aparece no portal em poucos segundos. Não é preciso guardar em
          mais lado nenhum nem avisar ninguém.
        </p>
      </div>

      {/* ------------------------------------------------------- o que fazer -- */}

      <h2 className="mb-3 text-sm font-semibold tracking-wide text-ink-muted uppercase">
        Tarefas mais frequentes
      </h2>
      <ul className="mb-10 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
        <Atalho
          href="/admin/noticias/nova"
          icone="megaphone"
          titulo="Escrever notícia"
          detalhe="Texto, fotografia e data de publicação."
        />
        <Atalho
          href="/admin/avisos"
          icone="alert"
          titulo="Publicar aviso"
          detalhe="Corte de água, estrada fechada, risco de incêndio."
        />
        <Atalho
          href="/admin/eventos/novo"
          icone="calendar"
          titulo="Marcar na agenda"
          detalhe="Feira, concerto, sessão pública."
        />
        <Atalho
          href="/admin/imagens"
          icone="camera"
          titulo="Trocar fotografias"
          detalhe="Substituir as imagens de qualquer página."
        />
      </ul>

      {/* ---------------------------------------------------------- números -- */}

      <h2 className="mb-3 text-sm font-semibold tracking-wide text-ink-muted uppercase">
        Como está o portal agora
      </h2>
      <ul className="mb-10 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
        <Contagem
          href="/admin/noticias"
          numero={noticias.length}
          singular="notícia publicada"
          plural="notícias publicadas"
        />
        <Contagem
          href="/admin/avisos"
          numero={avisosAtivos.length}
          singular="aviso no ar"
          plural="avisos no ar"
          nota={
            todosOsAvisos.length > avisosAtivos.length
              ? `${todosOsAvisos.length - avisosAtivos.length} fora de prazo`
              : undefined
          }
          destacar={avisosAtivos.length > 0}
        />
        <Contagem
          href="/admin/eventos"
          numero={proximos.length}
          singular="evento por acontecer"
          plural="eventos por acontecer"
        />
        <Contagem
          href="/admin/imagens"
          numero={fotografias.length}
          singular="fotografia carregada"
          plural="fotografias carregadas"
        />
      </ul>

      {/* --------------------------------------------------------- últimas -- */}

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="font-serif text-xl font-semibold">Últimas notícias</h2>
            <Link href="/admin/noticias" className="text-sm font-medium">
              Ver todas
            </Link>
          </div>

          {ultimas.length === 0 ? (
            <p className="rounded-lg border border-dashed border-line-strong p-6 text-center text-ink-muted">
              Ainda não há notícias.
            </p>
          ) : (
            <ul className="list-none divide-y divide-line rounded-lg border border-line bg-surface p-0">
              {ultimas.map((noticia) => (
                <li key={noticia.id}>
                  <Link
                    href={`/admin/noticias/${encodeURIComponent(noticia.id)}`}
                    className="flex items-baseline justify-between gap-4 p-4 no-underline hover:bg-surface-alt"
                  >
                    <span className="font-medium text-ink">{noticia.title.pt}</span>
                    <span className="shrink-0 text-sm whitespace-nowrap text-ink-muted">
                      {formatDate(noticia.date)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="font-serif text-xl font-semibold">Próximos eventos</h2>
            <Link href="/admin/eventos" className="text-sm font-medium">
              Ver a agenda
            </Link>
          </div>

          {proximos.length === 0 ? (
            <p className="rounded-lg border border-dashed border-line-strong p-6 text-center text-ink-muted">
              A agenda está vazia.
            </p>
          ) : (
            <ul className="list-none divide-y divide-line rounded-lg border border-line bg-surface p-0">
              {proximos.slice(0, 5).map((evento) => (
                <li key={evento.id}>
                  <Link
                    href={`/admin/eventos/${encodeURIComponent(evento.id)}`}
                    className="flex items-baseline justify-between gap-4 p-4 no-underline hover:bg-surface-alt"
                  >
                    <span className="font-medium text-ink">{evento.title.pt}</span>
                    <span className="shrink-0 text-sm whitespace-nowrap text-ink-muted">
                      {formatDate(evento.startDate)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <p className="mt-10 flex items-start gap-2 rounded-lg border border-line bg-surface p-4 text-sm text-ink-muted">
        <Icon name="lightbulb" size={20} className="mt-0.5 shrink-0 text-accent-600" />
        <span>
          Primeira vez por aqui? A página de <Link href="/admin/ajuda">Ajuda</Link> explica, passo
          a passo e sem termos técnicos, como se publica cada coisa.
        </span>
      </p>
    </>
  );
}

/* ------------------------------------------------------------------ peças -- */

function Atalho({
  href,
  icone,
  titulo,
  detalhe,
}: {
  href: string;
  icone: IconName;
  titulo: string;
  detalhe: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex h-full flex-col gap-1.5 rounded-lg border border-line bg-surface p-4 no-underline hover:border-accent-600"
      >
        <Icon name={icone} size={24} className="text-accent-600" />
        <span className="font-semibold text-ink">{titulo}</span>
        <span className="text-sm text-ink-muted">{detalhe}</span>
      </Link>
    </li>
  );
}

function Contagem({
  href,
  numero,
  singular,
  plural,
  nota,
  destacar,
}: {
  href: string;
  numero: number;
  singular: string;
  plural: string;
  nota?: string;
  destacar?: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex h-full flex-col rounded-lg border border-line bg-surface p-4 no-underline hover:border-accent-600"
      >
        <span
          className={destacar ? 'font-serif text-4xl font-semibold text-accent-700' : 'font-serif text-4xl font-semibold text-ink'}
        >
          {numero}
        </span>
        <span className="text-sm text-ink-muted">{numero === 1 ? singular : plural}</span>
        {nota ? <span className="mt-1 text-xs text-ink-muted">{nota}</span> : null}
      </Link>
    </li>
  );
}
