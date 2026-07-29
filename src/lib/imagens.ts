import { readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Troca automática dos substitutos pelas fotografias reais.
 *
 * Os conteúdos referem sempre o substituto (`/images/….svg`). Esta função,
 * que corre apenas no servidor, verifica UMA vez que ficheiros existem em
 * `public/images` e devolve a fotografia real (`.jpg`, `.png`, …) com o mesmo
 * nome quando ela lá estiver. Assim, pôr as fotografias em produção é copiar
 * ficheiros para a pasta — nenhum conteúdo precisa de ser editado.
 *
 * `npm run fotos` descarrega as fotografias aprovadas para os sítios certos
 * (ver scripts/obter-fotos.mjs). Em desenvolvimento, ficheiros novos são
 * detetados no reinício do servidor.
 */

const EXTENSOES = ['.jpg', '.jpeg', '.png', '.webp'] as const;

let existentes: Set<string> | null = null;

function listar(): Set<string> {
  if (existentes) return existentes;
  const raiz = join(process.cwd(), 'public', 'images');
  const encontrados = new Set<string>();
  const percorrer = (dir: string, prefixo: string) => {
    let entradas;
    try {
      entradas = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entrada of entradas) {
      if (entrada.isDirectory()) percorrer(join(dir, entrada.name), `${prefixo}${entrada.name}/`);
      else encontrados.add(prefixo + entrada.name);
    }
  };
  percorrer(raiz, '');
  existentes = encontrados;
  return encontrados;
}

/** Devolve a fotografia real se existir; caso contrário, o substituto. */
export function fotoReal(src: string): string {
  if (!src.startsWith('/images/') || !src.endsWith('.svg')) return src;
  const semExtensao = src.slice('/images/'.length, -'.svg'.length);
  const ficheiros = listar();
  for (const extensao of EXTENSOES) {
    if (ficheiros.has(semExtensao + extensao)) return `/images/${semExtensao}${extensao}`;
  }
  return src;
}
