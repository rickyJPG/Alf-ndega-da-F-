import Image from 'next/image';
import { redirect } from 'next/navigation';

import { palavraPasseConfigurada, temSessao } from '@/lib/admin/sessao';
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

      {!palavraPasseConfigurada() ? (
        <div
          className="mb-6 rounded-md border border-s-4 border-warning bg-warning-surface p-4 text-sm"
          role="status"
        >
          <p className="font-semibold">Palavra-passe por configurar</p>
          <p className="mt-1">
            A variável <code>ADMIN_PASSWORD</code> não está definida. Foi gerada uma palavra-passe
            temporária, escrita no registo do servidor. Defina-a antes de pôr o portal no ar.
          </p>
        </div>
      ) : null}

      <FormularioDeEntrada />
    </div>
  );
}
