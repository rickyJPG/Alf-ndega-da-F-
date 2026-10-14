import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Icon } from '@/components/ui/icon';
import { exigirEntrada } from '@/lib/admin/sessao';
import { lerPedidos, type Pedido } from '@/lib/admin/pedidos';
import { TIPO_EM_PORTUGUES } from '@/lib/estado-do-pedido';
import { apagarPedidoDoPainel } from '../../acoes';
import { BotaoApagar, CabecalhoDaPagina } from '../../pecas';
import { FormularioDeEstado } from './formulario';
import { quandoFoi } from '../quando';

/**
 * Um pedido, por inteiro.
 *
 * É o único ecrã do portal que mostra os dados de contacto de quem fez o
 * pedido, e mostra-os porque é para isso que servem: sem o telefone não se
 * marca a visita à rua onde está o buraco. Está atrás da entrada do painel,
 * como todo o resto daqui.
 *
 * O que o munícipe vê do outro lado é muito menos — só o estado, as datas,
 * um resumo e a resposta. Ver `vistaPublica()` em `src/lib/admin/pedidos.ts`.
 */

export const dynamic = 'force-dynamic';

/** Os campos técnicos não interessam a ninguém neste ecrã. */
const ESCONDER = new Set(['lat', 'lon']);

const NOMES: Record<string, string> = {
  name: 'Nome',
  email: 'Correio eletrónico',
  phone: 'Telefone',
  category: 'Categoria',
  freguesia: 'Freguesia',
  description: 'Descrição',
  contribution: 'Contribuição',
  serviceId: 'Serviço',
  date: 'Dia',
  time: 'Hora',
  notes: 'Observações',
};

function comoTexto(valor: unknown): string {
  if (typeof valor === 'string') return valor;
  if (typeof valor === 'number' || typeof valor === 'boolean') return String(valor);
  if (Array.isArray(valor)) return valor.map(comoTexto).join(', ');
  return '';
}

/** Campos cujo valor é um identificador com hífenes, não texto escrito. */
const SAO_IDENTIFICADORES = new Set(['category', 'freguesia', 'serviceId']);

function paraLer(campo: string, valor: unknown): string {
  const texto = comoTexto(valor);
  return SAO_IDENTIFICADORES.has(campo) ? texto.replace(/-/g, ' ') : texto;
}

/** Os campos de contacto, para os pôr em evidência e marcar como pessoais. */
const CONTACTO = new Set(['name', 'email', 'phone']);

export default async function PaginaDoPedido({
  params,
}: {
  params: Promise<{ referencia: string }>;
}) {
  await exigirEntrada();

  const { referencia: bruta } = await params;
  const referencia = decodeURIComponent(bruta);

  const pedidos = await lerPedidos();
  const pedido = pedidos.find((candidato) => candidato.referencia === referencia);
  if (!pedido) notFound();

  const campos = Object.entries(pedido.dados).filter(
    ([campo, valor]) => !ESCONDER.has(campo) && comoTexto(valor).trim() !== '',
  );

  const contacto = campos.filter(([campo]) => CONTACTO.has(campo));
  const conteudo = campos.filter(([campo]) => !CONTACTO.has(campo));
  const mapa = coordenadas(pedido);

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/pedidos"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium"
      >
        <Icon name="arrowLeft" size={16} />
        Todos os pedidos
      </Link>

      <CabecalhoDaPagina
        titulo={pedido.referencia}
        descricao={`${TIPO_EM_PORTUGUES[pedido.tipo]} · ${quandoFoi(pedido.criadoEm)}`}
      />

      <FormularioDeEstado pedido={pedido} />

      {/* ------------------------------------------------------- o pedido -- */}

      <section className="mt-8">
        <h2 className="mb-3 font-serif text-xl font-semibold">O que foi pedido</h2>
        <dl className="divide-y divide-line rounded-lg border border-line bg-surface">
          {conteudo.map(([campo, valor]) => (
            <div key={campo} className="p-4">
              <dt className="text-sm font-semibold text-ink-muted">{NOMES[campo] ?? campo}</dt>
              <dd className="mt-1 whitespace-pre-wrap">{paraLer(campo, valor)}</dd>
            </div>
          ))}
          {conteudo.length === 0 ? (
            <div className="p-4 text-ink-muted">Sem conteúdo registado.</div>
          ) : null}
        </dl>
      </section>

      {/* ------------------------------------------------------- contacto -- */}

      <section className="mt-8">
        <h2 className="mb-1 font-serif text-xl font-semibold">Quem fez o pedido</h2>
        <p className="mb-3 flex items-start gap-2 text-sm text-ink-muted">
          <Icon name="key" size={16} className="mt-0.5 shrink-0" />
          <span>
            Dados pessoais. Use-os para dar resposta a este pedido e não para mais nada. Quando o
            assunto estiver encerrado e já não forem necessários, apague o pedido.
          </span>
        </p>

        {contacto.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line-strong p-5 text-center text-ink-muted">
            O munícipe não deixou contacto. Não é possível responder-lhe diretamente — só pelo
            estado, que ele consulta com a referência.
          </p>
        ) : (
          <dl className="divide-y divide-line rounded-lg border border-line bg-surface">
            {contacto.map(([campo, valor]) => (
              <div key={campo} className="flex flex-wrap items-baseline gap-x-4 p-4">
                <dt className="w-44 text-sm font-semibold text-ink-muted">
                  {NOMES[campo] ?? campo}
                </dt>
                <dd>
                  {campo === 'email' ? (
                    <a href={`mailto:${comoTexto(valor)}`}>{comoTexto(valor)}</a>
                  ) : campo === 'phone' ? (
                    <a href={`tel:${comoTexto(valor).replace(/\s/g, '')}`}>{comoTexto(valor)}</a>
                  ) : (
                    comoTexto(valor)
                  )}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      {mapa ? (
        <section className="mt-8">
          <h2 className="mb-3 font-serif text-xl font-semibold">Onde</h2>
          <p className="rounded-lg border border-line bg-surface p-4">
            <a
              href={`https://www.openstreetmap.org/?mlat=${mapa.lat}&mlon=${mapa.lon}#map=18/${mapa.lat}/${mapa.lon}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2"
            >
              <Icon name="mapPin" size={18} />
              Ver o ponto no mapa
              <Icon name="external" size={15} />
            </a>
          </p>
        </section>
      ) : null}

      {/* --------------------------------------------------------- apagar -- */}

      <section className="mt-10 border-t border-line pt-6">
        <h2 className="mb-1 font-serif text-lg font-semibold">Apagar este pedido</h2>
        <p className="mb-3 max-w-[60ch] text-sm text-ink-muted">
          Apaga o registo e os dados pessoais que vêm com ele, sem deixar cópia. O munícipe deixa
          de conseguir consultar a referência. Não há como voltar atrás.
        </p>
        <BotaoApagar
          acao={apagarPedidoDoPainel}
          id={pedido.referencia}
          descricao={`o pedido ${pedido.referencia}`}
        />
      </section>
    </div>
  );
}

function coordenadas(pedido: Pedido): { lat: number; lon: number } | null {
  const lat = pedido.dados.lat;
  const lon = pedido.dados.lon;
  return typeof lat === 'number' && typeof lon === 'number' ? { lat, lon } : null;
}
