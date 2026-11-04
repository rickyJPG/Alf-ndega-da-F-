import { Icon } from '@/components/ui/icon';
import type { Dictionary } from '@/i18n';
import { emDemonstracao } from '@/lib/demo';

/**
 * Aviso por cima dos formulários que recolhem dados de pessoas.
 *
 * Numa demonstração, quem experimenta o formulário escreve o seu nome e o
 * seu telefone verdadeiros sem pensar duas vezes — e esses dados ficam
 * gravados em `conteudo/pedidos.json` de uma instalação que não é de
 * ninguém, e que vai ser apagada. Vale mais pedir que não o façam, antes de
 * o fazerem.
 *
 * Fica fora do formulário, do lado do servidor, de propósito: `DEMO_MODE`
 * não é uma variável `NEXT_PUBLIC_`, por isso não existe no navegador — e
 * não deve existir, porque é configuração do servidor e não da página.
 *
 * Devolve `null` sem `DEMO_MODE`. Numa instalação vendida não há aqui nada.
 */
export function AvisoDeDemonstracao({ dict }: { dict: Dictionary }) {
  if (!emDemonstracao()) return null;

  return (
    <p
      role="note"
      className="mb-5 flex items-start gap-2.5 rounded-md border border-s-4 border-amber-600 bg-amber-100 p-4 text-sm font-medium text-amber-950 dark:bg-amber-950 dark:text-amber-100"
    >
      <Icon name="alert" size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <span>{dict.common.demoFormNotice}</span>
    </p>
  );
}
