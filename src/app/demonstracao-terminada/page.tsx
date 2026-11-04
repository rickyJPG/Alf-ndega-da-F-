import type { Metadata } from 'next';

import { DemonstracaoTerminada } from '@/components/layout/demonstracao-terminada';

/**
 * O ecrã que o portal inteiro mostra depois de a demonstração terminar.
 *
 * Vive numa rota própria, fora de `/[locale]`, porque é a middleware que o
 * serve: ela reescreve para aqui **todos** os pedidos de páginas quando o
 * prazo passa. Ver `src/middleware.ts`.
 *
 * Porquê pela middleware e não dentro do layout público: as páginas do
 * portal são geradas na compilação, e uma página gerada não volta a
 * perguntar as horas. Sem a middleware, a demonstração só terminaria na
 * próxima vez que alguém recompilasse o portal — ou seja, nunca, porque
 * quem faz a demonstração não está a recompilar nada. A middleware corre a
 * cada pedido e lê as variáveis de ambiente do servidor, por isso é o único
 * sítio onde um prazo pode mesmo acabar sozinho.
 *
 * `force-dynamic` pela mesma razão: esta página não pode ficar em cache com
 * uma resposta de ontem.
 */

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Demonstração terminada',
  robots: { index: false, follow: false },
};

export default function PaginaDeDemonstracaoTerminada() {
  return (
    <html lang="pt-PT">
      <body>
        <DemonstracaoTerminada />
      </body>
    </html>
  );
}
