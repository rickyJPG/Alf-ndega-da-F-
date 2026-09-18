#!/usr/bin/env node
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Gera um PDF por cada documento do catálogo de exemplo.
 *
 * O catálogo vem cheio e `public/documentos/` vem vazia, por isso todos os
 * descarregamentos do portal ficariam por publicar. Numa demonstração, vinte
 * documentos que não abrem dão a ideia errada do que o portal faz.
 *
 * Os PDF gerados **dizem em cima o que são**: modelos de demonstração, sem
 * valor legal. Não se faz passar por formulários verdadeiros um ficheiro
 * inventado — num portal de uma câmara municipal, isso seria pior do que não
 * ter ficheiro nenhum.
 *
 * Nunca substitui um ficheiro já existente: quando o Município carregar os
 * documentos verdadeiros pelo painel, correr isto outra vez não os apaga.
 *
 * Escrito à mão, sem biblioteca: um PDF é um formato de texto com uma tabela
 * de posições no fim, e gerar um de uma página não justifica uma dependência.
 */

const RAIZ = process.cwd();
const DESTINO = join(RAIZ, 'public', 'documentos');

/**
 * Troca os sinais tipográficos que o Latin-1 não tem.
 *
 * A fonte Helvetica base do PDF só chega ao Latin-1, e um travessão ou umas
 * aspas curvas — que aparecem por todo o conteúdo do portal — sairiam como
 * um byte trocado ou como um espaço em branco no meio da frase. Os acentos
 * portugueses cabem todos no Latin-1 e passam intactos.
 */
function normalizarParaLatin1(texto) {
  return texto
    .replace(/[—–]/g, '-')
    .replace(/[“”„]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, '...')
    .replace(/[«»]/g, '"')
    .replace(/ /g, ' ');
}

/** Escapa o que tem significado dentro de uma cadeia de texto de PDF. */
function escapar(texto) {
  return normalizarParaLatin1(texto).replace(/[\\()]/g, (c) => `\\${c}`);
}

/**
 * Converte para Latin-1, que é o que a fonte Helvetica base do PDF usa.
 * Sem isto, «Alfândega» sairia com caracteres trocados.
 */
function paraLatin1(texto) {
  return Buffer.from(normalizarParaLatin1(texto), 'latin1');
}

/** Parte um texto em linhas que caibam na largura dada, em caracteres. */
function quebrar(texto, maximo) {
  const linhas = [];
  let atual = '';
  for (const palavra of texto.split(/\s+/)) {
    if (atual && `${atual} ${palavra}`.length > maximo) {
      linhas.push(atual);
      atual = palavra;
    } else {
      atual = atual ? `${atual} ${palavra}` : palavra;
    }
  }
  if (atual) linhas.push(atual);
  return linhas;
}

function gerarPdf({ titulo, resumo, tipo }) {
  const corpo = [
    { t: 'MODELO DE DEMONSTRAÇÃO — SEM VALOR LEGAL', y: 780, tamanho: 10, fonte: 'F2' },
    { t: 'Município de Alfândega da Fé', y: 740, tamanho: 18, fonte: 'F2' },
    ...quebrar(titulo, 48).map((linha, i) => ({
      t: linha,
      y: 700 - i * 22,
      tamanho: 15,
      fonte: 'F2',
    })),
  ];

  let y = 700 - quebrar(titulo, 48).length * 22 - 20;
  if (resumo) {
    for (const linha of quebrar(resumo, 78)) {
      corpo.push({ t: linha, y, tamanho: 11, fonte: 'F1' });
      y -= 16;
    }
    y -= 10;
  }

  corpo.push({ t: `Tipo de documento: ${tipo}`, y, tamanho: 10, fonte: 'F1' });
  y -= 30;

  for (const linha of quebrar(
    'Este ficheiro foi gerado para a demonstração do portal e não substitui o documento oficial. ' +
      'O documento verdadeiro é carregado pelo Município através do painel de administração, em Documentos.',
    78,
  )) {
    corpo.push({ t: linha, y, tamanho: 10, fonte: 'F1' });
    y -= 14;
  }

  const fluxo =
    'BT\n' +
    corpo
      .map(
        ({ t, y: posY, tamanho, fonte }) =>
          `/${fonte} ${tamanho} Tf 1 0 0 1 60 ${posY} Tm (${escapar(t)}) Tj`,
      )
      .join('\n') +
    '\nET';

  const fluxoBytes = paraLatin1(fluxo);

  const objetos = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] ' +
      '/Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${fluxoBytes.length} >>\nstream\n${fluxo}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
  ];

  let pdf = '%PDF-1.4\n';
  const posicoes = [];
  for (const [indice, objeto] of objetos.entries()) {
    posicoes.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += `${indice + 1} 0 obj\n${objeto}\nendobj\n`;
  }

  const inicioTabela = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`;
  for (const posicao of posicoes) {
    pdf += `${String(posicao).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${inicioTabela}\n%%EOF\n`;

  return paraLatin1(pdf);
}

/* ------------------------------------------------------------------------ */

const { documents } = await import('../src/content/data/documents.ts').catch(() => ({}));

if (!documents) {
  console.error(
    'Não foi possível ler o catálogo. Corra através de `npm run documentos-exemplo`,\n' +
      'que trata da compilação do TypeScript.',
  );
  process.exit(1);
}

mkdirSync(DESTINO, { recursive: true });

let gerados = 0;
let mantidos = 0;

for (const documento of documents) {
  if (!documento.file?.href?.startsWith('/documentos/')) continue;

  const nome = documento.file.href.slice('/documentos/'.length);
  const caminho = join(DESTINO, nome);

  if (existsSync(caminho)) {
    mantidos += 1;
    continue;
  }
  if (!nome.toLowerCase().endsWith('.pdf')) continue;

  writeFileSync(
    caminho,
    gerarPdf({
      titulo: documento.title.pt,
      resumo: documento.summary?.pt ?? '',
      tipo: documento.type,
    }),
  );
  gerados += 1;
}

console.log(
  `Documentos de demonstração: ${gerados} gerados, ${mantidos} mantidos por já existirem.\n` +
    'Todos dizem em cima que são modelos sem valor legal.',
);
