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

/**
 * Quanto tempo dura uma sessão sem se mexer nela. Sete dias por omissão:
 * a equipa entra na segunda-feira e trabalha a semana toda sem voltar a
 * escrever a palavra-passe. Quem preferir mais curto define
 * `ADMIN_SESSAO_HORAS`.
 */
const VALIDADE_HORAS = Number(process.env.ADMIN_SESSAO_HORAS) || 24 * 7;

let avisoDado = false;
const palavraPasseGerada = randomBytes(9).toString('base64url');

function palavraPasse(): string {
  const configurada = process.env.ADMIN_PASSWORD;
  if (configurada) return configurada;

  if (!avisoDado) {
    avisoDado = true;
    console.warn(
      '\n[administração] ADMIN_PASSWORD não está definida.\n' +
        `[administração] Palavra-passe TEMPORÁRIA deste arranque: ${palavraPasseGerada}\n` +
        '[administração] Atenção: muda a cada reinício, e quem estiver com\n' +
        '[administração] sessão aberta é desligado quando isso acontece.\n' +
        '[administração] Para uma palavra-passe fixa, corra: npm run configurar\n',
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

/* ------------------------------------------------------------- conteúdo -- */

/**
 * O que vai dentro do cookie, assinado.
 *
 * `quem` é o identificador da conta que entrou — ausente nas sessões abertas
 * com a palavra-passe única de `ADMIN_PASSWORD`, que continua a valer
 * enquanto não houver contas criadas.
 */
interface Conteudo {
  expiraEm: number;
  quem?: string;
}

function empacotar(conteudo: Conteudo): string {
  return Buffer.from(JSON.stringify(conteudo)).toString('base64url');
}

function desempacotar(corpo: string): Conteudo | null {
  try {
    const conteudo = JSON.parse(Buffer.from(corpo, 'base64url').toString('utf8')) as Conteudo;
    if (typeof conteudo?.expiraEm !== 'number' || !Number.isFinite(conteudo.expiraEm)) return null;
    if (conteudo.quem !== undefined && typeof conteudo.quem !== 'string') return null;
    return conteudo;
  } catch {
    return null;
  }
}

/** Abre sessão: grava o cookie assinado. */
export async function abrirSessao(quem?: string): Promise<void> {
  const corpo = empacotar({
    expiraEm: Date.now() + VALIDADE_HORAS * 60 * 60 * 1000,
    ...(quem ? { quem } : {}),
  });
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

/** A sessão aberta, se houver uma válida. */
async function sessaoAtual(): Promise<Conteudo | null> {
  const armazenamento = await cookies();
  const valor = armazenamento.get(COOKIE)?.value;
  if (!valor) return null;

  const [corpo, assinatura] = valor.split('.');
  if (!corpo || !assinatura) return null;
  if (!iguais(assinatura, assinar(corpo))) return null;

  const conteudo = desempacotar(corpo);
  if (!conteudo || conteudo.expiraEm <= Date.now()) return null;

  return conteudo;
}

/** A pessoa tem sessão aberta e válida? */
export async function temSessao(): Promise<boolean> {
  return (await sessaoAtual()) !== null;
}

/** Quem está com sessão aberta — `undefined` com a palavra-passe única. */
export async function quemEstaDentro(): Promise<string | undefined> {
  return (await sessaoAtual())?.quem;
}

/**
 * Empurra o fim da sessão para a frente enquanto se está a trabalhar.
 *
 * Chamada pelas ações do painel — é o único sítio onde o Next deixa mesmo
 * escrever um cookie (numa página normal, `cookies().set()` rebenta). Na
 * prática: quem publica qualquer coisa nunca é desligado a meio; quem fecha
 * o painel e desaparece uma semana volta a entrar, como deve ser.
 *
 * Só renova depois de passada metade do prazo, para não reescrever o cookie
 * a cada clique.
 */
export async function renovarSessao(): Promise<void> {
  const conteudo = await sessaoAtual();
  if (!conteudo) return;

  const total = VALIDADE_HORAS * 60 * 60 * 1000;
  if (conteudo.expiraEm - Date.now() > total / 2) return;

  await abrirSessao(conteudo.quem);
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
