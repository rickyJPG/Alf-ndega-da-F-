import { NextResponse } from 'next/server';

import {
  encontrarAnoDoOrcamento,
  NOME_DAS_OCORRENCIAS,
  NOME_DO_ORCAMENTO,
  ocorrenciasEmJson,
  orcamentoEmCsv,
} from '@/lib/dados-abertos';

/**
 * Os ficheiros de dados abertos, servidos a partir das fontes do portal.
 *
 * Rota em vez de ficheiros em `public/`: assim o que se descarrega é sempre o
 * que as páginas mostram. Ver `src/lib/dados-abertos.ts` para o porquê.
 *
 * O nome do ficheiro leva o ano e é ele que escolhe os dados —
 * `orcamento-2027.csv` passa a funcionar sozinho no dia em que houver um
 * orçamento de 2027, e devolve 404 enquanto não houver, em vez de servir
 * silenciosamente os números do ano errado.
 */

export const dynamic = 'force-dynamic';

/** Cabeçalhos comuns: descarregar, não abrir no navegador, e não guardar. */
function cabecalhos(tipo: string, nome: string): HeadersInit {
  return {
    'Content-Type': tipo,
    'Content-Disposition': `attachment; filename="${nome}"`,
    // Os dados mudam quando o portal muda. Um ficheiro em cache que já não
    // corresponde ao que a página mostra é o problema que esta rota existe
    // para resolver.
    'Cache-Control': 'public, max-age=0, must-revalidate',
    'X-Content-Type-Options': 'nosniff',
  };
}

export async function GET(
  _pedido: Request,
  { params }: { params: Promise<{ ficheiro: string }> },
) {
  const { ficheiro } = await params;
  const nome = decodeURIComponent(ficheiro);

  const pedidoDeOrcamento = NOME_DO_ORCAMENTO.exec(nome);
  if (pedidoDeOrcamento) {
    const ano = encontrarAnoDoOrcamento(Number(pedidoDeOrcamento[1]));
    if (!ano) {
      return new NextResponse('Não há orçamento publicado para esse ano.', { status: 404 });
    }

    // BOM à cabeça: sem ele, o Excel em Windows lê «Água» como «Ãgua». Os
    // leitores que seguem a RFC 4180 ignoram-no.
    return new NextResponse(`﻿${orcamentoEmCsv(ano)}`, {
      headers: cabecalhos('text/csv; charset=utf-8', nome),
    });
  }

  const pedidoDeOcorrencias = NOME_DAS_OCORRENCIAS.exec(nome);
  if (pedidoDeOcorrencias) {
    const dados = ocorrenciasEmJson(Number(pedidoDeOcorrencias[1]));
    return new NextResponse(`${JSON.stringify(dados, null, 2)}\n`, {
      headers: cabecalhos('application/json; charset=utf-8', nome),
    });
  }

  return new NextResponse('Não encontrado', { status: 404 });
}
