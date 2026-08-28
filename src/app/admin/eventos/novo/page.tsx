import { exigirEntrada } from '@/lib/admin/sessao';
import { CabecalhoDaPagina } from '../../pecas';
import { FormularioDeEvento } from '../formulario';

export const dynamic = 'force-dynamic';

export default async function NovoEvento() {
  await exigirEntrada();

  return (
    <div className="max-w-3xl">
      <CabecalhoDaPagina
        titulo="Pôr na agenda"
        descricao="O evento aparece na agenda do portal e na página inicial quando estiver perto."
      />
      <FormularioDeEvento />
    </div>
  );
}
