import Link from 'next/link';

import { Icon } from '@/components/ui/icon';
import { getNews } from '@/content';
import { exigirEntrada } from '@/lib/admin/sessao';
import { formatDate } from '@/lib/format';
import { apagarNoticia } from '../acoes';
import { BotaoApagar, BotaoNovo, CabecalhoDaPagina, Vazio } from '../pecas';

export const dynamic = 'force-dynamic';

export default async function ListaDeNoticias() {
  await exigirEntrada();
  const noticias = await getNews({ includeArchive: true });

  return (
    <>
      <CabecalhoDaPagina
        titulo="Notícias"
        descricao="Tudo o que já está publicado no portal. Clique numa notícia para a corrigir."
        accao={<BotaoNovo href="/admin/noticias/nova">Escrever notícia</BotaoNovo>}
      />

      {noticias.length === 0 ? (
        <Vazio icone="megaphone" texto="Ainda não há notícias publicadas." />
      ) : (
        <ul className="list-none divide-y divide-line rounded-lg border border-line bg-surface p-0">
          {noticias.map((noticia) => (
            <li key={noticia.id} className="flex flex-wrap items-start gap-4 p-4">
              <div className="min-w-[16rem] flex-1">
                <Link
                  href={`/admin/noticias/${encodeURIComponent(noticia.id)}`}
                  className="font-semibold text-ink no-underline hover:underline"
                >
                  {noticia.title.pt}
                </Link>
                <p className="mt-1 line-clamp-2 max-w-[70ch] text-sm text-ink-muted">
                  {noticia.summary.pt}
                </p>
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
                  <span className="inline-flex items-center gap-1">
                    <Icon name="calendar" size={14} />
                    {formatDate(noticia.date)}
                  </span>
                  <span className="rounded-pill bg-surface-alt px-2 py-0.5 text-xs">
                    {noticia.category}
                  </span>
                  {noticia.image ? (
                    <span className="inline-flex items-center gap-1 text-xs">
                      <Icon name="camera" size={14} />
                      com fotografia
                    </span>
                  ) : null}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <Link
                  href={`/noticias/${noticia.date.slice(0, 4)}/${noticia.date.slice(5, 7)}/${noticia.slug}`}
                  target="_blank"
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-line-strong px-3 text-sm font-medium text-ink no-underline hover:bg-surface-alt"
                >
                  <Icon name="external" size={16} />
                  Ver
                </Link>
                <Link
                  href={`/admin/noticias/${encodeURIComponent(noticia.id)}`}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-line-strong px-3 text-sm font-medium text-ink no-underline hover:bg-surface-alt"
                >
                  <Icon name="wrench" size={16} />
                  Corrigir
                </Link>
                <BotaoApagar
                  acao={apagarNoticia}
                  id={noticia.id}
                  descricao={`«${noticia.title.pt}»`}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
