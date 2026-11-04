import { Icon } from '@/components/ui/icon';
import type { Dictionary } from '@/i18n';
import { diasQueFaltam, emDemonstracao } from '@/lib/demo';

/**
 * A faixa que marca todas as páginas públicas como demonstração.
 *
 * Tem de ser as duas coisas ao mesmo tempo: **discreta**, para não estragar
 * a demonstração que se está a fazer, e **inequívoca**, para que ninguém
 * saia dali a pensar que viu o sítio oficial do Município. Daí a barra
 * estreita, de cor própria, sempre no topo e sempre presente — não se fecha
 * nem se esconde ao rolar a página.
 *
 * Acessibilidade: é um `role="note"` com rótulo próprio, para que um leitor
 * de ecrã o anuncie como uma nota sobre a página e não como navegação. O
 * texto está nos quatro dicionários — um visitante que escolha inglês não
 * deve ficar sem o aviso. A frase longa fica visível no ecrã largo e
 * disponível aos leitores de ecrã em todos: num telemóvel, duas linhas de
 * aviso empurravam a página inteira para baixo.
 */
export function FaixaDeDemonstracao({ dict }: { dict: Dictionary }) {
  if (!emDemonstracao()) return null;

  const dias = diasQueFaltam();

  return (
    <div
      role="note"
      aria-label={dict.common.demoBanner}
      className="border-b border-amber-700/40 bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-100"
    >
      <p className="container-page flex flex-wrap items-center gap-x-2.5 gap-y-1 py-1.5 text-sm">
        <Icon name="info" size={16} className="shrink-0" aria-hidden="true" />
        <strong className="font-semibold">{dict.common.demoBanner}</strong>

        {/* Visível onde cabe; sempre disponível a quem usa leitor de ecrã. */}
        <span className="sr-only sm:not-sr-only sm:inline">{dict.common.demoBannerLead}</span>

        {dias !== null && dias >= 0 ? (
          <span className="ms-auto shrink-0 tabular-nums">
            {dias === 0 ? 'Último dia' : dias === 1 ? 'Falta 1 dia' : `Faltam ${dias} dias`}
          </span>
        ) : null}
      </p>
    </div>
  );
}
