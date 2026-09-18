/**
 * O que o painel sabe fazer a cada tipo de bloco de uma página.
 *
 * Vive aqui, e não ao lado das ações, porque um ficheiro `'use server'` só
 * pode exportar funções assíncronas — e isto é conhecimento, não uma ação.
 */

/**
 * Blocos que o painel sabe editar.
 *
 * São os que só têm texto — e são a esmagadora maioria do que muda: um
 * horário dentro de um parágrafo, uma alínea a mais numa lista, o teor de um
 * aviso. Os restantes (galerias, vídeos, listas de ligações, blocos que se
 * preenchem sozinhos como o de contactos) ficam intactos ao gravar, e o ecrã
 * diz porquê em vez de os esconder.
 */
const EDITAVEIS = new Set(['prose', 'list', 'callout']);

export function blocoEditavel(tipo: string): boolean {
  return EDITAVEIS.has(tipo);
}

/**
 * O nome de cada tipo de bloco, em português corrente.
 *
 * Quem edita uma página não tem de saber o que é um «bloco do tipo prose» —
 * tem de perceber que aquilo é um texto, uma lista ou uma caixa de destaque.
 */
const DESCRICOES: Record<string, string> = {
  prose: 'Texto',
  list: 'Lista',
  callout: 'Caixa de destaque',
  links: 'Lista de ligações',
  steps: 'Passos numerados',
  people: 'Lista de eleitos (preenche-se sozinha)',
  tenders: 'Concursos abertos (preenche-se sozinha)',
  datasets: 'Dados abertos (preenche-se sozinha)',
  contact: 'Contactos do Município (preenchem-se sozinhos)',
  sitemap: 'Mapa do portal (preenche-se sozinho)',
  galeria: 'Galeria de fotografias',
  video: 'Vídeo',
};

export function descreverBloco(tipo: string): string {
  return DESCRICOES[tipo] ?? tipo;
}
