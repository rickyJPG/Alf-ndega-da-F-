import type { Metadata } from 'next';

import { getDictionary } from '@/i18n';
import { isLocale, type Locale } from '@/i18n/config';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';
import { routes } from '@/lib/routes';
import { getParticipatoryProjects } from '@/content';
import { formatCurrency } from '@/lib/format';

import { JsonLd } from '@/components/seo/json-ld';
import { PageHeader, Section } from '@/components/layout/page-shell';
import { ParticipatoryBudget } from '@/components/features/participatory-budget';
import { Icon } from '@/components/ui/icon';
import { ButtonLink } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const dict = getDictionary(locale);

  return buildMetadata({
    locale,
    path: '/viver-e-participar/orcamento-participativo',
    title: dict.participation.title,
    description: dict.participation.lead,
  });
}

export default async function ParticipatoryBudgetPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const dict = getDictionary(locale);

  const projects = await getParticipatoryProjects();

  /** Der Zyklus als Zeitleiste – die Abstimmung ist die aktuelle Phase. */
  const phases = [
    { label: dict.participation.phaseProposals, period: 'abril a junho', done: true },
    { label: dict.participation.phaseAnalysis, period: 'julho a setembro', done: true },
    { label: dict.participation.phaseVoting, period: 'outubro', current: true },
    { label: dict.participation.phaseExecution, period: 'ano seguinte' },
  ];

  const crumbs = [
    { label: dict.common.home, href: '/' },
    { label: dict.nav.viverParticipar, href: '/viver-e-participar' },
    { label: dict.participation.title },
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />

      <PageHeader
        title={dict.participation.title}
        lead={dict.participation.lead}
        tone="alt"
        breadcrumbLabel={dict.common.breadcrumb}
        breadcrumb={[
          { label: dict.common.home, href: routes.home(locale) },
          { label: dict.nav.viverParticipar, href: routes.participate(locale) },
          { label: dict.participation.title },
        ]}
        aside={
          <ButtonLink href={routes.contacts(locale)} icon="lightbulb" size="lg">
            {dict.participation.submitIdea}
          </ButtonLink>
        }
      />

      <Section>
        <ul className="mb-10 grid gap-4 md:grid-cols-3">
          <li className="rounded-lg border border-line bg-surface p-5">
            <span className="text-sm font-semibold text-ink-muted">Dotação de 2026</span>
            <span className="mt-1 block font-serif text-3xl font-semibold tabular-nums">
              {formatCurrency(150_000, locale)}
            </span>
            <span className="text-sm text-ink-muted">Geral, jovem e sénior</span>
          </li>
          <li className="rounded-lg border border-line bg-surface p-5">
            <span className="text-sm font-semibold text-ink-muted">Limite por proposta</span>
            <span className="mt-1 block font-serif text-3xl font-semibold tabular-nums">
              {formatCurrency(50_000, locale)}
            </span>
            <span className="text-sm text-ink-muted">Executável em um ano</span>
          </li>
          <li className="rounded-lg border border-line bg-surface p-5">
            <span className="text-sm font-semibold text-ink-muted">Quem pode participar</span>
            <span className="mt-1 block font-serif text-3xl font-semibold tabular-nums">16+</span>
            <span className="text-sm text-ink-muted">Quem vive, trabalha ou estuda no concelho</span>
          </li>
        </ul>

        <h2 className="text-2xl">Como funciona</h2>
        <ol className="mt-4 grid gap-3 md:grid-cols-4">
          {phases.map((phase, index) => (
            <li
              key={phase.label}
              aria-current={phase.current ? 'step' : undefined}
              className={cn(
                'rounded-lg border p-4',
                phase.current ? 'border-accent-600 border-2 bg-accent-100/40' : 'border-line bg-surface',
              )}
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex size-7 items-center justify-center rounded-pill text-sm font-semibold',
                    phase.done
                      ? 'bg-success text-white'
                      : phase.current
                        ? 'bg-accent-600 text-white'
                        : 'border border-line-strong text-ink-muted',
                  )}
                >
                  {phase.done ? <Icon name="check" size={14} /> : index + 1}
                </span>
                <span className="font-semibold">{phase.label}</span>
              </span>
              <span className="mt-1 block ps-9 text-sm text-ink-muted">{phase.period}</span>
              {phase.current ? (
                <span className="mt-1 block ps-9 text-sm font-semibold text-accent-700">
                  Fase atual
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="alt" title="Projetos" headingLevel={2}>
        <ParticipatoryBudget projects={projects} locale={locale} dict={dict} />
      </Section>

      <Section title="Perguntas frequentes" headingLevel={2}>
        <dl className="measure flex flex-col gap-5">
          <div>
            <dt className="font-semibold">Posso votar em mais do que um projeto?</dt>
            <dd className="mt-1 text-ink-muted">
              Sim, num projeto por vertente: um geral, um jovem e um sénior.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Como se vota sem Internet?</dt>
            <dd className="mt-1 text-ink-muted">
              Presencialmente, nos Paços do Concelho e em todas as juntas de freguesia, durante todo
              o mês de outubro, com o cartão de cidadão.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">O que acontece a propostas que não são selecionadas?</dt>
            <dd className="mt-1 text-ink-muted">
              Ficam registadas e podem ser reapresentadas na edição seguinte. Algumas acabam por ser
              executadas fora do Orçamento Participativo, quando o custo é baixo.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Quem verifica se a proposta é exequível?</dt>
            <dd className="mt-1 text-ink-muted">
              Uma comissão técnica com pessoas das divisões de obras, urbanismo e financeira. As
              propostas excluídas são acompanhadas da razão da exclusão.
            </dd>
          </div>
        </dl>
      </Section>
    </>
  );
}
