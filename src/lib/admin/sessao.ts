import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Entrada no painel de administração.
 *
 * Uma palavra-passe partilhada pela equipa de comunicação, guardada em
 * `ADMIN_PASSWORD`, e uma sessão em cookie assinado. Não há base de dados de
 * utilizadores porque não é preciso: são três ou quatro pessoas, e a
 * autenticação a sério (Chave Móvel Digital, LDAP do Município) entra pelo
 * mesmo sítio quando existir — só muda o corpo de `credenciaisValidas`.
 *
 * **Sem `ADMIN_PASSWORD` definida**, é gerada uma palavra-passe aleatória no
 * arranque e escrita no registo do servidor. Assim o painel funciona logo em
 * desenvolvimento, mas nunca fica publicamente adivinhável — o contrário de
 * uma palavra-passe predefinida, que é como se perde um sítio institucional.
 */

const COOKIE = 'cmadf_admin';
const VALIDADE_HORAS = 12;

let avisoDado = false;
const palavraPasseGerada = randomBytes(9).toString('base64url');

function palavraPasse(): string {
  const configurada = process.env.ADMIN_PASSWORD;
  if (configurada) return configurada;

  if (!avisoDado) {
    avisoDado = true;
    console.warn(
      '\n[administração] ADMIN_PASSWORD não está definida.\n' +
        `[administração] Palavra-passe desta sessão do servidor: ${palavraPasseGerada}\n` +
        '[administração] Defina ADMIN_PASSWORD antes de pôr o portal no ar.\n',
    );
  }
  return palavraPasseGerada;
}

export function palavraPasseConfigurada(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function segredoDeAssinatura(): string {
  return process.env.ADMIN_SECRET || process.env.NEWSLETTER_SECRET || palavraPasse();
}

function assinar(corpo: string): string {
  return createHmac('sha256', segredoDeAssinatura()).update(corpo).digest('base64url');
}

/** Compara sem deixar o tempo de resposta revelar quantos caracteres batem. */
function iguais(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export function credenciaisValidas(tentativa: string): boolean {
  return iguais(tentativa, palavraPasse());
}

/** Abre sessão: grava o cookie assinado. */
export async function abrirSessao(): Promise<void> {
  const expiraEm = Date.now() + VALIDADE_HORAS * 60 * 60 * 1000;
  const corpo = String(expiraEm);
  const armazenamento = await cookies();

  armazenamento.set(COOKIE, `${corpo}.${assinar(corpo)}`, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: VALIDADE_HORAS * 60 * 60,
  });
}

export async function fecharSessao(): Promise<void> {
  const armazenamento = await cookies();
  armazenamento.delete(COOKIE);
}

/** A pessoa tem sessão aberta e válida? */
export async function temSessao(): Promise<boolean> {
  const armazenamento = await cookies();
  const valor = armazenamento.get(COOKIE)?.value;
  if (!valor) return false;

  const [corpo, assinatura] = valor.split('.');
  if (!corpo || !assinatura) return false;
  if (!iguais(assinatura, assinar(corpo))) return false;

  const expiraEm = Number(corpo);
  return Number.isFinite(expiraEm) && expiraEm > Date.now();
}

/**
 * Porta de entrada de cada ecrã do painel.
 *
 * Sem sessão, encaminha para a entrada em vez de mostrar um erro: quem chega
 * a `/admin/noticias` por um marcador antigo quer entrar, não quer ler uma
 * mensagem de acesso negado.
 */
export async function exigirEntrada(): Promise<void> {
  if (!(await temSessao())) redirect('/admin/entrar');
}
