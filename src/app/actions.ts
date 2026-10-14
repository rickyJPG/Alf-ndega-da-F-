'use server';

import {
  bookingSchema,
  consultationSchema,
  newsletterSchema,
  occurrenceSchema,
} from '@/lib/forms/schemas';
import { criarTestemunho, ehTema, enviarConfirmacao, envioConfigurado } from '@/lib/newsletter';
import { encontrarPedido, guardarPedido, vistaPublica } from '@/lib/admin/pedidos';
import { arrumarReferencia, referenciaValida, type VistaPublica } from '@/lib/estado-do-pedido';
import { occurrences } from '@/content/data/services-operational';
import type { Occurrence } from '@/content/types';
import { site } from '@/lib/site';

/**
 * Server-Actions.
 *
 * Cada ação volta a validar no servidor — a verificação no navegador é
 * comodidade, a que vale é esta. O campo-armadilha é tratado em silêncio: um
 * robô recebe «enviado com sucesso» e não dá por nada.
 *
 * As três ações de pedido — ocorrência, consulta pública e marcação —
 * **gravam** o que recebem, em `conteudo/pedidos.json`, e o número de
 * referência que devolvem é o do registo gravado. Antes não gravavam nada: a
 * validação corria, a referência era inventada com `Math.random()` e os
 * dados eram descartados. O ecrã dizia «Guarde este número para acompanhar o
 * estado» e não havia estado nenhum para acompanhar — e a página de consulta
 * respondia «Verifique se o copiou corretamente», culpando o munícipe por um
 * engano que não tinha cometido.
 *
 * A ligação às aplicações de gestão do Município continua por fazer, nos
 * pontos marcados com TODO. A diferença é que agora o pedido não se perde
 * enquanto ela não existir: fica registado e aparece em `/admin/pedidos`.
 *
 * Nada do que aqui passa vai para o registo do servidor. Um `console.log`
 * com o conteúdo de um formulário poria nome, correio e telefone num
 * ficheiro de texto que ninguém trata como dados pessoais.
 */

export interface ActionResult {
  ok: boolean;
  reference?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
}

function toFieldErrors(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.join('.');
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

/** Referenznummer im Format OC-2026-0448. A sequência vive em pedidos.ts. */

/**
 * Uma referência para o robô que caiu na armadilha.
 *
 * Tem de parecer um sucesso — é isso que faz o robô ir à sua vida — mas não
 * pode gravar nada nem consumir um número da sequência verdadeira. Daí o
 * 0000, que a sequência real nunca atribui: começa no 0001.
 */
function referenciaDeFachada(prefixo: string): string {
  return `${prefixo}-${new Date().getUTCFullYear()}-0000`;
}

export async function submitConsultation(input: unknown): Promise<ActionResult> {
  const parsed = consultationSchema.safeParse(input);

  if (!parsed.success) {
    // Armadilha preenchida: para fora parece sucesso, nada é guardado.
    if (parsed.error.issues.some((issue) => issue.path[0] === 'empresa_website')) {
      return { ok: true, reference: referenciaDeFachada('CP') };
    }
    return {
      ok: false,
      message: 'Corrija os campos assinalados e tente novamente.',
      fieldErrors: toFieldErrors(parsed.error.issues),
    };
  }

  const pedido = await guardarPedido('consulta', parsed.data);

  // TODO: avisar o serviço por correio (consultas@) — o registo já está feito.
  return { ok: true, reference: pedido.referencia };
}

export async function submitOccurrence(input: unknown): Promise<ActionResult> {
  const parsed = occurrenceSchema.safeParse(input);

  if (!parsed.success) {
    if (parsed.error.issues.some((issue) => issue.path[0] === 'empresa_website')) {
      return { ok: true, reference: referenciaDeFachada('OC') };
    }
    return {
      ok: false,
      message: 'Corrija os campos assinalados e tente novamente.',
      fieldErrors: toFieldErrors(parsed.error.issues),
    };
  }

  const pedido = await guardarPedido('ocorrencia', parsed.data);

  // TODO: atribuir à divisão competente na aplicação de gestão.
  return { ok: true, reference: pedido.referencia };
}

export async function submitBooking(input: unknown): Promise<ActionResult> {
  const parsed = bookingSchema.safeParse(input);

  if (!parsed.success) {
    if (parsed.error.issues.some((issue) => issue.path[0] === 'empresa_website')) {
      return { ok: true, reference: referenciaDeFachada('AT') };
    }
    return {
      ok: false,
      message: 'Corrija os campos assinalados e tente novamente.',
      fieldErrors: toFieldErrors(parsed.error.issues),
    };
  }

  const pedido = await guardarPedido('marcacao', parsed.data);

  // TODO: bloquear a hora na agenda do serviço e enviar o ficheiro ICS.
  return { ok: true, reference: pedido.referencia };
}

/* ------------------------------------------- acompanhamento pelo munícipe -- */

/**
 * Consulta o estado de um pedido pelo número de referência.
 *
 * Corre no servidor, de propósito. Antes a procura era feita no navegador,
 * sobre a lista de ocorrências que a página já trazia — o que só funcionava
 * porque essa lista era de exemplo. Com pedidos verdadeiros, mandar a
 * coleção toda para o navegador poria o nome, o correio e o telefone de
 * todos os munícipes na página de qualquer visitante. Por isso procura-se
 * aqui e devolve-se só `vistaPublica()`, que não leva dados de contacto
 * nenhuns — nem os do próprio.
 *
 * A referência vai no corpo do pedido, não no endereço: um número de
 * referência no URL fica no histórico do navegador, no cabeçalho `Referer`
 * e no registo de acessos de qualquer servidor pelo caminho.
 */
export async function consultarPedido(referenciaBruta: unknown): Promise<VistaPublica | null> {
  if (typeof referenciaBruta !== 'string') return null;

  const referencia = arrumarReferencia(referenciaBruta);
  if (!referenciaValida(referencia)) return null;

  const pedido = await encontrarPedido(referencia);
  if (pedido) return vistaPublica(pedido);

  // As ocorrências de exemplo só entram nas instalações de demonstração.
  // Numa instalação vendida seria indefensável: um munícipe que escrevesse
  // uma referência à sorte podia cair num caso inventado e tomá-lo por seu.
  if (process.env.DEMO_MODE === 'true') {
    const exemplo = occurrences.find((ocorrencia) => ocorrencia.reference === referencia);
    if (exemplo) return vistaDaOcorrenciaDeExemplo(exemplo);
  }

  return null;
}

/** Converte uma ocorrência de exemplo na mesma vista que os pedidos reais. */
function vistaDaOcorrenciaDeExemplo(exemplo: Occurrence): VistaPublica {
  const estado: Record<Occurrence['status'], VistaPublica['estado']> = {
    recebida: 'recebido',
    'em-resolucao': 'em-analise',
    resolvida: 'resolvido',
    'sem-seguimento': 'sem-seguimento',
  };

  return {
    referencia: exemplo.reference,
    tipo: 'ocorrencia',
    estado: estado[exemplo.status],
    criadoEm: exemplo.reportedAt,
    atualizadoEm: exemplo.resolvedAt,
    resumo: exemplo.description,
    resposta: exemplo.response,
  };
}

export async function subscribeNewsletter(input: unknown): Promise<ActionResult> {
  const parsed = newsletterSchema.safeParse(input);

  if (!parsed.success) {
    if (parsed.error.issues.some((issue) => issue.path[0] === 'empresa_website')) {
      return { ok: true };
    }
    return {
      ok: false,
      message: 'Indique um endereço válido e pelo menos um tema.',
      fieldErrors: toFieldErrors(parsed.error.issues),
    };
  }

  const temas = parsed.data.topics.filter(ehTema);
  if (temas.length === 0) {
    return { ok: false, message: 'Escolha pelo menos um tema.' };
  }

  // Dupla adesão: aqui não fica ninguém subscrito. Emite-se uma ligação
  // assinada e só o clique nela inscreve — ver src/lib/newsletter.ts.
  const testemunho = criarTestemunho(parsed.data.email, temas);
  const ligacao = `${site.url}/boletim/confirmar?t=${encodeURIComponent(testemunho)}`;

  const enviada = await enviarConfirmacao(parsed.data.email, ligacao);

  if (enviada) {
    return {
      ok: true,
      message: `Enviámos uma mensagem para ${parsed.data.email}. Abra a ligação que lá vem para confirmar — sem esse passo não fica subscrito.`,
    };
  }

  // Distinguir «não há serviço configurado» de «o serviço recusou» importa:
  // a primeira é o estado normal de uma demonstração, a segunda é uma avaria
  // que alguém tem de ir ver.
  return {
    ok: true,
    message: envioConfigurado()
      ? 'O pedido foi registado, mas o serviço de correio não respondeu. Tente de novo mais tarde ou escreva para geral@cm-alfandegadafe.pt.'
      : 'Portal em demonstração: ainda não há serviço de correio ligado, por isso a ligação de confirmação foi escrita no registo do servidor em vez de seguir por e-mail.',
  };
}
