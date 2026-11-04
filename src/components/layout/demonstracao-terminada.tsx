import { Icon } from '@/components/ui/icon';
import { Brasao } from '@/components/layout/brasao';
import { contactoDaDemo, validoAte } from '@/lib/demo';
import { formatDate } from '@/lib/format';

/**
 * Ecrã único que o portal mostra depois de a demonstração terminar.
 *
 * Diferente do ecrã de bloqueio manual (`portal-bloqueado.tsx`): aquele é
 * uma pausa que alguém ligou e pode desligar; este é um prazo que acabou, e
 * diz isso por palavras. Quem o vir não fica a pensar que o sítio avariou.
 *
 * Só em português. É o ecrã de uma demonstração a um município português,
 * e traduzi-lo para quatro línguas seria manter quatro textos que ninguém
 * vai ler — enquanto a faixa de demonstração, essa sim, aparece em todas as
 * páginas e vai traduzida.
 */
export function DemonstracaoTerminada() {
  const contacto = contactoDaDemo();
  const limite = validoAte();

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-alt px-4 py-10">
      <div className="w-full max-w-md rounded-lg border border-line bg-surface p-8 text-center shadow-[var(--shadow-2)]">
        <Brasao size={56} className="mx-auto text-ink" />

        <p className="mt-5 inline-flex items-center gap-1.5 rounded-pill border border-line-strong px-3 py-1 text-xs font-semibold tracking-wide uppercase text-ink-muted">
          <Icon name="clock" size={14} />
          Demonstração
        </p>

        <h1 className="mt-4 font-serif text-2xl font-semibold text-ink">
          Demonstração terminada
        </h1>

        <p className="mt-3 text-ink-muted">
          Este endereço mostrava uma demonstração do portal do Município de
          Alfândega da Fé. O período de demonstração chegou ao fim
          {limite ? ` a ${formatDate(limite)}` : ''} e o acesso foi encerrado.
        </p>

        <p className="mt-3 text-sm text-ink-muted">
          Não era o sítio oficial do Município, e nenhum dos conteúdos que aqui
          esteve deve ser tomado como informação oficial.
        </p>

        {contacto ? (
          <p className="mt-6 border-t border-line pt-5 text-sm text-ink">
            <span className="block font-semibold">Para retomar a conversa</span>
            <span className="mt-1.5 inline-flex items-center justify-center gap-2 text-ink-muted">
              <Icon name="mail" size={16} className="shrink-0" />
              {contacto}
            </span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
