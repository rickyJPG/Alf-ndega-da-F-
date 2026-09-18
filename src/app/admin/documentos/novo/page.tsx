import { exigirEntrada } from '@/lib/admin/sessao';
import { CabecalhoDaPagina } from '../../pecas';
import { FormularioDeDocumento } from '../formulario';

export const dynamic = 'force-dynamic';

export default async function NovoDocumento() {
  await exigirEntrada();

  return (
    <div className="max-w-3xl">
      <CabecalhoDaPagina
        titulo="Publicar documento"
        descricao="Assim que guardar, fica na lista de documentos do portal e pode ser descarregado."
      />
      <FormularioDeDocumento />
    </div>
  );
}
