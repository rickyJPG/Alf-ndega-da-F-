import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { cache } from 'react';
import { fotosDoMunicipio } from './fotos-do-municipio';
import { enderecoDe, RAIZ_DOS_FICHEIROS } from './admin/armazem';

/**
 * Resolve a fotografia de cada posição do portal.
 *
 * O conteúdo indica sempre a posição (`/images/visitar/cereja.svg`). Esta
 * função, que corre só no servidor, decide o que serve, por esta ordem:
 *
 *   1. **carregada pelo painel**, em conteudo/ficheiros/imagens — é o que
 *      manda, e é assim que a redação troca uma fotografia;
 *   2. **ficheiro em public/images** com o mesmo nome, copiado à mão antes
 *      de uma compilação;
 *   3. **fotografia do documento do Município** (src/lib/fotos-do-municipio),
 *      carregada da origem;
 *   4. **moldura de espera** .svg, se a posição ainda não tiver fotografia.
 *
 * Porque é que o que vem do painel não vai para public/: o Next serve essa
 * pasta a partir da lista feita durante a compilação, e um ficheiro lá
 * escrito depois do arranque devolve 404 na mesma. Ver src/lib/admin/armazem.
 *
 * `cache()` do React guarda a listagem durante um render, e só durante esse.
 * Uma variável de módulo guardava-a para toda a vida do processo, e uma
 * fotografia carregada ficava invisível até alguém reiniciar o servidor.
 */

const EXTENSOES = ['.jpg', '.jpeg', '.png', '.webp'] as const;

/**
 * As fotografias que estão neste momento em public/images.
 *
 * `cache()` do React guarda o resultado **durante um render**, e só durante
 * esse. É a diferença que interessa: uma variável de módulo guardava-o para
 * toda a vida do processo, e uma fotografia carregada pelo painel ficava
 * invisível no portal até alguém reiniciar o servidor — o painel dizia
 * «Fotografia carregada» e não mudava nada à vista.
 *
 * O custo é um `readdir` por render em vez de um por processo. A pasta tem
 * umas dezenas de ficheiros em meia dúzia de subpastas; é ruído ao lado de
 * qualquer outra coisa que aconteça no mesmo pedido.
 */
function percorrerPasta(raiz: string): Set<string> {
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
  return encontrados;
}

/** As fotografias carregadas pelo painel. */
const listar = cache((): Set<string> => percorrerPasta(join(RAIZ_DOS_FICHEIROS, 'imagens')));

/** As que estão em public/images, copiadas à mão ou vindas com o portal. */
const listarPublic = cache((): Set<string> => percorrerPasta(join(process.cwd(), 'public', 'images')));

/** A fotografia a mostrar nesta posição. */
export function fotoReal(src: string): string {
  if (!src.startsWith('/images/') || !src.endsWith('.svg')) return src;

  const semExtensao = src.slice('/images/'.length, -'.svg'.length);

  // 1. Carregada pelo painel — é a que manda.
  const carregadas = listar();
  for (const extensao of EXTENSOES) {
    if (carregadas.has(semExtensao + extensao)) {
      return enderecoDe(`imagens/${semExtensao}${extensao}`);
    }
  }

  // 2. Copiada à mão para public/images, como sempre foi possível.
  const emPublic = listarPublic();
  for (const extensao of EXTENSOES) {
    if (emPublic.has(semExtensao + extensao)) return `/images/${semExtensao}${extensao}`;
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
