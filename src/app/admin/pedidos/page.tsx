import Link from 'next/link';

import { Icon } from '@/components/ui/icon';
import { exigirEntrada } from '@/lib/admin/sessao';
import { lerPedidos, type Pedido } from '@/lib/admin/pedidos';
import {
  ESTADO_EM_PORTUGUES,
  ESTADOS,
  ESTADOS_ABERTOS,
  TIPO_EM_PORTUGUES,
  TIPOS,
  type EstadoDePedido,
  type TipoDePedido,
} from '@/lib/estado-do-pedido';
import { CabecalhoDaPagina, Vazio } from '../pecas';
import { quandoFoi } from './quando';

/**
 * Pedidos dos munícipes.
 *
 * O ecrã que faltava. Até aqui as ocorrências, as participações em consultas
 * e as marcações eram validadas, recebiam um número de referência e
 * desapareciam — ninguém nos serviços chegava a saber que tinham sido
 * feitas.
 *
 * Ordenado do mais recente para o mais antigo, e com os abertos em primeiro
 * lugar na contagem: quem abre este ecrã vem ver o que está à espera de
 * resposta, não o arquivo.
 *
 * Os filtros vão no endereço (`?tipo=&estado=`) para que um turno possa
 * deixar uma vista guardada nos favoritos. Só levam o tipo e o estado —
 * nunca um nome, um correio ou uma referência: o que vai no endereço fica no
 * histórico do navegador e no registo de acessos do servidor.
 */

export const dynamic = 'force-dynamic';

function ehTipo(valor: string): valor is TipoDePedido {
  return (TIPOS as readonly string[]).includes(valor);
}

function ehEstado(valor: string): valor is EstadoDePedido {
  return (ESTADOS as readonly string[]).includes(valor);
}

/** Uma linha de resumo por tipo, sem dados de contacto à vista na lista. */
function resumir(pedido: Pedido): string {
  const dados = pedido.dados as Record<string, unknown>;
  const str = (campo: string) => (typeof dados[campo] === 'string' ? (dados[campo] as string) : '');

  if (pedido.tipo === 'ocorrencia') {
    const categoria = str('category').replace(/-/g, ' ');
    const freguesia = str('freguesia').replace(/-/g, ' ');
    return [categoria, freguesia].filter(Boolean).join(' · ') || 'Ocorrência';
  }

  if (pedido.tipo === 'marcacao') {
    const dia = str('date');
    const hora = str('time');
    return [str('serviceId').replace(/-/g, ' '), dia && `${dia} às ${hora}`]
      .filter(Boolean)
      .join(' · ');
  }

  const contribuicao = str('contribution');
  return contribuicao.length > 90 ? `${contribuicao.slice(0, 90)}…` : contribuicao;
}

export default async function PaginaDePedidos({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; estado?: string }>;
}) {
  await exigirEntrada();

  const { tipo: tipoBruto = '', estado: estadoBruto = '' } = await searchParams;
  const tipoEscolhido = ehTipo(tipoBruto) ? tipoBruto : null;
  const estadoEscolhido = ehEstado(estadoBruto) ? estadoBruto : null;

  const todos = await lerPedidos();
  const abertos = todos.filter((pedido) => ESTADOS_ABERTOS.includes(pedido.estado));

  const pedidos = todos
    .filter((pedido) => (tipoEscolhido ? pedido.tipo === tipoEscolhido : true))
    .filter((pedido) => (estadoEscolhido ? pedido.estado === estadoEscolhido : true))
    .slice()
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));

  const filtrado = Boolean(tipoEscolhido || estadoEscolhido);

  return (
    <div>
      <CabecalhoDaPagina
        titulo="Pedidos"
        descricao="O que os munícipes enviaram pelo portal: ocorrências, participações em consultas públicas e marcações de atendimento."
      />

      <p className="mb-6 flex items-start gap-2.5 rounded-md border border-s-4 border-info bg-info-surface p-4 text-sm">
        <Icon name="info" size={20} className="mt-0.5 shrink-0" />
        <span>
          {abertos.length === 0
            ? 'Não há pedidos à espera de resposta.'
            : `${abertos.length === 1 ? 'Há 1 pedido' : `Há ${abertos.length} pedidos`} à espera de resposta.`}{' '}
          Ao mudar o estado, o munícipe passa a vê-lo no portal com o número de referência que lhe
          foi dado.
        </span>
      </p>

      {/* ---------------------------------------------------------- filtros -- */}

      <div className="mb-6 flex flex-col gap-3 rounded-lg border border-line bg-surface p-4">
        <Filtro
          rotulo="Tipo"
          atual={tipoEscolhido}
          base={{ estado: estadoEscolhido }}
          opcoes={TIPOS.map((tipo) => ({ valor: tipo, rotulo: TIPO_EM_PORTUGUES[tipo] }))}
          chave="tipo"
        />
        <Filtro
          rotulo="Estado"
          atual={estadoEscolhido}
          base={{ tipo: tipoEscolhido }}
          opcoes={ESTADOS.map((estado) => ({
            valor: estado,
            rotulo: ESTADO_EM_PORTUGUES[estado],
          }))}
          chave="estado"
        />
      </div>

      {/* ----------------------------------------------------------- lista -- */}

      {pedidos.length === 0 ? (
        <Vazio
          icone="mail"
          texto={
            filtrado
              ? 'Nenhum pedido corresponde a este filtro.'
              : 'Ainda não chegou nenhum pedido pelo portal.'
          }
        />
      ) : (
        <ul className="list-none divide-y divide-line rounded-lg border border-line bg-surface p-0">
          {pedidos.map((pedido) => (
            <li key={pedido.referencia}>
              <Link
                href={`/admin/pedidos/${encodeURIComponent(pedido.referencia)}`}
                className="flex flex-wrap items-baseline gap-x-4 gap-y-1.5 p-4 no-underline hover:bg-surface-alt"
              >
                <span className="font-serif font-semibold text-ink tabular-nums">
                  {pedido.referencia}
                </span>
                <Marca estado={pedido.estado} />
                <span className="text-sm text-ink-muted">{TIPO_EM_PORTUGUES[pedido.tipo]}</span>
                <span className="basis-full text-ink">{resumir(pedido)}</span>
                <span className="basis-full text-sm text-ink-muted">
                  {quandoFoi(pedido.criadoEm)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {todos.length > pedidos.length ? (
        <p className="mt-4 text-sm text-ink-muted">
          A mostrar {pedidos.length} de {todos.length} pedidos.
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ peças -- */

function Marca({ estado }: { estado: EstadoDePedido }) {
  const cor: Record<EstadoDePedido, string> = {
    recebido: 'border-info bg-info-surface',
    'em-analise': 'border-warning bg-warning-surface',
    resolvido: 'border-success bg-success-surface',
    'sem-seguimento': 'border-line-strong bg-surface-alt',
  };

  return (
    <span
      className={`inline-flex items-center rounded-pill border px-2.5 py-0.5 text-xs font-semibold ${cor[estado]}`}
    >
      {ESTADO_EM_PORTUGUES[estado]}
    </span>
  );
}

/**
 * Um filtro feito de ligações, não de um `<select>`.
 *
 * Sem JavaScript do nosso lado, e cada combinação fica com endereço próprio —
 * é o que permite guardar «pedidos em análise» nos favoritos.
 */
function Filtro({
  rotulo,
  chave,
  atual,
  base,
  opcoes,
}: {
  rotulo: string;
  chave: 'tipo' | 'estado';
  atual: string | null;
  base: Record<string, string | null>;
  opcoes: { valor: string; rotulo: string }[];
}) {
  function endereco(valor: string | null): string {
    const parametros = new URLSearchParams();
    for (const [campo, conteudo] of Object.entries(base)) {
      if (conteudo) parametros.set(campo, conteudo);
    }
    if (valor) parametros.set(chave, valor);
    const consulta = parametros.toString();
    return consulta ? `/admin/pedidos?${consulta}` : '/admin/pedidos';
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-16 text-sm font-semibold text-ink-muted">{rotulo}</span>
      <Ligacao href={endereco(null)} ativa={atual === null}>
        Todos
      </Ligacao>
      {opcoes.map((opcao) => (
        <Ligacao key={opcao.valor} href={endereco(opcao.valor)} ativa={atual === opcao.valor}>
          {opcao.rotulo}
        </Ligacao>
      ))}
    </div>
  );
}

function Ligacao({
  href,
  ativa,
  children,
}: {
  href: string;
  ativa: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={ativa ? 'true' : undefined}
      className={`inline-flex min-h-10 items-center rounded-md border px-3 text-sm font-medium no-underline ${
        ativa
          ? 'border-accent-600 bg-accent-600 text-white'
          : 'border-line-strong bg-surface text-ink hover:bg-surface-alt'
      }`}
    >
      {children}
    </Link>
  );
}
