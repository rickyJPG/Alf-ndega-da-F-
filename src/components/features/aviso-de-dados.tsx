import Link from 'next/link';

import { Icon } from '@/components/ui/icon';
import type { Dictionary } from '@/i18n';
import { localePath, type Locale } from '@/i18n/config';

/**
 * O aviso de proteção de dados dos formulários do portal.
 *
 * Aparece em cima da caixa de consentimento, nos três formulários que
 * recolhem dados de pessoas — ocorrências, consultas públicas e marcações.
 *
 * Existe porque, a partir do momento em que estes formulários passaram a
 * **guardar** o que recebem, pedir o consentimento deixou de bastar: quem
 * autoriza tem de poder saber o que autoriza. Diz as três coisas que
 * importam — onde ficam os dados, para que servem, e que se podem consultar,
 * corrigir ou apagar — em linguagem corrente e antes do clique, não numa
 * página de política que ninguém abre.
 *
 * Uma peça só, para os três: um aviso de privacidade que diga coisas
 * diferentes em sítios diferentes é pior do que não dizer nada.
 */
export function AvisoDeDados({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return (
    <p className="flex items-start gap-2.5 rounded-md border border-line bg-surface-alt p-4 text-sm text-ink-muted">
      <Icon name="key" size={18} className="mt-0.5 shrink-0" />
      <span>
        {dict.forms.privacyNotice}{' '}
        <Link
          href={localePath(locale, '/privacidade')}
          className="text-primary-600 underline underline-offset-[0.2em]"
        >
          {dict.forms.consentLink}
        </Link>
      </span>
    </p>
  );
}
