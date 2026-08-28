import { Icon } from '@/components/ui/icon';
import { posicoesPorGrupo } from '@/lib/admin/posicoes';
import { exigirEntrada } from '@/lib/admin/sessao';
import { ehFotoExterna, fotoReal } from '@/lib/imagens';
import { imagensCarregadas } from '../acoes';
import { CabecalhoDaPagina } from '../pecas';
import { Carregador } from './carregador';

/**
 * Fotografias.
 *
 * O portal não tem uma «galeria» solta: cada fotografia ocupa uma posição
 * fixa — o destaque da página inicial, a imagem de cada aldeia. Trocar a
 * fotografia de uma posição troca-a em todo o portal de uma vez, e é isso
 * que este ecrã faz.
 */

export const dynamic = 'force-dynamic';

export default async function PaginaDeImagens() {
  await exigirEntrada();

  const carregadas = new Set(
    (await imagensCarregadas()).map((ficheiro) => ficheiro.replace(/\.[^.]+$/, '')),
  );
  const grupos = posicoesPorGrupo();

  return (
    <>
      <CabecalhoDaPagina
        titulo="Fotografias"
        descricao="Cada quadrado é um sítio do portal. Carregue a fotografia e ela entra lá — não é preciso mexer em mais nada."
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Conselho
          icone="camera"
          titulo="Fotografias na horizontal"
          texto="Deitadas, não em pé. O portal corta-as ao meio se forem verticais."
        />
        <Conselho
          icone="chart"
          titulo="Grandes, mas não enormes"
          texto="Cerca de 1600 pontos de largura chega. O limite são 8 MB por ficheiro."
        />
        <Conselho
          icone="scale"
          titulo="Só o que é do Município"
          texto="Fotografias tiradas de outros sítios precisam de autorização de quem as tirou."
        />
      </div>

      {grupos.map(({ grupo, itens }) => (
        <section key={grupo} className="mb-10">
          <h2 className="mb-4 border-b border-line pb-2 font-serif text-xl font-semibold">
            {grupo}
          </h2>
          <ul className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {itens.map((posicao) => {
              const previsualizacao = fotoReal(posicao.caminho);
              return (
                <Carregador
                  key={posicao.caminho}
                  chave={posicao.chave}
                  rotulo={posicao.rotulo}
                  previsualizacao={previsualizacao}
                  externa={ehFotoExterna(previsualizacao)}
                  temFicheiroLocal={carregadas.has(posicao.chave)}
                />
              );
            })}
          </ul>
        </section>
      ))}
    </>
  );
}

function Conselho({
  icone,
  titulo,
  texto,
}: {
  icone: 'camera' | 'chart' | 'scale';
  titulo: string;
  texto: string;
}) {
  return (
    <p className="flex items-start gap-2.5 rounded-lg border border-line bg-surface p-4 text-sm">
      <Icon name={icone} size={20} className="mt-0.5 shrink-0 text-accent-600" />
      <span>
        <strong className="block text-ink">{titulo}</strong>
        <span className="text-ink-muted">{texto}</span>
      </span>
    </p>
  );
}
