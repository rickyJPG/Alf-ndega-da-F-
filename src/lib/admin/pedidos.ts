import { occurrences } from '@/content/data/services-operational';
import {
  arrumarReferencia,
  ESTADOS_ABERTOS,
  FORMATO_DA_REFERENCIA,
  PREFIXO_DO_TIPO,
  type EstadoDePedido,
  type TipoDePedido,
  type VistaPublica,
} from '@/lib/estado-do-pedido';
import { ler, gravar } from './deposito';

/**
 * Pedidos dos munícipes.
 *
 * Até aqui as três ações de formulário — ocorrência, participação numa
 * consulta pública e marcação de atendimento — validavam, devolviam um
 * número de referência e **descartavam tudo**. O ecrã dizia «Guarde este
 * número para acompanhar o estado», o munícipe guardava-o, e do outro lado
 * não havia nada para acompanhar: nem registo, nem serviço avisado.
 *
 * Esta coleção é esse lado de lá. Mesmo princípio das outras: um ficheiro
 * JSON em `conteudo/`, gravado atomicamente, legível com qualquer editor e
 * apanhado por qualquer cópia de segurança do servidor.
 *
 * **Dados pessoais.** Um pedido guarda o que o munícipe escreveu, nome e
 * contacto incluídos. Por isso:
 *
 * - nada daqui vai para o registo do servidor — `console.*` nunca recebe o
 *   conteúdo de `dados`, só a referência, que não identifica ninguém;
 * - a consulta pública de estado devolve uma vista reduzida
 *   (`vistaPublica()`), sem nome, correio ou telefone, para que a página de
 *   acompanhamento possa correr sem ter os dados de ninguém no navegador;
 * - o mapa público **não** passa a mostrar o que é comunicado aqui. Era
 *   tecnicamente fácil e seria um erro: publicaria texto livre sem ninguém
 *   o ler primeiro, e é em texto livre que as pessoas escrevem o nome do
 *   vizinho e o número da porta.
 */

export type { TipoDePedido, EstadoDePedido, VistaPublica };

export interface Pedido {
  referencia: string;
  tipo: TipoDePedido;
  estado: EstadoDePedido;
  /** Instante da submissão, em ISO. */
  criadoEm: string;
  /** Instante da última mudança de estado. */
  atualizadoEm?: string;
  /** O que o munícipe escreveu, sem a armadilha nem a caixa de consentimento. */
  dados: Record<string, unknown>;
  /** Resposta dos serviços. É o único campo que o munícipe vê além do estado. */
  resposta?: string;
}

const PREFIXOS = PREFIXO_DO_TIPO;

/** O formato que o acompanhamento de estado aceita: OC-2026-0448. */

export async function lerPedidos(): Promise<Pedido[]> {
  return ler<Pedido[]>('pedidos', []);
}

/* ---------------------------------------------------------- referências -- */

/**
 * O número de referência.
 *
 * Era `Math.random()`, e por isso podia repetir-se — num ano com algumas
 * centenas de pedidos, a probabilidade de duas referências iguais deixa de
 * ser teórica, e duas iguais significam um munícipe a ver o estado do pedido
 * de outro. Agora é sequencial por tipo e por ano.
 *
 * O contador arranca acima de tudo o que já exista, **incluindo os dados de
 * demonstração** (OC-2026-0418 a 0447). Não é zelo: sem isso, uma instalação
 * nova começaria em 0001 e, ao chegar a 0418, geraria uma referência que já
 * está nos exemplos — e em DEMO_MODE as duas apareceriam à mesma pesquisa.
 */
function sequenciaDe(referencia: string): number | null {
  const partes = FORMATO_DA_REFERENCIA.exec(referencia);
  return partes ? Number(partes[3]) : null;
}

function proximaReferencia(tipo: TipoDePedido, ano: number, existentes: string[]): string {
  const prefixo = PREFIXOS[tipo];
  const inicio = `${prefixo}-${ano}-`;

  let maior = 0;
  for (const referencia of existentes) {
    if (!referencia.startsWith(inicio)) continue;
    const sequencia = sequenciaDe(referencia);
    if (sequencia !== null && sequencia > maior) maior = sequencia;
  }

  return `${inicio}${String(maior + 1).padStart(4, '0')}`;
}

/**
 * Grava um pedido, um de cada vez.
 *
 * A coleção é um ficheiro só: ler-modificar-escrever em paralelo perderia o
 * pedido de quem chegasse a meio, e daria a referência do outro aos dois.
 * Dois formulários submetidos no mesmo segundo não é hipótese remota num dia
 * de aviso de corte de água.
 *
 * A fila é por processo, que é o que esta instalação tem. Num dia em que
 * passe a haver mais do que um, isto deixa de bastar e o sítio certo para
 * tratar disso é aqui.
 */
let fila: Promise<unknown> = Promise.resolve();

function emFila<T>(trabalho: () => Promise<T>): Promise<T> {
  const resultado = fila.then(trabalho, trabalho);
  // A fila não pode parar por causa de um pedido que falhou.
  fila = resultado.catch(() => undefined);
  return resultado;
}

/**
 * Campos que nunca entram no registo.
 *
 * A armadilha anti-robô e a caixa de consentimento não são informação sobre
 * o pedido — a primeira é ruído, e a segunda fica provada pelo próprio facto
 * de o pedido existir, porque o esquema não o aceita sem ela.
 */
const NAO_GUARDAR = new Set(['empresa_website', 'consent']);

export async function guardarPedido(
  tipo: TipoDePedido,
  dados: Record<string, unknown>,
  agora: Date = new Date(),
): Promise<Pedido> {
  return emFila(async () => {
    const pedidos = await lerPedidos();

    const jaUsadas = [
      ...pedidos.map((pedido) => pedido.referencia),
      // Os exemplos contam para o contador mesmo com DEMO_MODE desligado.
      ...occurrences.map((ocorrencia) => ocorrencia.reference),
    ];

    const limpos: Record<string, unknown> = {};
    for (const [campo, valor] of Object.entries(dados)) {
      if (!NAO_GUARDAR.has(campo)) limpos[campo] = valor;
    }

    const pedido: Pedido = {
      referencia: proximaReferencia(tipo, agora.getUTCFullYear(), jaUsadas),
      tipo,
      estado: 'recebido',
      criadoEm: agora.toISOString(),
      dados: limpos,
    };

    await gravar('pedidos', [pedido, ...pedidos]);
    return pedido;
  });
}

/* --------------------------------------------------------------- estado -- */

export async function mudarEstado(
  referencia: string,
  estado: EstadoDePedido,
  resposta?: string,
): Promise<Pedido | null> {
  return emFila(async () => {
    const pedidos = await lerPedidos();
    const indice = pedidos.findIndex((pedido) => pedido.referencia === referencia);
    if (indice < 0) return null;

    const atualizado: Pedido = {
      ...pedidos[indice],
      estado,
      atualizadoEm: new Date().toISOString(),
      // Uma resposta vazia apaga a anterior, em vez de a deixar presa.
      ...(resposta === undefined ? {} : { resposta: resposta.trim() || undefined }),
    };

    pedidos[indice] = atualizado;
    await gravar('pedidos', pedidos);
    return atualizado;
  });
}

export async function apagarPedido(referencia: string): Promise<boolean> {
  return emFila(async () => {
    const pedidos = await lerPedidos();
    const restantes = pedidos.filter((pedido) => pedido.referencia !== referencia);
    if (restantes.length === pedidos.length) return false;

    await gravar('pedidos', restantes);
    return true;
  });
}

export async function contarAbertos(): Promise<number> {
  const pedidos = await lerPedidos();
  return pedidos.filter((pedido) => ESTADOS_ABERTOS.includes(pedido.estado)).length;
}

/* ------------------------------------------------------ vista do munícipe -- */

/**
 * O que o munícipe vê quando consulta a referência.
 *
 * Sem nome, sem correio, sem telefone — nem os seus. Quem tem o número não
 * prova ser quem o pediu, e um número de referência não é uma senha: se
 * devolvesse os dados de contacto, bastava adivinhar um número para os ler.
 * Devolve o que interessa para acompanhar: o tipo, o estado, as datas, um
 * resumo do que foi pedido e a resposta dos serviços, se já houver.
 */
function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor : '';
}
/** Um resumo sem dados de contacto, montado no servidor. */
function resumirPedido(pedido: Pedido): string {
  const dados = pedido.dados;

  if (pedido.tipo === 'ocorrencia') return texto(dados.description);

  if (pedido.tipo === 'marcacao') {
    const dia = texto(dados.date);
    const hora = texto(dados.time);
    return dia && hora ? `Atendimento marcado para ${dia}, às ${hora}.` : 'Atendimento marcado.';
  }

  // Consulta pública: a contribuição é do próprio, e é o que ele quer rever.
  return texto(dados.contribution);
}

export function vistaPublica(pedido: Pedido): VistaPublica {
  return {
    referencia: pedido.referencia,
    tipo: pedido.tipo,
    estado: pedido.estado,
    criadoEm: pedido.criadoEm,
    atualizadoEm: pedido.atualizadoEm,
    resumo: resumirPedido(pedido),
    resposta: pedido.resposta,
  };
}

/** Normaliza o que o munícipe escreveu na caixa de pesquisa. */
export { arrumarReferencia, tipoDaReferencia } from '@/lib/estado-do-pedido';

export async function encontrarPedido(bruto: string): Promise<Pedido | null> {
  const referencia = arrumarReferencia(bruto);
  if (!FORMATO_DA_REFERENCIA.test(referencia)) return null;

  const pedidos = await lerPedidos();
  return pedidos.find((pedido) => pedido.referencia === referencia) ?? null;
}
