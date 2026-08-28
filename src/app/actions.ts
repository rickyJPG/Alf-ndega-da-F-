'use server';

import {
  bookingSchema,
  consultationSchema,
  newsletterSchema,
  occurrenceSchema,
} from '@/lib/forms/schemas';
import { criarTestemunho, ehTema, enviarConfirmacao, envioConfigurado } from '@/lib/newsletter';
import { site } from '@/lib/site';

/**
 * Server-Actions.
 *
 * Cada ação volta a validar no servidor — a verificação no navegador é
 * comodidade, a que vale é esta. O campo-armadilha é tratado em silêncio: um
 * robô recebe «enviado com sucesso» e não dá por nada.
 *
 * A ligação às aplicações de gestão faz-se nos pontos marcados com TODO.
 * Enquanto não existirem, o pedido é registado e recebe um número de
 * referência, para que todo o percurso possa ser percorrido de ponta a ponta.
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

/** Referenznummer im Format OC-2026-0448. */
function makeReference(prefix: string): string {
  const year = new Date().getFullYear();
  const sequence = String(Math.floor(Math.random() * 9000) + 1000);
  return `${prefix}-${year}-${sequence}`;
}

export async function submitConsultation(input: unknown): Promise<ActionResult> {
  const parsed = consultationSchema.safeParse(input);

  if (!parsed.success) {
    // Armadilha preenchida: para fora parece sucesso, nada é guardado.
    if (parsed.error.issues.some((issue) => issue.path[0] === 'empresa_website')) {
      return { ok: true, reference: makeReference('CP') };
    }
    return {
      ok: false,
      message: 'Corrija os campos assinalados e tente novamente.',
      fieldErrors: toFieldErrors(parsed.error.issues),
    };
  }

  // TODO: entregar ao serviço (e-mail para consultas@, registo no CMS).
  return { ok: true, reference: makeReference('CP') };
}

export async function submitOccurrence(input: unknown): Promise<ActionResult> {
  const parsed = occurrenceSchema.safeParse(input);

  if (!parsed.success) {
    if (parsed.error.issues.some((issue) => issue.path[0] === 'empresa_website')) {
      return { ok: true, reference: makeReference('OC') };
    }
    return {
      ok: false,
      message: 'Corrija os campos assinalados e tente novamente.',
      fieldErrors: toFieldErrors(parsed.error.issues),
    };
  }

  // TODO: abrir a ocorrência na aplicação de gestão e atribuí-la ao serviço competente.
  return { ok: true, reference: makeReference('OC') };
}

export async function submitBooking(input: unknown): Promise<ActionResult> {
  const parsed = bookingSchema.safeParse(input);

  if (!parsed.success) {
    if (parsed.error.issues.some((issue) => issue.path[0] === 'empresa_website')) {
      return { ok: true, reference: makeReference('AT') };
    }
    return {
      ok: false,
      message: 'Corrija os campos assinalados e tente novamente.',
      fieldErrors: toFieldErrors(parsed.error.issues),
    };
  }

  // TODO: bloquear a hora na agenda do serviço e enviar confirmação com ficheiro ICS.
  return { ok: true, reference: makeReference('AT') };
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
