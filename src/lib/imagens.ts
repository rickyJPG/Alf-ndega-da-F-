import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fotosDoMunicipio } from './fotos-do-municipio';

/**
 * Resolve a fotografia de cada posição do portal.
 *
 * O conteúdo indica sempre a posição (`/images/visitar/cereja.svg`). Esta
 * função, que corre só no servidor, decide o que serve, por esta ordem:
 *
 *   1. **ficheiro local** em public/images com o mesmo nome (.jpg, .png,
 *      .webp) — é o que manda, e é assim que se substitui uma fotografia:
 *      copiar o ficheiro para a pasta, sem tocar em conteúdo nem em código;
 *   2. **fotografia do documento do Município** (src/lib/fotos-do-municipio),
 *      carregada da origem;
 *   3. **moldura de espera** .svg, se a posição ainda não tiver fotografia.
 *
 * `npm run fotos` faz o passo 1 de uma vez. Em desenvolvimento, ficheiros
 * novos são detetados no reinício do servidor.
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

/** A fotografia a mostrar nesta posição. */
export function fotoReal(src: string): string {
  if (!src.startsWith('/images/') || !src.endsWith('.svg')) return src;

  const semExtensao = src.slice('/images/'.length, -'.svg'.length);
  const ficheiros = listar();
  for (const extensao of EXTENSOES) {
    if (ficheiros.has(semExtensao + extensao)) return `/images/${semExtensao}${extensao}`;
  }

  return fotosDoMunicipio[src] ?? src;
}

/**
 * Verdadeiro quando a fotografia vem de fora.
 *
 * Nesse caso é o navegador que a vai buscar diretamente à origem, em vez de
 * passar pelo otimizador do Next: assim o portal mostra a fotografia mesmo
 * quando o servidor não tem saída para a internet, e o pedido parte de um
 * navegador normal — que é o que a maioria das origens espera.
 */
export function ehFotoExterna(src: string): boolean {
  return src.startsWith('http://') || src.startsWith('https://');
}
