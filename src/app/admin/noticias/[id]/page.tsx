import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Icon } from '@/components/ui/icon';
import { getNews } from '@/content';
import { posicoes } from '@/lib/admin/posicoes';
import { exigirEntrada } from '@/lib/admin/sessao';
import { formatDate } from '@/lib/format';
import { CabecalhoDaPagina } from '../../pecas';
import { FormularioDeNoticia } from '../formulario';

export const dynamic = 'force-dynamic';

export default async function CorrigirNoticia({ params }: { params: Promise<{ id: string }> }) {
  await exigirEntrada();

  const { id } = await params;
  const noticias = await getNews({ includeArchive: true });
  const noticia = noticias.find((item) => item.id === decodeURIComponent(id));
  if (!noticia) notFound();

  const enderecoPublico = `/noticias/${noticia.date.slice(0, 4)}/${noticia.date.slice(5, 7)}/${noticia.slug}`;

  return (
    <div className="max-w-3xl">
      <CabecalhoDaPagina
        titulo="Corrigir notícia"
        descricao={`Publicada a ${formatDate(noticia.date)}.`}
        accao={
          <Link
            href={enderecoPublico}
            target="_blank"
            className="inline-flex min-h-12 items-center gap-2 rounded-md border border-line-strong px-4 font-medium text-ink no-underline hover:bg-surface-alt"
          >
            <Icon name="external" size={18} />
            Ver no portal
          </Link>
        }
      />

      <FormularioDeNoticia
        posicoes={posicoes}
        noticia={{
          id: noticia.id,
          titulo: noticia.title.pt,
          resumo: noticia.summary.pt,
          corpo: noticia.body.pt.join('\n\n'),
          data: noticia.date,
          categoria: noticia.category,
          imagem: noticia.image?.src ?? '',
          imagemAlt: noticia.image?.alt.pt ?? '',
        }}
      />
    </div>
  );
}
