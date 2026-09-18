import { Icon } from '@/components/ui/icon';
import { formatDate } from '@/lib/format';
import { exigirEntrada, quemEstaDentro } from '@/lib/admin/sessao';
import { utilizadoresVisiveis } from '@/lib/admin/utilizadores';
import { apagarUtilizador } from '../acoes';
import { BotaoApagar, CabecalhoDaPagina } from '../pecas';
import { FormularioDeConta, TrocarPalavraPasse } from './formularios';

/**
 * Contas do painel.
 *
 * Existe para resolver um problema concreto: com uma palavra-passe única
 * partilhada, quem sai dos serviços continua a sabê-la, e trocá-la obriga a
 * avisar toda a gente. Com contas separadas, tira-se uma e as outras ficam.
 */

export const dynamic = 'force-dynamic';

export default async function PaginaDeUtilizadores() {
  await exigirEntrada();

  const [contas, eu] = await Promise.all([utilizadoresVisiveis(), quemEstaDentro()]);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:items-start">
      <section>
        <CabecalhoDaPagina
          titulo="Nova conta"
          descricao="Uma conta por pessoa da equipa. Cada uma com a sua palavra-passe."
        />

        {contas.length === 0 ? (
          <p className="mb-6 flex items-start gap-2.5 rounded-md border border-s-4 border-info bg-info-surface p-4 text-sm">
            <Icon name="info" size={20} className="mt-0.5 shrink-0" />
            <span>
              <strong className="block">Ainda se entra com a palavra-passe da instalação.</strong>
              Assim que criar a primeira conta, passa a entrar-se com nome e palavra-passe, e a
              palavra-passe única deixa de servir. Crie a sua antes de criar as dos outros.
            </span>
          </p>
        ) : null}

        <FormularioDeConta />
      </section>

      <section>
        <h2 className="mb-1 font-serif text-2xl font-semibold">Quem pode entrar</h2>
        <p className="mb-5 text-ink-muted">
          {contas.length === 0
            ? 'Ainda não há contas criadas.'
            : `${contas.length === 1 ? '1 pessoa tem' : `${contas.length} pessoas têm`} acesso ao painel.`}
        </p>

        {contas.length > 0 ? (
          <ul className="list-none divide-y divide-line rounded-lg border border-line bg-surface p-0">
            {contas.map((conta) => (
              <li key={conta.id} className="p-4">
                <div className="flex flex-wrap items-start gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-pill border border-line bg-surface-alt text-ink-muted">
                    <Icon name="users" size={20} />
                  </span>

                  <div className="min-w-[12rem] flex-1">
                    <p className="font-semibold text-ink">
                      {conta.nome}
                      {conta.id === eu ? (
                        <span className="ms-2 rounded-pill bg-accent-100 px-2 py-0.5 text-xs font-medium text-accent-700">
                          é você
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-sm text-ink-muted">
                      Conta criada a {formatDate(conta.criadoEm.slice(0, 10))}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <TrocarPalavraPasse id={conta.id} nome={conta.nome} />
                    {conta.id === eu ? null : (
                      <BotaoApagar
                        acao={apagarUtilizador}
                        id={conta.id}
                        descricao={`a conta de ${conta.nome}`}
                      />
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        <p className="mt-6 flex items-start gap-2.5 rounded-lg border border-line bg-surface p-4 text-sm text-ink-muted">
          <Icon name="key" size={20} className="mt-0.5 shrink-0 text-accent-600" />
          <span>
            Quando alguém sair dos serviços, apague a conta dessa pessoa. As dos outros continuam
            a funcionar, e ninguém tem de decorar uma palavra-passe nova.
          </span>
        </p>
      </section>
    </div>
  );
}
