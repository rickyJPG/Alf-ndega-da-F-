import { exigirEntrada } from '@/lib/admin/sessao';
import { posicoes } from '@/lib/admin/posicoes';
import { CabecalhoDaPagina } from '../../pecas';
import { FormularioDeNoticia } from '../formulario';

export const dynamic = 'force-dynamic';

export default async function NovaNoticia() {
  await exigirEntrada();

  return (
    <div className="max-w-3xl">
      <CabecalhoDaPagina
        titulo="Escrever notícia"
        descricao="Assim que guardar, a notícia fica visível no portal. Pode voltar a corrigi-la a qualquer momento."
      />
      <FormularioDeNoticia posicoes={posicoes} />
    </div>
  );
}
