import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Icon } from '@/components/ui/icon';
import { getAllEvents } from '@/content';
import { exigirEntrada } from '@/lib/admin/sessao';
import { CabecalhoDaPagina } from '../../pecas';
import { FormularioDeEvento } from '../formulario';

export const dynamic = 'force-dynamic';

export default async function CorrigirEvento({ params }: { params: Promise<{ id: string }> }) {
  await exigirEntrada();

  const { id } = await params;
  const evento = (await getAllEvents()).find((item) => item.id === decodeURIComponent(id));
  if (!evento) notFound();

  return (
    <div className="max-w-3xl">
      <CabecalhoDaPagina
        titulo="Corrigir evento"
        accao={
          <Link
            href={`/eventos/${evento.slug}`}
            target="_blank"
            className="inline-flex min-h-12 items-center gap-2 rounded-md border border-line-strong px-4 font-medium text-ink no-underline hover:bg-surface-alt"
          >
            <Icon name="external" size={18} />
            Ver no portal
          </Link>
        }
      />

      <FormularioDeEvento
        evento={{
          id: evento.id,
          titulo: evento.title.pt,
          resumo: evento.summary.pt,
          categoria: evento.category,
          inicio: evento.startDate,
          fim: evento.endDate ?? '',
          hora: evento.startTime ?? '',
          local: evento.location,
          preco: evento.price?.pt ?? '',
        }}
      />
    </div>
  );
}
