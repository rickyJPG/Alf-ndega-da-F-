import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname } from 'node:path';
import type { ReadableOptions } from 'node:stream';
import { NextResponse } from 'next/server';

import { caminhoSeguro } from '@/lib/admin/armazem';

/**
 * Serve os ficheiros carregados pelo painel.
 *
 * Existe porque `public/` não serve: o Next serve essa pasta a partir da
 * lista feita durante a compilação, e um ficheiro escrito depois do arranque
 * devolve 404 na mesma. Aqui é o contrário — lê-se o disco a cada pedido, e
 * uma fotografia carregada há dois segundos aparece logo.
 *
 * Lê em fluxo, sem carregar o ficheiro inteiro para memória: um PDF de 25 MB
 * pedido por dez pessoas ao mesmo tempo não pode ser 250 MB de RAM.
 */

export const dynamic = 'force-dynamic';

const TIPOS: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.csv': 'text/csv; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.zip': 'application/zip',
};

export async function GET(
  _pedido: Request,
  { params }: { params: Promise<{ caminho: string[] }> },
) {
  const { caminho: partes } = await params;
  const relativo = partes.map(decodeURIComponent).join('/');

  const absoluto = caminhoSeguro(relativo);
  if (!absoluto) {
    // Tentativa de sair da pasta. Responde-se como se não existisse: não há
    // razão para confirmar a quem tenta que o caminho até faria sentido.
    return new NextResponse('Não encontrado', { status: 404 });
  }

  let informacao;
  try {
    informacao = await stat(absoluto);
  } catch {
    return new NextResponse('Não encontrado', { status: 404 });
  }
  if (!informacao.isFile()) {
    return new NextResponse('Não encontrado', { status: 404 });
  }

  const extensao = extname(absoluto).toLowerCase();
  const tipo = TIPOS[extensao];

  // Só se servem os formatos que o painel aceita. Sem esta lista, um
  // ficheiro qualquer que fosse parar à pasta era servido com o tipo que
  // calhasse — e um .html servido daqui corria no domínio do portal.
  if (!tipo) {
    return new NextResponse('Não encontrado', { status: 404 });
  }

  const fluxo = createReadStream(absoluto) as unknown as ReadableOptions & {
    [Symbol.asyncIterator](): AsyncIterableIterator<Buffer>;
  };

  return new NextResponse(
    new ReadableStream({
      async start(controlador) {
        try {
          for await (const bloco of fluxo) controlador.enqueue(bloco);
          controlador.close();
        } catch (erro) {
          controlador.error(erro);
        }
      },
    }),
    {
      headers: {
        'Content-Type': tipo,
        'Content-Length': String(informacao.size),
        // Conteúdo que muda quando a redação o substitui: o navegador
        // guarda, mas volta a perguntar se mudou. Sem isto, uma fotografia
        // trocada ficava a antiga no ecrã de quem já a tinha visto.
        'Cache-Control': 'public, max-age=0, must-revalidate',
        ETag: `"${informacao.size}-${informacao.mtimeMs}"`,
        'X-Content-Type-Options': 'nosniff',
      },
    },
  );
}
