import { exigirEntrada } from '@/lib/admin/sessao';
import { CabecalhoDaPagina } from '../../pecas';
import { FormularioDeServico } from '../formulario';

export const dynamic = 'force-dynamic';

export default async function NovoServico() {
  await exigirEntrada();

  return (
    <div className="max-w-3xl">
      <CabecalhoDaPagina
        titulo="Criar serviço"
        descricao="Uma ficha por serviço, sempre com as mesmas respostas. É essa constância que poupa deslocações ao balcão."
      />
      <FormularioDeServico />
    </div>
  );
}
