import { budgetYears } from '@/content/data/budget';
import { hojeIso } from '@/content/data/clock';
import { occurrences } from '@/content/data/services-operational';
import { tx, type BudgetYear, type Occurrence } from '@/content/types';
import { site } from '@/lib/site';

/**
 * Dados abertos, gerados a partir das mesmas fontes que as páginas mostram.
 *
 * Antes eram dois ficheiros estáticos em `public/dados/` que **nunca
 * existiram**: não estavam versionados e o gerador de exemplos salta tudo o
 * que não é PDF. A página de Dados Abertos oferecia dois botões e os dois
 * davam 404 — numa página cujo único propósito é descarregar.
 *
 * Gerar em vez de guardar resolve mais do que o 404. Um CSV escrito à mão
 * começa certo e envelhece: corrige-se um montante no orçamento, a página
 * mostra o número novo e o ficheiro continua a distribuir o antigo. Quem
 * trabalha com os dados fica com uma versão que nenhuma página confirma, e
 * ninguém dá por isso. Derivando da fonte, a divergência deixa de ser
 * possível.
 *
 * A licença e a atribuição são as que a própria página declara (CC BY 4.0,
 * «Fonte: Município de Alfândega da Fé»). Vão dentro dos ficheiros porque um
 * CSV descarregado chega ao destino sem a página que o explicava.
 */

export const LICENCA = 'CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/deed.pt)';
export const ATRIBUICAO = `Fonte: ${site.name}`;

/**
 * Os nomes que esta rota serve.
 *
 * Ficam aqui, e não no `route.ts`, porque há dois sítios que precisam de
 * concordar: a rota, para saber o que servir, e `ficheiroExiste()`, para
 * saber se vale a pena mostrar o botão. Duas cópias do mesmo padrão
 * acabariam por divergir, e a divergência seria um botão que aparece e dá
 * 404 — ou, pior, um ficheiro que existe e que nenhuma página oferece.
 */
export const NOME_DO_ORCAMENTO = /^orcamento-(\d{4})\.csv$/;
export const NOME_DAS_OCORRENCIAS = /^ocorrencias-(\d{4})\.json$/;
export const PREFIXO_DOS_DADOS = '/dados/';

export function encontrarAnoDoOrcamento(ano: number): BudgetYear | undefined {
  return budgetYears.find((candidato) => candidato.year === ano);
}

/**
 * Há dados para servir neste endereço?
 *
 * É o que `ficheiroExiste()` chama para os endereços `/dados/…`. Sem isto,
 * aquela função ia procurá-los em `public/` — onde nunca estarão, porque são
 * gerados — e esconderia os botões todos, que é precisamente o contrário do
 * que esta correção faz.
 *
 * Mas também não diz «sim» a tudo: um `orcamento-2031.csv` continua a ser
 * escondido enquanto não houver orçamento de 2031, em vez de oferecer um
 * descarregamento vazio.
 */
export function dadosAbertosDisponiveis(href: string): boolean {
  if (!href.startsWith(PREFIXO_DOS_DADOS)) return false;
  const nome = href.slice(PREFIXO_DOS_DADOS.length);

  const orcamento = NOME_DO_ORCAMENTO.exec(nome);
  if (orcamento) return encontrarAnoDoOrcamento(Number(orcamento[1])) !== undefined;

  // As ocorrências de qualquer ano são servíveis — mesmo que o ano não tenha
  // nenhuma, o ficheiro é válido e diz `total: 0`.
  return NOME_DAS_OCORRENCIAS.test(nome);
}

/* ------------------------------------------------------------------ CSV -- */

/**
 * Uma célula de CSV conforme a RFC 4180.
 *
 * Não é zelo desnecessário: «Água, saneamento e resíduos» é uma das
 * categorias do orçamento, e sem aspas essa vírgula partia a linha em duas.
 */
function celula(valor: string | number): string {
  const texto = String(valor);
  return /[",\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

function linha(campos: (string | number)[]): string {
  return campos.map(celula).join(',');
}

const COLUNAS = [
  'ano',
  'nivel',
  'categoria_id',
  'categoria',
  'rubrica',
  'montante_eur',
  'montante_anterior_eur',
  'variacao_eur',
  'variacao_pct',
] as const;

function variacaoPct(atual: number, anterior: number): string {
  if (anterior === 0) return '';
  // Uma casa decimal, com ponto: é um ficheiro para ferramentas, e o
  // separador decimal português partiria qualquer leitor que espere RFC 4180.
  return (((atual - anterior) / anterior) * 100).toFixed(1);
}

export function orcamentoEmCsv(ano: BudgetYear): string {
  const linhas: string[] = [];

  // Comentários antes do cabeçalho: quase todos os leitores de CSV os
  // ignoram com `comment='#'`, e quem abre o ficheiro num editor percebe
  // logo de onde veio e o que pode fazer com ele.
  linhas.push(`# Orçamento ${ano.year} — ${site.name}`);
  linhas.push(`# ${ATRIBUICAO}`);
  linhas.push(`# Licença: ${LICENCA}`);
  linhas.push(`# Gerado a partir do orçamento publicado no portal em ${hojeIso()}`);
  linhas.push(`# Despesa total: ${ano.expense} EUR (${ano.year}), ${ano.previousExpense} EUR (${ano.year - 1})`);
  linhas.push(`# Habitantes considerados: ${ano.inhabitants}`);
  linhas.push('#');

  linhas.push(linha([...COLUNAS]));

  for (const categoria of ano.categories) {
    linhas.push(
      linha([
        ano.year,
        'categoria',
        categoria.id,
        tx(categoria.label, 'pt'),
        '',
        categoria.amount,
        categoria.previousAmount,
        categoria.amount - categoria.previousAmount,
        variacaoPct(categoria.amount, categoria.previousAmount),
      ]),
    );

    for (const rubrica of categoria.children ?? []) {
      linhas.push(
        linha([
          ano.year,
          'rubrica',
          categoria.id,
          tx(categoria.label, 'pt'),
          tx(rubrica.label, 'pt'),
          rubrica.amount,
          rubrica.previousAmount,
          rubrica.amount - rubrica.previousAmount,
          variacaoPct(rubrica.amount, rubrica.previousAmount),
        ]),
      );
    }
  }

  // CRLF é o que a RFC 4180 manda, e é o que o Excel espera.
  return `${linhas.join('\r\n')}\r\n`;
}

/* ----------------------------------------------------------------- JSON -- */

export interface OcorrenciasAbertas {
  titulo: string;
  fonte: string;
  licenca: string;
  atribuicao: string;
  gerado_em: string;
  ano: number;
  total: number;
  nota: string;
  ocorrencias: Occurrence[];
}

/**
 * As ocorrências de um ano, sem dados pessoais.
 *
 * O tipo `Occurrence` não guarda nome, contacto nem morada de quem
 * participou — só o que o serviço precisa de mostrar publicamente: categoria,
 * freguesia, data, estado e a resposta dada. É o que a página promete («Sem
 * dados pessoais») e convém que continue a ser verdade se o tipo crescer.
 */
export function ocorrenciasEmJson(ano: number): OcorrenciasAbertas {
  const doAno = [...occurrences]
    .filter((ocorrencia) => ocorrencia.reportedAt.startsWith(String(ano)))
    .sort((a, b) => b.reportedAt.localeCompare(a.reportedAt));

  return {
    titulo: `Ocorrências comunicadas em ${ano}`,
    fonte: site.name,
    licenca: LICENCA,
    atribuicao: ATRIBUICAO,
    gerado_em: hojeIso(),
    ano,
    total: doAno.length,
    nota: 'Sem dados pessoais: não consta a identificação de quem comunicou a ocorrência.',
    ocorrencias: doAno,
  };
}
