import { fotosDoMunicipio } from '@/lib/fotos-do-municipio';

/**
 * As posições de fotografia do portal, com nome em português corrente.
 *
 * Uma «posição» é um sítio fixo onde o portal mostra uma imagem — o destaque
 * da página inicial, a fotografia de cada aldeia, a ilustração de uma
 * notícia. Quem edita não precisa de saber que por trás está um caminho de
 * ficheiro: escolhe «Aldeia de Sambade» e a fotografia entra no sítio certo.
 *
 * A lista deriva de `fotosDoMunicipio`, que é onde as posições já estão
 * declaradas — assim não há duas listas para manter em sintonia. Acrescentar
 * uma posição nova ao portal é acrescentá-la lá, e o rótulo bonito aqui.
 */

export interface Posicao {
  /** Caminho canónico, como aparece no conteúdo. */
  caminho: string;
  /** Nome sem extensão — é o que a ação de carregar recebe. */
  chave: string;
  rotulo: string;
  grupo: string;
}

const GRUPOS: { prefixo: string; grupo: string }[] = [
  { prefixo: '/images/visitar/', grupo: 'Visitar o concelho' },
  { prefixo: '/images/noticias/', grupo: 'Notícias' },
  { prefixo: '/images/eventos/', grupo: 'Agenda' },
  { prefixo: '/images/freguesias/', grupo: 'Freguesias e aldeias' },
];

/** Rótulos escritos à mão onde o nome do ficheiro não chega. */
const ROTULOS: Record<string, string> = {
  '/images/hero-alfandega.svg': 'Fotografia grande da página inicial',
  '/images/visitar/patrimonio.svg': 'Património — castelo e centro histórico',
  '/images/visitar/lagos-do-sabor.svg': 'Lagos do Sabor',
  '/images/visitar/cereja.svg': 'Cereja e cerejais',
  '/images/visitar/percursos.svg': 'Percursos pedestres',
  '/images/visitar/amendoeiras.svg': 'Amendoeiras em flor',
  '/images/noticias/orcamento.svg': 'Notícia — contas e orçamento',
  '/images/noticias/cereja.svg': 'Notícia — Festa da Cereja',
  '/images/noticias/agua.svg': 'Notícia — água e saneamento',
  '/images/noticias/ambiente.svg': 'Notícia — ambiente',
  '/images/noticias/escolas.svg': 'Notícia — escolas e educação',
  '/images/noticias/social.svg': 'Notícia — ação social',
  '/images/noticias/festa.svg': 'Notícia — festas e romarias',
  '/images/eventos/musica.svg': 'Agenda — música',
  '/images/eventos/feira.svg': 'Agenda — feiras e mercados',
  '/images/eventos/exposicao.svg': 'Agenda — exposições',
};

/** Transforma `parada-sendim-da-ribeira` em `Parada, Sendim da Ribeira`. */
function apartirDoNome(caminho: string): string {
  const nome = caminho.slice(caminho.lastIndexOf('/') + 1, -'.svg'.length);
  const palavras = nome.replace(/-/g, ' ');
  return palavras.charAt(0).toUpperCase() + palavras.slice(1);
}

export const posicoes: Posicao[] = Object.keys(fotosDoMunicipio)
  .map((caminho) => ({
    caminho,
    chave: caminho.slice('/images/'.length, -'.svg'.length),
    rotulo: ROTULOS[caminho] ?? apartirDoNome(caminho),
    grupo: GRUPOS.find(({ prefixo }) => caminho.startsWith(prefixo))?.grupo ?? 'Página inicial',
  }))
  .sort((a, b) => a.grupo.localeCompare(b.grupo, 'pt') || a.rotulo.localeCompare(b.rotulo, 'pt'));

/** As posições agrupadas, na ordem em que o painel as mostra. */
export function posicoesPorGrupo(): { grupo: string; itens: Posicao[] }[] {
  const ordem = ['Página inicial', 'Notícias', 'Agenda', 'Visitar o concelho', 'Freguesias e aldeias'];
  return ordem
    .map((grupo) => ({ grupo, itens: posicoes.filter((posicao) => posicao.grupo === grupo) }))
    .filter(({ itens }) => itens.length > 0);
}
