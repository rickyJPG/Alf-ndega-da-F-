import Link from 'next/link';

import { Icon } from '@/components/ui/icon';
import { getEditorialPages } from '@/content';
import { exigirEntrada } from '@/lib/admin/sessao';
import { formatDate } from '@/lib/format';
import { blocoEditavel } from '@/lib/admin/blocos';
import { CabecalhoDaPagina, Vazio } from '../pecas';

export const dynamic = 'force-dynamic';

/** O primeiro segmento do caminho — é como as páginas se agrupam no portal. */
function seccaoDe(caminho: string): string {
  return caminho.split('/')[0] ?? '';
}

const SECCOES: Record<string, string> = {
  municipio: 'Município',
  servicos: 'Serviços',
  transparencia: 'Transparência',
  'viver-e-participar': 'Viver e Participar',
  visitar: 'Visitar',
};

export default async function ListaDePaginas() {
  await exigirEntrada();
  const paginas = await getEditorialPages();

  const grupos = [...new Set(paginas.map((pagina) => seccaoDe(pagina.path)))]
    .sort((a, b) => (SECCOES[a] ?? a).localeCompare(SECCOES[b] ?? b, 'pt'))
    .map((seccao) => ({
      seccao,
      itens: paginas
        .filter((pagina) => seccaoDe(pagina.path) === seccao)
        .sort((a, b) => a.path.localeCompare(b.path, 'pt')),
    }));

  return (
    <>
      <CabecalhoDaPagina
        titulo="Páginas"
        descricao="As páginas institucionais do portal. Pode corrigir os textos; galerias, vídeos e listas que se preenchem sozinhas ficam como estão."
      />

      {paginas.length === 0 ? (
        <Vazio icone="fileText" texto="Não há páginas." />
      ) : (
        grupos.map(({ seccao, itens }) => (
          <section key={seccao} className="mb-8">
            <h2 className="mb-3 border-b border-line pb-2 font-serif text-xl font-semibold">
              {SECCOES[seccao] ?? seccao}{' '}
              <span className="text-base font-normal text-ink-muted">({itens.length})</span>
            </h2>

            <ul className="list-none divide-y divide-line rounded-lg border border-line bg-surface p-0">
              {itens.map((pagina) => {
                const editaveis = pagina.blocks.filter((bloco) => blocoEditavel(bloco.type)).length;

                return (
                  <li key={pagina.path} className="flex flex-wrap items-start gap-4 p-4">
                    <div className="min-w-[16rem] flex-1">
                      <Link
                        href={`/admin/paginas/${pagina.path}`}
                        className="font-semibold text-ink no-underline hover:underline"
                      >
                        {pagina.title.pt}
                      </Link>
                      <p className="mt-1 line-clamp-2 max-w-[70ch] text-sm text-ink-muted">
                        {pagina.lead.pt}
                      </p>
                      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
                        <span className="font-mono text-xs">/{pagina.path}</span>
                        <span>
                          {editaveis === 0
                            ? 'sem textos a corrigir'
                            : `${editaveis} ${editaveis === 1 ? 'parte' : 'partes'} a corrigir`}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Icon name="clock" size={14} />
                          {formatDate(pagina.updatedAt)}
                        </span>
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Link
                        href={`/${pagina.path}`}
                        target="_blank"
                        className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-line-strong px-3 text-sm font-medium text-ink no-underline hover:bg-surface-alt"
                      >
                        <Icon name="external" size={16} />
                        Ver
                      </Link>
                      <Link
                        href={`/admin/paginas/${pagina.path}`}
                        className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-line-strong px-3 text-sm font-medium text-ink no-underline hover:bg-surface-alt"
                      >
                        <Icon name="wrench" size={16} />
                        Corrigir
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </>
  );
}
