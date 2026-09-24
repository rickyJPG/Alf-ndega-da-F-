import Link from 'next/link';

import { Icon } from '@/components/ui/icon';
import { exigirEntrada } from '@/lib/admin/sessao';
import { lerContactos } from '@/lib/admin/contactos';
import { CabecalhoDaPagina } from '../pecas';
import { FormularioDeContactos } from './formulario';

/**
 * Contactos do Município.
 *
 * Os dados que mais vezes se pedem a quem mantém o portal — um telefone que
 * mudou, um horário de verão — e que até aqui obrigavam a mexer no código.
 */

export const dynamic = 'force-dynamic';

export default async function PaginaDeContactos() {
  await exigirEntrada();
  const contactos = await lerContactos();

  return (
    <div className="max-w-3xl">
      <CabecalhoDaPagina
        titulo="Contactos"
        descricao="A morada, os telefones e o horário de atendimento. Aparecem no rodapé de todas as páginas e na página de contactos."
        accao={
          <Link
            href="/municipio/contactos"
            target="_blank"
            className="inline-flex min-h-12 items-center gap-2 rounded-md border border-line-strong px-4 font-medium text-ink no-underline hover:bg-surface-alt"
          >
            <Icon name="external" size={18} />
            Ver no portal
          </Link>
        }
      />

      <p className="mb-6 flex items-start gap-2.5 rounded-md border border-s-4 border-info bg-info-surface p-4 text-sm">
        <Icon name="info" size={20} className="mt-0.5 shrink-0" />
        <span>
          Uma alteração aqui aparece em <strong>todo o portal</strong> — rodapé, página de
          contactos, marcação de atendimento, fichas de serviço e a informação que os motores de
          busca leem.
        </span>
      </p>

      <FormularioDeContactos contactos={contactos} />

      <p className="mt-8 flex items-start gap-2.5 rounded-lg border border-line bg-surface p-4 text-sm text-ink-muted">
        <Icon name="lightbulb" size={20} className="mt-0.5 shrink-0 text-accent-600" />
        <span>
          Os números de emergência, as redes sociais e o Posto de Turismo não se mudam por aqui —
          mudam-se no código, porque quase nunca mudam. Peça a quem mantém o portal.
        </span>
      </p>
    </div>
  );
}
