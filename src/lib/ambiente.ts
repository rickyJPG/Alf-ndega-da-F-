/**
 * Páginas que só existem em desenvolvimento.
 *
 * O guia de estilo é uma ferramenta de quem constrói o portal: mostra todos
 * os componentes num sítio só, com as cores e os estados de foco à vista.
 * Não tem nada a dizer a um munícipe, e não devia estar ao alcance de
 * ninguém em produção.
 *
 * Estava, com 200 e tudo. O que a escondia era uma linha de `Disallow` no
 * `robots.txt` — que é um pedido aos motores de busca, não um controlo de
 * acesso: nada impede que alguém escreva o endereço, e nada impede um
 * rastreador que ignore o ficheiro. Esconder não é proteger.
 *
 * `NODE_ENV !== 'production'` em vez de `=== 'development'` de propósito:
 * qualquer ambiente que não seja produção comporta-se como desenvolvimento,
 * e o que interessa garantir é o lado de produção. O `next dev` põe
 * `development`, o `next build` e o `next start` põem `production`, e o
 * Vitest põe `test`.
 */
export function ehAmbienteDeDesenvolvimento(): boolean {
  return process.env.NODE_ENV !== 'production';
}
