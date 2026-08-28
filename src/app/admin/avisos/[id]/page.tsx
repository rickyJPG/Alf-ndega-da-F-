import { notFound } from 'next/navigation';

import { getAllAlerts } from '@/content';
import { exigirEntrada } from '@/lib/admin/sessao';
import { CabecalhoDaPagina } from '../../pecas';
import { FormularioDeAviso } from '../formulario';

export const dynamic = 'force-dynamic';

export default async function CorrigirAviso({ params }: { params: Promise<{ id: string }> }) {
  await exigirEntrada();

  const { id } = await params;
  const aviso = (await getAllAlerts()).find((item) => item.id === decodeURIComponent(id));
  if (!aviso) notFound();

  return (
    <div className="max-w-2xl">
      <CabecalhoDaPagina
        titulo="Corrigir aviso"
        descricao="Para tirar já o aviso do portal, ponha a data de fim em ontem — ou apague-o na lista."
      />
      <FormularioDeAviso
        aviso={{
          id: aviso.id,
          titulo: aviso.title.pt,
          gravidade: aviso.severity,
          ligacao: aviso.href ?? '',
          inicio: aviso.startsAt,
          fim: aviso.endsAt,
        }}
      />
    </div>
  );
}
