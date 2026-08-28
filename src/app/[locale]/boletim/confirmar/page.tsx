import type { Metadata } from 'next';

import { getDictionary } from '@/i18n';
import { isLocale, type Locale } from '@/i18n/config';
import { lerTestemunho, registarSubscricao, VALIDADE_HORAS } from '@/lib/newsletter';
import { routes } from '@/lib/routes';

import { PageHeader, Section } from '@/components/layout/page-shell';
import { Icon } from '@/components/ui/icon';
import { TextLink } from '@/components/ui/link';

/**
 * Confirmação da subscrição do boletim — o segundo passo da dupla adesão.
 *
 * É aqui, e só aqui, que alguém fica subscrito. A ligação traz um testemunho
 * assinado; se a assinatura não bater, ou se tiver mais de 48 horas, não há
 * subscrição nenhuma.
 *
 * Sempre dinâmica e fora dos motores de busca: cada visita tem de verificar a
 * assinatura de novo, e um endereço com o testemunho de alguém não tem nada
 * que estar num índice.
 */

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Confirmação do boletim informativo',
  robots: { index: false, follow: false },
};

const TEMAS: Record<string, string> = {
  noticias: 'Notícias do Município',
  agenda: 'Agenda cultural',
  consultas: 'Consultas públicas',
  concursos: 'Concursos e recrutamento',
  avisos: 'Avisos e proteção civil',
};

export default async function ConfirmarBoletim({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { locale: bruto } = await params;
  const locale = (isLocale(bruto) ? bruto : 'pt') as Locale;
  const dict = getDictionary(locale);

  const { t } = await searchParams;
  const leitura = t ? lerTestemunho(t) : ({ estado: 'invalido' } as const);

  if (leitura.estado === 'valido') {
    await registarSubscricao(leitura.email, leitura.temas);
  }

  return (
    <>
      <PageHeader
        title="Boletim informativo"
        tone="alt"
        breadcrumbLabel={dict.common.breadcrumb}
        breadcrumb={[
          { label: dict.common.home, href: routes.home(locale) },
          { label: 'Boletim informativo' },
        ]}
      />

      <Section>
        <div className="measure">
          {leitura.estado === 'valido' ? (
            <>
              <p className="flex items-start gap-2.5 rounded-md border border-s-4 border-success bg-success-surface p-4">
                <Icon name="checkCircle" size={22} className="mt-0.5 shrink-0 text-success" />
                <span>
                  <strong className="block">Subscrição confirmada.</strong>
                  {leitura.email} passa a receber o boletim do Município.
                </span>
              </p>

              {leitura.temas.length > 0 ? (
                <>
                  <h2 className="mt-8 text-2xl">Temas escolhidos</h2>
                  <ul className="mt-3 flex list-none flex-wrap gap-2 p-0">
                    {leitura.temas.map((tema) => (
                      <li
                        key={tema}
                        className="rounded-pill border border-line-strong px-3 py-1.5 text-sm"
                      >
                        {TEMAS[tema] ?? tema}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              <p className="mt-8 text-ink-muted">
                Pode cancelar quando quiser, pela ligação no fim de cada mensagem ou escrevendo
                para <TextLink href="mailto:geral@cm-alfandegadafe.pt">geral@cm-alfandegadafe.pt</TextLink>.
              </p>
            </>
          ) : leitura.estado === 'expirado' ? (
            <p className="flex items-start gap-2.5 rounded-md border border-s-4 border-warning bg-warning-surface p-4">
              <Icon name="clock" size={22} className="mt-0.5 shrink-0" />
              <span>
                <strong className="block">A ligação expirou.</strong>
                As ligações de confirmação valem {VALIDADE_HORAS} horas. Volte ao formulário, no
                fim de qualquer página, e peça outra — leva um instante.
              </span>
            </p>
          ) : (
            <p className="flex items-start gap-2.5 rounded-md border border-s-4 border-danger bg-danger-surface p-4">
              <Icon name="alert" size={22} className="mt-0.5 shrink-0" />
              <span>
                <strong className="block">Não foi possível confirmar.</strong>
                A ligação está incompleta ou foi alterada — costuma acontecer quando o endereço é
                copiado a meio. Volte ao formulário e peça outra ligação.
              </span>
            </p>
          )}

          <p className="mt-8">
            <TextLink href={routes.home(locale)}>Voltar à página inicial</TextLink>
          </p>
        </div>
      </Section>
    </>
  );
}
