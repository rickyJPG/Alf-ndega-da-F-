import { createHmac, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { join, dirname } from 'node:path';

/**
 * Boletim informativo, com dupla confirmação.
 *
 * Ninguém fica subscrito por alguém ter escrito o seu endereço num
 * formulário: o portal envia uma ligação e só o clique nessa ligação inscreve.
 * É a forma conforme ao RGPD e é a única honesta — a alternativa é uma câmara
 * municipal a enviar correio a quem nunca o pediu.
 *
 * A ligação leva um testemunho assinado com HMAC-SHA256 que contém o endereço,
 * os temas e o instante em que foi emitido. Não há registo de pendentes em
 * lado nenhum: o que confirma a subscrição é a assinatura, não uma linha numa
 * tabela. Uma ligação alterada não valida, uma ligação de outra pessoa não
 * inscreve esta, e passadas 48 horas deixa de valer.
 */

export const VALIDADE_HORAS = 48;

const TEMAS_VALIDOS = ['noticias', 'agenda', 'consultas', 'concursos', 'avisos'] as const;
export type Tema = (typeof TEMAS_VALIDOS)[number];

export function ehTema(valor: string): valor is Tema {
  return (TEMAS_VALIDOS as readonly string[]).includes(valor);
}

function segredo(): string {
  return process.env.NEWSLETTER_SECRET || process.env.ADMIN_SECRET || 'segredo-de-desenvolvimento';
}

function assinar(corpo: string): string {
  return createHmac('sha256', segredo()).update(corpo).digest('base64url');
}

function iguais(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/* ------------------------------------------------------------ testemunho -- */

interface Conteudo {
  email: string;
  temas: Tema[];
  emitidoEm: number;
}

export function criarTestemunho(email: string, temas: Tema[]): string {
  const corpo = Buffer.from(
    JSON.stringify({ email, temas, emitidoEm: Date.now() } satisfies Conteudo),
  ).toString('base64url');
  return `${corpo}.${assinar(corpo)}`;
}

export type LeituraDoTestemunho =
  | { estado: 'valido'; email: string; temas: Tema[] }
  | { estado: 'invalido' }
  | { estado: 'expirado' };

export function lerTestemunho(testemunho: string): LeituraDoTestemunho {
  const [corpo, assinatura] = testemunho.split('.');
  if (!corpo || !assinatura) return { estado: 'invalido' };
  if (!iguais(assinatura, assinar(corpo))) return { estado: 'invalido' };

  let conteudo: Conteudo;
  try {
    conteudo = JSON.parse(Buffer.from(corpo, 'base64url').toString('utf8')) as Conteudo;
  } catch {
    return { estado: 'invalido' };
  }

  if (typeof conteudo?.email !== 'string' || !Array.isArray(conteudo?.temas)) {
    return { estado: 'invalido' };
  }
  if (typeof conteudo.emitidoEm !== 'number' || !Number.isFinite(conteudo.emitidoEm)) {
    return { estado: 'invalido' };
  }
  if (Date.now() - conteudo.emitidoEm > VALIDADE_HORAS * 60 * 60 * 1000) {
    return { estado: 'expirado' };
  }

  return {
    estado: 'valido',
    email: conteudo.email,
    temas: conteudo.temas.filter((tema): tema is Tema => ehTema(tema)),
  };
}

/* ---------------------------------------------------------------- envio -- */

/** Há serviço de envio configurado? */
export function envioConfigurado(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * Sem serviço configurado, o portal está em demonstração: o formulário
 * funciona de ponta a ponta mas a ligação de confirmação é escrita no registo
 * do servidor em vez de seguir por correio.
 */
export function emModoDemonstracao(): boolean {
  return !envioConfigurado();
}

export async function enviarConfirmacao(email: string, ligacao: string): Promise<boolean> {
  const chave = process.env.RESEND_API_KEY;
  if (!chave) {
    console.info(
      `\n[boletim] Sem RESEND_API_KEY — nenhuma mensagem foi enviada.\n` +
        `[boletim] Ligação de confirmação para ${email}:\n[boletim] ${ligacao}\n`,
    );
    return false;
  }

  const remetente = process.env.NEWSLETTER_FROM || 'Município de Alfândega da Fé <geral@cm-alfandegadafe.pt>';

  try {
    const resposta = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${chave}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: remetente,
        to: [email],
        subject: 'Confirme a subscrição do boletim do Município',
        text: [
          'Recebemos um pedido para subscrever o boletim informativo do Município de Alfândega da Fé.',
          '',
          'Para confirmar, abra esta ligação:',
          ligacao,
          '',
          `A ligação é válida durante ${VALIDADE_HORAS} horas.`,
          '',
          'Se não foi você que fez o pedido, ignore esta mensagem — sem o clique não fica subscrito.',
        ].join('\n'),
      }),
    });

    if (!resposta.ok) {
      console.error('[boletim] o serviço de envio recusou:', resposta.status, await resposta.text());
      return false;
    }
    return true;
  } catch (erro) {
    console.error('[boletim] não foi possível contactar o serviço de envio:', erro);
    return false;
  }
}

/* ------------------------------------------------------------ subscrições -- */

export interface Subscricao {
  email: string;
  temas: Tema[];
  confirmadaEm: string;
}

const FICHEIRO = join(process.cwd(), 'conteudo', 'subscricoes.json');

async function lerSubscricoes(): Promise<Subscricao[]> {
  try {
    return JSON.parse(await readFile(FICHEIRO, 'utf8')) as Subscricao[];
  } catch (erro) {
    if ((erro as NodeJS.ErrnoException)?.code === 'ENOENT') return [];
    console.error('[boletim] não foi possível ler as subscrições:', erro);
    return [];
  }
}

/** Regista a subscrição confirmada. Repetir não duplica: atualiza os temas. */
export async function registarSubscricao(email: string, temas: Tema[]): Promise<void> {
  const lista = await lerSubscricoes();
  const normalizado = email.trim().toLowerCase();
  const restantes = lista.filter((item) => item.email !== normalizado);

  restantes.push({ email: normalizado, temas, confirmadaEm: new Date().toISOString() });

  await mkdir(dirname(FICHEIRO), { recursive: true });
  const temporario = `${FICHEIRO}.${process.pid}.tmp`;
  await writeFile(temporario, `${JSON.stringify(restantes, null, 2)}\n`, 'utf8');
  await rename(temporario, FICHEIRO);
}

export async function subscricoes(): Promise<Subscricao[]> {
  return lerSubscricoes();
}
