import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
import { emDemonstracao } from '@/lib/demo';

/**
 * Lido a cada pedido, e não fixado na compilação.
 *
 * É o que faz com que ligar `DEMO_MODE` baste para o portal deixar de se
 * oferecer aos motores de busca, sem ninguém ter de recompilar — e, mais
 * importante, com que o contrário também seja verdade: tirar a variável
 * repõe o comportamento normal no arranque seguinte. São duas respostas
 * minúsculas; torná-las dinâmicas não custa desempenho nenhum.
 */
export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  // Numa demonstração não se convida ninguém a indexar nada, e não se
  // anuncia mapa do sítio. Um portal municipal de demonstração indexado
  // passa a ser um sítio falso do Município nos resultados de pesquisa de
  // quem procura o verdadeiro — e quem o encontrasse não teria como saber
  // que não é oficial.
  if (emDemonstracao()) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // As páginas de resultados e o guia de estilo não pertencem ao índice.
        disallow: [
          '/pesquisa',
          '/en/pesquisa',
          '/es/pesquisa',
          '/fr/pesquisa',
          '/styleguide',
          '/guia-de-imagens',
          '/api/',
        ],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
