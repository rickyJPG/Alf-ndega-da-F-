import { Icon } from '@/components/ui/icon';
import { Brasao } from '@/components/layout/brasao';

/**
 * Ecrã mostrado a quem abre o portal enquanto o interruptor de emergência
 * está ligado (ver `src/lib/admin/bloqueio.ts`).
 *
 * Fica claramente identificável como uma pausa, não como um erro nem como o
 * portal fora do ar por avaria — quem o vir (tipicamente, um interessado que
 * já teve acesso à demonstração) percebe que o acesso foi retirado de
 * propósito, sem que isso pareça um sítio partido.
 *
 * `DEMO_CONTACTO` é opcional: quando definida, mostra-se como forma de
 * retomar a conversa. Sem ela, o ecrã fica sem inventar nenhum contacto.
 */
export function PortalBloqueado() {
  const contacto = process.env.DEMO_CONTACTO;

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-alt px-4">
      <div className="w-full max-w-md rounded-lg border border-line bg-surface p-8 text-center shadow-[var(--shadow-2)]">
        <Brasao size={56} className="mx-auto text-ink" />

        <h1 className="mt-5 font-serif text-2xl font-semibold text-ink">
          Acesso temporariamente suspenso
        </h1>

        <p className="mt-3 text-ink-muted">
          Este endereço não está disponível neste momento.
        </p>

        {contacto ? (
          <p className="mt-6 flex items-center justify-center gap-2 text-sm text-ink-muted">
            <Icon name="mail" size={16} className="shrink-0" />
            {contacto}
          </p>
        ) : null}
      </div>
    </div>
  );
}
