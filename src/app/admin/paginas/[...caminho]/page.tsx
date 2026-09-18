import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Icon } from '@/components/ui/icon';
import { getEditorialPage } from '@/content';
import { exigirEntrada } from '@/lib/admin/sessao';
import { blocoEditavel, descreverBloco } from '@/lib/admin/blocos';
import { CabecalhoDaPagina } from '../../pecas';
import { FormularioDePagina, type BlocoEmEdicao } from '../formulario';

export const dynamic = 'force-dynamic';

/** O texto de um bloco, na forma em que se escreve no formulário. */
function conteudoDe(bloco: { type: string } & Record<string, unknown>): string {
  if (bloco.type === 'prose') {
    return ((bloco.paragraphs as { pt: string[] })?.pt ?? []).join('\n\n');
  }
  if (bloco.type === 'list') {
    return ((bloco.items as { pt: string[] })?.pt ?? []).join('\n');
  }
  if (bloco.type === 'callout') {
    return (bloco.body as { pt: string })?.pt ?? '';
  }
  return '';
}

export default async function CorrigirPagina({
  params,
}: {
  params: Promise<{ caminho: string[] }>;
}) {
  await exigirEntrada();

  const { caminho } = await params;
  const pagina = await getEditorialPage(caminho.join('/'));
  if (!pagina) notFound();

  const blocos: BlocoEmEdicao[] = pagina.blocks.map((bloco, indice) => ({
    indice,
    tipo: bloco.type,
    editavel: blocoEditavel(bloco.type),
    descricao: descreverBloco(bloco.type),
    titulo: (bloco as { heading?: { pt: string } }).heading?.pt ?? '',
    conteudo: conteudoDe(bloco as { type: string } & Record<string, unknown>),
  }));

  return (
    <div className="max-w-3xl">
      <CabecalhoDaPagina
        titulo="Corrigir página"
        descricao={`/${pagina.path}`}
        accao={
          <Link
            href={`/${pagina.path}`}
            target="_blank"
            className="inline-flex min-h-12 items-center gap-2 rounded-md border border-line-strong px-4 font-medium text-ink no-underline hover:bg-surface-alt"
          >
            <Icon name="external" size={18} />
            Ver no portal
          </Link>
        }
      />

      <FormularioDePagina
        pagina={{
          caminho: pagina.path,
          titulo: pagina.title.pt,
          lead: pagina.lead.pt,
          blocos,
        }}
      />
    </div>
  );
}
