import { describe, expect, it } from 'vitest';

import { budget2026 } from '@/content/data/budget';
import { documents } from '@/content/data/documents';
import {
  ATRIBUICAO,
  dadosAbertosDisponiveis,
  encontrarAnoDoOrcamento,
  LICENCA,
  ocorrenciasEmJson,
  orcamentoEmCsv,
} from '@/lib/dados-abertos';

/**
 * Dados abertos.
 *
 * Estes dois ficheiros existiam no catálogo e não existiam no disco: a página
 * de Dados Abertos oferecia dois descarregamentos e os dois davam 404. Agora
 * são gerados a partir das fontes do portal, e o que interessa verificar é
 * que continuam a bater com o que as páginas mostram — porque a razão de os
 * gerar não foi o 404, foi a divergência silenciosa que vinha a seguir.
 */

describe('orçamento em CSV', () => {
  const csv = orcamentoEmCsv(budget2026);

  /** Linhas de dados: sem os comentários e sem o cabeçalho. */
  function linhasDeDados(): string[][] {
    return csv
      .split('\r\n')
      .filter((linha) => linha && !linha.startsWith('#'))
      .slice(1)
      .map(separar);
  }

  /** Divisor de CSV conforme a RFC 4180 — o suficiente para este ficheiro. */
  function separar(linha: string): string[] {
    const campos: string[] = [];
    let atual = '';
    let dentroDeAspas = false;

    for (let i = 0; i < linha.length; i += 1) {
      const c = linha[i];
      if (dentroDeAspas) {
        if (c === '"' && linha[i + 1] === '"') {
          atual += '"';
          i += 1;
        } else if (c === '"') {
          dentroDeAspas = false;
        } else {
          atual += c;
        }
      } else if (c === '"') {
        dentroDeAspas = true;
      } else if (c === ',') {
        campos.push(atual);
        atual = '';
      } else {
        atual += c;
      }
    }
    campos.push(atual);
    return campos;
  }

  it('tem uma linha por categoria e por rubrica', () => {
    const rubricas = budget2026.categories.reduce(
      (soma, categoria) => soma + (categoria.children?.length ?? 0),
      0,
    );
    expect(linhasDeDados()).toHaveLength(budget2026.categories.length + rubricas);
  });

  it('as categorias somam a despesa que a página anuncia', () => {
    const soma = linhasDeDados()
      .filter((campos) => campos[1] === 'categoria')
      .reduce((total, campos) => total + Number(campos[5]), 0);

    // É isto que faz o ficheiro valer: quem o abre chega ao mesmo total que
    // está escrito na página do orçamento.
    expect(soma).toBe(budget2026.expense);
  });

  it('as rubricas somam o mesmo total', () => {
    const soma = linhasDeDados()
      .filter((campos) => campos[1] === 'rubrica')
      .reduce((total, campos) => total + Number(campos[5]), 0);

    expect(soma).toBe(budget2026.expense);
  });

  it('protege a vírgula que está dentro de um nome de categoria', () => {
    // «Água, saneamento e resíduos» — sem aspas, esta vírgula partia a linha
    // em duas e o ficheiro inteiro ficava desalinhado.
    expect(csv).toContain('"Água, saneamento e resíduos"');

    const comVirgula = linhasDeDados().find((campos) => campos[3].includes(','));
    expect(comVirgula, 'a categoria com vírgula tem de sobreviver à leitura').toBeDefined();
    expect(comVirgula).toHaveLength(9);
  });

  it('todas as linhas têm o mesmo número de colunas', () => {
    for (const campos of linhasDeDados()) {
      expect(campos).toHaveLength(9);
    }
  });

  it('leva a licença e a atribuição que a página promete', () => {
    expect(csv).toContain(LICENCA);
    expect(csv).toContain(ATRIBUICAO);
  });

  it('termina as linhas em CRLF, como manda a RFC 4180', () => {
    expect(csv.endsWith('\r\n')).toBe(true);
    expect(csv.split('\n').every((l) => l === '' || l.endsWith('\r'))).toBe(true);
  });
});

describe('ocorrências em JSON', () => {
  const dados = ocorrenciasEmJson(2026);

  it('o total corresponde ao que vem na lista', () => {
    expect(dados.total).toBe(dados.ocorrencias.length);
  });

  it('não leva dados pessoais de quem comunicou', () => {
    const proibidos = ['nome', 'name', 'email', 'telefone', 'phone', 'contacto', 'nif'];
    for (const ocorrencia of dados.ocorrencias) {
      for (const campo of Object.keys(ocorrencia)) {
        expect(proibidos).not.toContain(campo.toLowerCase());
      }
    }
  });

  it('vem ordenado da mais recente para a mais antiga', () => {
    const datas = dados.ocorrencias.map((o) => o.reportedAt);
    expect([...datas].sort().reverse()).toEqual(datas);
  });

  it('um ano sem ocorrências dá um ficheiro válido e vazio', () => {
    const vazio = ocorrenciasEmJson(1999);
    expect(vazio.total).toBe(0);
    expect(vazio.ocorrencias).toEqual([]);
    expect(() => JSON.parse(JSON.stringify(vazio))).not.toThrow();
  });
});

describe('que endereços são servíveis', () => {
  it('serve o orçamento dos anos que existem', () => {
    expect(dadosAbertosDisponiveis('/dados/orcamento-2026.csv')).toBe(true);
    expect(encontrarAnoDoOrcamento(2026)).toBeDefined();
  });

  it('não serve o orçamento de um ano que ainda não há', () => {
    // Importa que seja `false`: é isto que esconde o botão em vez de o
    // oferecer para dar 404 a seguir.
    expect(dadosAbertosDisponiveis('/dados/orcamento-2031.csv')).toBe(false);
    expect(encontrarAnoDoOrcamento(2031)).toBeUndefined();
  });

  it('recusa nomes que não são nenhum dos dois ficheiros', () => {
    for (const mau of [
      '/dados/orcamento.csv',
      '/dados/orcamento-2026.xlsx',
      '/dados/ocorrencias.json',
      '/dados/../package.json',
      '/dados/',
      '/documentos/orcamento-2026.pdf',
    ]) {
      expect(dadosAbertosDisponiveis(mau), mau).toBe(false);
    }
  });
});

describe('o tamanho anunciado ao munícipe', () => {
  /**
   * As páginas mostram «(CSV, 3 kB)» a partir do `bytes` do catálogo. Como o
   * ficheiro passou a ser gerado, esse número é uma medição — e uma medição
   * envelhece. Este teste não exige exatidão ao byte; exige que não derive
   * tanto que a página passe a mentir.
   */
  function anunciado(href: string): number {
    const doCatalogo = documents.find((d) => d.file.href === href);
    expect(doCatalogo, `${href} tem de estar no catálogo`).toBeDefined();
    return doCatalogo!.file.bytes;
  }

  function medir(texto: string): number {
    return Buffer.byteLength(texto, 'utf8');
  }

  it('o CSV do orçamento está perto do que se anuncia', () => {
    // +1 pelo BOM que a rota põe à cabeça.
    const real = medir(orcamentoEmCsv(budget2026)) + 3;
    const dito = anunciado('/dados/orcamento-2026.csv');
    expect(
      Math.abs(real - dito) / dito,
      `servido ${real} B, anunciado ${dito} B — atualize o bytes no catálogo`,
    ).toBeLessThan(0.25);
  });

  it('o JSON das ocorrências está perto do que se anuncia', () => {
    const real = medir(`${JSON.stringify(ocorrenciasEmJson(2026), null, 2)}\n`);
    const dito = anunciado('/dados/ocorrencias-2026.json');
    expect(
      Math.abs(real - dito) / dito,
      `servido ${real} B, anunciado ${dito} B — atualize o bytes no catálogo`,
    ).toBeLessThan(0.25);
  });

  it('o orçamento anuncia o mesmo tamanho nos dois sítios onde aparece', () => {
    const noOrcamento = budget2026.documents.find(
      (f) => f.href === '/dados/orcamento-2026.csv',
    );
    expect(noOrcamento?.bytes).toBe(anunciado('/dados/orcamento-2026.csv'));
  });
});
