import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { temSessao } from '@/lib/admin/sessao';
import { sair } from './acoes';
import { ManterSessao } from './manter-sessao';
import { demonstracaoTerminada } from '@/lib/demo';
import { DemonstracaoTerminada } from '@/components/layout/demonstracao-terminada';
import { NavegacaoDoPainel } from './navegacao';

import '@/styles/globals.css';

/**
 * Painel de administração — o sítio onde a equipa do Município trata do
 * portal sem tocar em código.
 *
 * Usa a mesma linguagem visual do portal (a banda vermelha, o logótipo, as
 * fontes) para que ninguém sinta que saiu de casa. Mas é claramente outro
 * lugar: a barra diz «Administração» e há sempre uma ligação para ver o
 * portal como o munícipe o vê.
 */

export const metadata: Metadata = {
  title: 'Administração — Município de Alfândega da Fé',
  robots: { index: false, follow: false },
};

export default async function LayoutDoPainel({ children }: { children: React.ReactNode }) {
  // Passado o prazo da demonstração, o painel fecha como o portal.
  //
  // Ao contrário do interruptor de emergência — que deixa `/admin` sempre
  // acessível, para se poder desligar —, aqui não há nada para desligar de
  // dentro: o prazo acabou. Quem precisar de reabrir muda `DEMO_VALIDO_ATE`
  // no servidor, que é onde a decisão foi tomada.
  if (demonstracaoTerminada()) {
    return (
      <html lang="pt-PT" data-theme="light">
        <body className="min-h-screen bg-surface-alt">
          <DemonstracaoTerminada />
        </body>
      </html>
    );
  }

  const autenticada = await temSessao();

  return (
    <html lang="pt-PT" data-theme="light">
      <body className="min-h-screen bg-surface-alt">
        <a href="#conteudo-do-painel" className="sr-only focus:not-sr-only">
          Saltar para o conteúdo
        </a>

        {/* Só com sessão aberta: no ecrã de entrada não há nada para manter,
            e o pedido seria desperdiçado. */}
        {autenticada ? <ManterSessao /> : null}

        {autenticada ? (
          <header>
            <div className="bg-accent-600">
              <div className="mx-auto flex max-w-[80rem] flex-wrap items-center justify-between gap-4 px-4 py-3">
                <Link href="/admin" className="flex items-center gap-3 no-underline">
                  <Image
                    src="/images/logotipo-branco.png"
                    alt=""
                    width={639}
                    height={256}
                    className="h-10 w-auto self-start"
                  />
                  <span className="text-sm font-semibold tracking-wide text-white uppercase">
                    Administração
                  </span>
                </Link>

                <div className="flex items-center gap-2">
                  <Link
                    href="/"
                    target="_blank"
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-white/40 px-3 text-sm font-medium text-white no-underline hover:bg-white/10"
                  >
                    Ver o portal
                  </Link>
                  <form action={sair}>
                    <button
                      type="submit"
                      className="inline-flex min-h-10 items-center rounded-md bg-white px-3 text-sm font-semibold text-accent-700 hover:bg-white/90"
                    >
                      Sair
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <NavegacaoDoPainel />
          </header>
        ) : null}

        <main id="conteudo-do-painel" className="mx-auto max-w-[80rem] px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
