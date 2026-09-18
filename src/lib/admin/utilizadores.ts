import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

import { gravar, ler } from './deposito';

/**
 * Quem pode entrar no painel.
 *
 * Substitui a palavra-passe única partilhada pela equipa. O problema dela
 * não era técnico: quando alguém saía dos serviços, continuava a saber a
 * palavra-passe de toda a gente, e trocá-la obrigava a avisar todos. Com
 * contas separadas, tira-se uma e as outras ficam como estavam.
 *
 * As palavras-passe nunca são guardadas — guarda-se o resultado de as passar
 * por scrypt, com um sal diferente para cada uma. Quem leia o ficheiro (uma
 * cópia de segurança extraviada, por exemplo) não fica a saber nenhuma.
 *
 * scrypt e não SHA: é propositadamente lento e pesado em memória, para que
 * tentar milhões de palavras-passe à força bruta deixe de compensar. Vem com
 * o Node, sem dependência nenhuma.
 */

const derivar = promisify(scrypt) as (
  palavraPasse: string,
  sal: Buffer,
  comprimento: number,
) => Promise<Buffer>;

const COMPRIMENTO = 64;

export interface Utilizador {
  id: string;
  nome: string;
  /** `scrypt$<sal>$<derivada>`, tudo em base64url. */
  segredo: string;
  criadoEm: string;
}

/** O que sai para os ecrãs: tudo menos o segredo. */
export type UtilizadorVisivel = Omit<Utilizador, 'segredo'>;

export async function lerUtilizadores(): Promise<Utilizador[]> {
  return ler<Utilizador[]>('utilizadores', []);
}

export async function utilizadoresVisiveis(): Promise<UtilizadorVisivel[]> {
  const lista = await lerUtilizadores();
  return lista
    .map(({ segredo: _segredo, ...resto }) => resto)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt'));
}

/**
 * Há contas criadas?
 *
 * Enquanto não houver, o painel continua a aceitar a palavra-passe única de
 * `ADMIN_PASSWORD`. É o que faz uma instalação existente continuar a
 * funcionar depois de uma atualização, sem ninguém ficar fora à espera de
 * criar a primeira conta — e o que permite criá-la a partir de dentro.
 */
export async function haContas(): Promise<boolean> {
  return (await lerUtilizadores()).length > 0;
}

/* ------------------------------------------------------- palavras-passe -- */

export async function criarSegredo(palavraPasse: string): Promise<string> {
  const sal = randomBytes(16);
  const derivada = await derivar(palavraPasse, sal, COMPRIMENTO);
  return `scrypt$${sal.toString('base64url')}$${derivada.toString('base64url')}`;
}

async function segredoConfere(palavraPasse: string, guardado: string): Promise<boolean> {
  const [algoritmo, salBase64, esperadoBase64] = guardado.split('$');
  if (algoritmo !== 'scrypt' || !salBase64 || !esperadoBase64) return false;

  const esperado = Buffer.from(esperadoBase64, 'base64url');
  if (esperado.length !== COMPRIMENTO) return false;

  const derivada = await derivar(palavraPasse, Buffer.from(salBase64, 'base64url'), COMPRIMENTO);
  return timingSafeEqual(derivada, esperado);
}

/**
 * Confirma quem está a entrar. Devolve a conta, ou `null`.
 *
 * Compara sempre contra alguma coisa, mesmo quando o nome não existe: sem
 * isso, uma resposta rápida denunciava «este nome não existe» e uma lenta
 * «existe, mas a palavra-passe está errada» — um convite a descobrir os
 * nomes das contas uma a uma.
 */
export async function autenticar(nome: string, palavraPasse: string): Promise<Utilizador | null> {
  const lista = await lerUtilizadores();
  const procurado = nome.trim().toLowerCase();
  const utilizador = lista.find((item) => item.nome.toLowerCase() === procurado);

  if (!utilizador) {
    await segredoConfere(palavraPasse, await criarSegredo('nada-que-sirva'));
    return null;
  }

  return (await segredoConfere(palavraPasse, utilizador.segredo)) ? utilizador : null;
}

export async function porId(id: string): Promise<Utilizador | undefined> {
  return (await lerUtilizadores()).find((item) => item.id === id);
}

/* ------------------------------------------------------------- escrita -- */

export async function acrescentar(nome: string, palavraPasse: string): Promise<Utilizador> {
  const lista = await lerUtilizadores();

  const utilizador: Utilizador = {
    id: randomBytes(8).toString('hex'),
    nome: nome.trim(),
    segredo: await criarSegredo(palavraPasse),
    criadoEm: new Date().toISOString(),
  };

  await gravar('utilizadores', [...lista, utilizador]);
  return utilizador;
}

export async function trocarPalavraPasse(id: string, palavraPasse: string): Promise<boolean> {
  const lista = await lerUtilizadores();
  const indice = lista.findIndex((item) => item.id === id);
  if (indice === -1) return false;

  const segredo = await criarSegredo(palavraPasse);
  const atualizada = lista.map((item, i) => (i === indice ? { ...item, segredo } : item));

  await gravar('utilizadores', atualizada);
  return true;
}

export async function remover(id: string): Promise<boolean> {
  const lista = await lerUtilizadores();
  // Nunca deixar o painel sem ninguém que possa entrar.
  if (lista.length <= 1) return false;

  await gravar(
    'utilizadores',
    lista.filter((item) => item.id !== id),
  );
  return true;
}
