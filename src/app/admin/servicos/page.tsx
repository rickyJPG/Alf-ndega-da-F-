import Link from 'next/link';

import { Icon, type IconName } from '@/components/ui/icon';
import { getServices } from '@/content';
import { exigirEntrada } from '@/lib/admin/sessao';
import { apagarServico } from '../acoes';
import { BotaoApagar, BotaoNovo, CabecalhoDaPagina, Vazio } from '../pecas';

export const dynamic = 'force-dynamic';

const AREAS: Record<string, string> = {
  balcao: 'Balcão único',
  urbanismo: 'Urbanismo',
  'agua-e-residuos': 'Água e resíduos',
  'taxas-e-licencas': 'Taxas e licenças',
  'acao-social': 'Ação social',
  educacao: 'Educação',
  saude: 'Saúde',
  apoios: 'Apoios',
};

export default async function ListaDeServicos() {
  await exigirEntrada();
  const servicos = await getServices();

  // Agrupados por área: é como estão no portal, e é como quem os mantém
  // pensa neles.
  const porArea = Object.keys(AREAS)
    .map((area) => ({ area, itens: servicos.filter((servico) => servico.area === area) }))
    .filter(({ itens }) => itens.length > 0);

  return (
    <>
      <CabecalhoDaPagina
        titulo="Serviços"
        descricao="As fichas que respondem às perguntas do munícipe antes de ele ter de as fazer ao balcão."
        accao={<BotaoNovo href="/admin/servicos/novo">Criar serviço</BotaoNovo>}
      />

      {servicos.length === 0 ? (
        <Vazio icone="briefcase" texto="Ainda não há serviços." />
      ) : (
        porArea.map(({ area, itens }) => (
          <section key={area} className="mb-8">
            <h2 className="mb-3 border-b border-line pb-2 font-serif text-xl font-semibold">
              {AREAS[area]}{' '}
              <span className="text-base font-normal text-ink-muted">({itens.length})</span>
            </h2>

            <ul className="list-none divide-y divide-line rounded-lg border border-line bg-surface p-0">
              {itens.map((servico) => (
                <li key={servico.id} className="flex flex-wrap items-start gap-4 p-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-md border border-line bg-surface-alt text-accent-700">
                    <Icon name={servico.icon as IconName} size={22} />
                  </span>

                  <div className="min-w-[16rem] flex-1">
                    <Link
                      href={`/admin/servicos/${encodeURIComponent(servico.id)}`}
                      className="font-semibold text-ink no-underline hover:underline"
                    >
                      {servico.title.pt}
                    </Link>
                    {servico.featured ? (
                      <span className="ms-2 rounded-pill bg-accent-100 px-2 py-0.5 text-xs font-medium text-accent-700">
                        em destaque
                      </span>
                    ) : null}
                    <p className="mt-1 line-clamp-2 max-w-[70ch] text-sm text-ink-muted">
                      {servico.summary.pt}
                    </p>
                    <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
                      <span className="inline-flex items-center gap-1">
                        <Icon name="clock" size={14} />
                        {servico.processingTime.pt}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Icon name="euro" size={14} />
                        {servico.fee.pt}
                      </span>
                      <span>
                        {servico.steps.length}{' '}
                        {servico.steps.length === 1 ? 'passo' : 'passos'}
                      </span>
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Link
                      href={`/servicos/${servico.area}/${servico.slug}`}
                      target="_blank"
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-line-strong px-3 text-sm font-medium text-ink no-underline hover:bg-surface-alt"
                    >
                      <Icon name="external" size={16} />
                      Ver
                    </Link>
                    <Link
                      href={`/admin/servicos/${encodeURIComponent(servico.id)}`}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-line-strong px-3 text-sm font-medium text-ink no-underline hover:bg-surface-alt"
                    >
                      <Icon name="wrench" size={16} />
                      Corrigir
                    </Link>
                    <BotaoApagar
                      acao={apagarServico}
                      id={servico.id}
                      descricao={`«${servico.title.pt}»`}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </>
  );
}
