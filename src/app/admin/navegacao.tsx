'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

/**
 * Navegação do painel.
 *
 * Ordenada pelo que a redação faz mais vezes, não pela arrumação interna do
 * conteúdo: notícias primeiro, avisos logo a seguir (é o que se publica com
 * pressa), depois agenda e fotografias.
 */

const SECCOES: { href: string; rotulo: string; icone: IconName }[] = [
  { href: '/admin', rotulo: 'Início', icone: 'home' },
  { href: '/admin/noticias', rotulo: 'Notícias', icone: 'megaphone' },
  { href: '/admin/avisos', rotulo: 'Avisos', icone: 'alert' },
  { href: '/admin/eventos', rotulo: 'Agenda', icone: 'calendar' },
  { href: '/admin/imagens', rotulo: 'Fotografias', icone: 'camera' },
  { href: '/admin/ajuda', rotulo: 'Ajuda', icone: 'lightbulb' },
];

export function NavegacaoDoPainel() {
  const caminho = usePathname();

  return (
    <nav aria-label="Secções da administração" className="border-b border-line bg-surface">
      <ul className="mx-auto flex max-w-[80rem] flex-wrap gap-1 px-2">
        {SECCOES.map((seccao) => {
          const ativa =
            seccao.href === '/admin' ? caminho === '/admin' : caminho.startsWith(seccao.href);

          return (
            <li key={seccao.href}>
              <Link
                href={seccao.href}
                aria-current={ativa ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-12 items-center gap-2 border-b-[3px] px-3 font-medium no-underline',
                  ativa
                    ? 'border-accent-600 text-accent-700'
                    : 'border-transparent text-ink-muted hover:border-line-strong hover:text-ink',
                )}
              >
                <Icon name={seccao.icone} size={18} />
                {seccao.rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
