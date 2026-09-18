import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Icon } from '@/components/ui/icon';
import { getServices } from '@/content';
import { exigirEntrada } from '@/lib/admin/sessao';
import { CabecalhoDaPagina } from '../../pecas';
import { FormularioDeServico } from '../formulario';

export const dynamic = 'force-dynamic';

export default async function CorrigirServico({ params }: { params: Promise<{ id: string }> }) {
  await exigirEntrada();

  const { id } = await params;
  const servico = (await getServices()).find((item) => item.id === decodeURIComponent(id));
  if (!servico) notFound();

  return (
    <div className="max-w-3xl">
      <CabecalhoDaPagina
        titulo="Corrigir serviço"
        accao={
          <Link
            href={`/servicos/${servico.area}/${servico.slug}`}
            target="_blank"
            className="inline-flex min-h-12 items-center gap-2 rounded-md border border-line-strong px-4 font-medium text-ink no-underline hover:bg-surface-alt"
          >
            <Icon name="external" size={18} />
            Ver no portal
          </Link>
        }
      />

      <FormularioDeServico
        servico={{
          id: servico.id,
          titulo: servico.title.pt,
          resumo: servico.summary.pt,
          area: servico.area,
          paraQuem: servico.audience.pt,
          prazo: servico.processingTime.pt,
          custo: servico.fee.pt,
          documentos: servico.requiredDocuments.pt.join('\n'),
          passos: servico.steps.map((passo) => ({
            titulo: passo.title.pt,
            detalhe: passo.detail.pt,
          })),
          canais: servico.channels,
          enderecoOnline: servico.onlineUrl ?? '',
          servico: servico.department,
          simbolo: servico.icon,
          destaque: Boolean(servico.featured),
        }}
      />
    </div>
  );
}
