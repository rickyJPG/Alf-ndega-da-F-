import { existsSync } from 'node:fs';
import { join, normalize } from 'node:path';

/**
 * Onde ficam os ficheiros carregados pelo painel.
 *
 * **Não** em `public/`. O Next serve essa pasta a partir da lista que fez
 * durante a compilação: um ficheiro lá escrito depois do arranque existe no
 * disco e devolve 404 na mesma. O painel dizia «Fotografia carregada» e o
 * munícipe via uma imagem partida — o pior tipo de avaria, porque não deixa
 * rasto em lado nenhum.
 *
 * Por isso os carregamentos vão para `conteudo/ficheiros/`, ao lado do resto
 * do que a redação escreve, e são servidos pela rota `/ficheiros/…`
 * (`src/app/ficheiros/[...caminho]/route.ts`). Duas vantagens de repente:
 * funcionam sem recompilar, e as cópias de segurança passam a ser uma pasta
 * só — `conteudo/`.
 */

export const RAIZ_DOS_FICHEIROS = join(process.cwd(), 'conteudo', 'ficheiros');

/** O prefixo por que estes ficheiros são servidos. */
export const PREFIXO = '/ficheiros/';

/**
 * Converte um caminho relativo num caminho absoluto dentro do armazém,
 * ou devolve `null` se tentar sair de lá.
 *
 * O caminho vem de conteúdo editável e, na rota, do endereço pedido pelo
 * navegador: um `..` pelo meio não pode servir para ler `/etc/passwd` nem
 * o `.env.local` com a palavra-passe do painel.
 */
export function caminhoSeguro(relativo: string): string | null {
  if (!relativo || relativo.includes('\0')) return null;

  const limpo = normalize(relativo).replace(/^[/\\]+/, '');
  const absoluto = join(RAIZ_DOS_FICHEIROS, limpo);

  // `join` já resolve os `..`; o que resta é confirmar onde se chegou.
  if (absoluto !== RAIZ_DOS_FICHEIROS && !absoluto.startsWith(RAIZ_DOS_FICHEIROS + '/')) {
    return null;
  }
  return absoluto;
}

/** O endereço público de um ficheiro do armazém. */
export function enderecoDe(relativo: string): string {
  return PREFIXO + relativo.replace(/^[/\\]+/, '');
}

/** Um endereço `/ficheiros/…` aponta para um ficheiro que existe mesmo? */
export function existeNoArmazem(endereco: string): boolean {
  if (!endereco.startsWith(PREFIXO)) return false;
  const caminho = caminhoSeguro(endereco.slice(PREFIXO.length));
  return caminho !== null && existsSync(caminho);
}
