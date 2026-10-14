import type { BadgeTone } from '@/components/ui/badge';
import type { Dictionary } from '@/i18n';

/**
 * Tipos e rótulos dos pedidos dos munícipes.
 *
 * Vive separado de `src/lib/admin/pedidos.ts` por uma razão prática: aquele
 * lê e escreve ficheiros, e por isso não pode ser importado por uma
 * componente de cliente. A página de acompanhamento de estado é de cliente —
 * é uma caixa de pesquisa — e precisa destes rótulos.
 *
 * Mesma razão que levou `occurrence-status.ts` a existir, e por isso o
 * mesmo desenho.
 */

export type TipoDePedido = 'ocorrencia' | 'consulta' | 'marcacao';

/**
 * Os estados de tratamento.
 *
 * Os três primeiros são o percurso normal de um pedido. `sem-seguimento`
 * fica porque é um desfecho real num município — uma comunicação que não é
 * da competência da Câmara, ou um pedido repetido — e porque os dados de
 * exemplo e os quatro dicionários já o tratam. Fechar sem resolver não é o
 * mesmo que resolver, e dizê-lo ao munícipe é melhor do que deixar o pedido
 * eternamente «em análise».
 */
export type EstadoDePedido = 'recebido' | 'em-analise' | 'resolvido' | 'sem-seguimento';

export const ESTADOS: readonly EstadoDePedido[] = [
  'recebido',
  'em-analise',
  'resolvido',
  'sem-seguimento',
] as const;

/** Estados que ainda pedem trabalho de alguém. */
export const ESTADOS_ABERTOS: readonly EstadoDePedido[] = ['recebido', 'em-analise'] as const;

export const TIPOS: readonly TipoDePedido[] = ['ocorrencia', 'consulta', 'marcacao'] as const;

/** O formato que o acompanhamento aceita: OC-2026-0448. */
export const FORMATO_DA_REFERENCIA = /^(OC|CP|AT)-(\d{4})-(\d{4})$/;

const TIPO_DO_PREFIXO: Record<string, TipoDePedido> = {
  OC: 'ocorrencia',
  CP: 'consulta',
  AT: 'marcacao',
};

export const PREFIXO_DO_TIPO: Record<TipoDePedido, string> = {
  ocorrencia: 'OC',
  consulta: 'CP',
  marcacao: 'AT',
};

/** Normaliza o que o munícipe escreveu na caixa de pesquisa. */
export function arrumarReferencia(bruto: string): string {
  return bruto.trim().toUpperCase().replace(/\s+/g, '');
}

export function referenciaValida(bruto: string): boolean {
  return FORMATO_DA_REFERENCIA.test(arrumarReferencia(bruto));
}

export function tipoDaReferencia(bruto: string): TipoDePedido | null {
  const partes = FORMATO_DA_REFERENCIA.exec(arrumarReferencia(bruto));
  return partes ? (TIPO_DO_PREFIXO[partes[1]] ?? null) : null;
}

/* --------------------------------------------------------------- rótulos -- */

export const estadoTone: Record<EstadoDePedido, BadgeTone> = {
  recebido: 'info',
  'em-analise': 'warning',
  resolvido: 'success',
  'sem-seguimento': 'neutral',
};

/**
 * Os rótulos saem do dicionário que já existia para as ocorrências —
 * «Recebida», «Em resolução», «Resolvida», «Sem seguimento» —, traduzidos
 * nos quatro idiomas. Criar chaves novas só para dizer o mesmo deixaria
 * quatro ficheiros a divergir.
 */
export function estadoLabel(estado: EstadoDePedido, dict: Dictionary): string {
  return {
    recebido: dict.reports.statusReceived,
    'em-analise': dict.reports.statusInProgress,
    resolvido: dict.reports.statusResolved,
    'sem-seguimento': dict.reports.statusRejected,
  }[estado];
}

export function tipoLabel(tipo: TipoDePedido, dict: Dictionary): string {
  return {
    ocorrencia: dict.reports.title,
    consulta: dict.consultations.participate,
    marcacao: dict.booking.title,
  }[tipo];
}

/** Rótulos em português, para o painel — que só existe em português. */
export const ESTADO_EM_PORTUGUES: Record<EstadoDePedido, string> = {
  recebido: 'Recebido',
  'em-analise': 'Em análise',
  resolvido: 'Resolvido',
  'sem-seguimento': 'Sem seguimento',
};

export const TIPO_EM_PORTUGUES: Record<TipoDePedido, string> = {
  ocorrencia: 'Ocorrência',
  consulta: 'Consulta pública',
  marcacao: 'Marcação de atendimento',
};

/* ------------------------------------------------- o que o munícipe vê -- */

/**
 * O que a consulta de estado devolve.
 *
 * Sem nome, sem correio, sem telefone — nem os do próprio. Quem escreve um
 * número de referência não prova ser quem o pediu, e uma referência não é
 * uma senha: se isto trouxesse dados de contacto, bastava adivinhar um
 * número para os ler.
 */
export interface VistaPublica {
  referencia: string;
  tipo: TipoDePedido;
  estado: EstadoDePedido;
  criadoEm: string;
  atualizadoEm?: string;
  resumo: string;
  resposta?: string;
}
