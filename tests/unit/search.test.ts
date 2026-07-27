import { describe, expect, it } from 'vitest';
import { SearchIndex, tokenize, type SearchDocument } from '@/lib/search/engine';

const documents: SearchDocument[] = [
  {
    id: 'a',
    type: 'servico',
    section: 'Serviços',
    title: 'Licença de construção',
    summary: 'Construir de novo, ampliar ou alterar.',
    body: 'Projeto de arquitetura, termo de responsabilidade, levantamento topográfico.',
    href: '/servicos/urbanismo/licenca-de-construcao',
    year: 2026,
  },
  {
    id: 'b',
    type: 'documento',
    section: 'regulamento',
    title: 'Regulamento de Taxas e Licenças',
    summary: 'Todas as taxas cobradas pelo Município.',
    body: '',
    fileText: 'Tabela de taxas. Certidões. Ocupação da via pública. Publicidade. Ruído.',
    href: '/documentos/regulamento-de-taxas-e-licencas',
    year: 2026,
  },
  {
    id: 'c',
    type: 'noticia',
    section: 'Ambiente',
    title: 'Mais ecopontos nas freguesias',
    summary: 'A rede passa a ter 96 ecopontos.',
    body: 'Recolha seletiva, vidro, papel, embalagens.',
    href: '/noticias/2026/05/novos-ecopontos-nas-freguesias',
    year: 2026,
    date: '2026-05-28',
  },
];

const index = new SearchIndex(documents);

describe('motor de pesquisa', () => {
  it('ignora palavras vazias e acentos ao tokenizar', () => {
    expect(tokenize('A licença de construção')).toEqual(['licenca', 'construcao']);
  });

  it('encontra pelo título e ordena-o à frente', () => {
    const { hits } = index.search('licença construção');
    expect(hits[0]?.document.id).toBe('a');
  });

  it('encontra texto que só existe dentro do PDF e assinala-o', () => {
    const { hits } = index.search('publicidade');
    expect(hits).toHaveLength(1);
    expect(hits[0].document.id).toBe('b');
    expect(hits[0].matchedInFile).toBe(true);
  });

  it('tolera erros de escrita e sugere a forma correta', () => {
    const { hits, suggestion } = index.search('ecopntos');
    expect(hits.length).toBeGreaterThan(0);
    expect(suggestion).toBe('ecopontos');
  });

  it('nunca descarta um resultado exato por causa da correção ortográfica', () => {
    // «publicidade» existe tal e qual dentro do PDF; «publicidades» não existe
    // em lado nenhum. A correção pode acrescentar resultados, nunca substituir.
    const { hits } = index.search('publicidade');
    expect(hits.some((hit) => hit.document.id === 'b')).toBe(true);
    expect(hits[0].document.id).toBe('b');
  });

  it('devolve facetas contadas antes de aplicar os filtros', () => {
    const { facets } = index.search('taxas licenças');
    expect(facets.type.map((facet) => facet.value)).toContain('documento');
  });

  it('aplica o filtro por tipo sem perder as facetas', () => {
    const filtered = index.search('licenças', { type: 'documento' });
    expect(filtered.hits.every((hit) => hit.document.type === 'documento')).toBe(true);
  });

  it('não devolve nada para uma pesquisa vazia', () => {
    expect(index.search('   ').total).toBe(0);
  });
});
