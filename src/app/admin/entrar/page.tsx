import Image from 'next/image';
import { redirect } from 'next/navigation';

import { palavraPasseConfigurada, temSessao } from '@/lib/admin/sessao';
import { haContas } from '@/lib/admin/utilizadores';
import { FormularioDeEntrada } from './formulario';

/**
 * Entrada no painel.
 *
 * Se `ADMIN_PASSWORD` não estiver definida, avisa-o em cima — quem estiver a
 * instalar o portal tem de ver isso antes de o pôr no ar, não depois.
 */

export const dynamic = 'force-dynamic';

export default async function PaginaDeEntrada() {
  if (await temSessao()) redirect('/admin');

  // Com contas criadas entra-se por conta; sem elas, pela palavra-passe
  // única da instalação.
  const porConta = await haContas();

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 flex flex-col items-center gap-3 rounded-lg bg-accent-600 p-6">
        <Image
          src="/images/logotipo-branco.png"
          alt="Município de Alfândega da Fé"
          width={639}
          height={256}
          priority
          className="h-16 w-auto"
        />
        <p className="text-sm font-semibold tracking-wide text-white uppercase">Administração</p>
      </div>

      {!porConta && !palavraPasseConfigurada() ? (
        <div
          className="mb-6 rounded-md border border-s-4 border-warning bg-warning-surface p-4 text-sm"
          role="status"
        >
          <p className="font-semibold">Palavra-passe ainda não fixada</p>
          <p className="mt-1">
            Esta instalação está a usar uma palavra-passe temporária, escrita na janela onde o
            portal arrancou (linha começada por <code>[administração]</code>).{' '}
            <strong>Muda a cada reinício</strong> — e quem estiver com sessão aberta é desligado
            quando isso acontece.
          </p>
          <p className="mt-2">
            Para ficar com uma palavra-passe fixa, feche o portal e corra{' '}
            <code>npm run configurar</code>. Escreve-a em <code>.env.local</code> e nunca mais
            muda.
          </p>
        </div>
      ) : null}

      <FormularioDeEntrada porConta={porConta} />
    </div>
  );
}
