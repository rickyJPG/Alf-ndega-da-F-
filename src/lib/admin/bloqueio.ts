import { gravar, ler } from './deposito';

/**
 * Interruptor de emergência do portal público.
 *
 * Pensado para quem está a vender o portal a um município: mostra-se uma
 * demonstração a um interessado, e se a resposta for não, corta-se o acesso
 * na hora — sem desligar o servidor, sem mexer em DNS, sem SSH. Um clique no
 * painel e o endereço deixa de mostrar o portal a quem o abrir.
 *
 * `/admin` nunca é afetado — vive num ramo de rotas completamente separado
 * (`src/app/admin/layout.tsx`), por isso continua acessível para desligar o
 * bloqueio mesmo com o portal público às escuras.
 *
 * Usa a coleção `definicoes` do depósito: um objeto, não uma lista, mas o
 * mesmo mecanismo de leitura com semente e gravação atómica serve na mesma.
 */

export interface Definicoes {
  bloqueado: boolean;
  motivo?: string;
  /** Quando foi ligado — só para mostrar no painel, não para lógica alguma. */
  desde?: string;
}

const SEMENTE: Definicoes = { bloqueado: false };

export async function lerDefinicoes(): Promise<Definicoes> {
  return ler('definicoes', SEMENTE);
}

export async function portalBloqueado(): Promise<boolean> {
  return (await lerDefinicoes()).bloqueado;
}

export async function definirBloqueio(bloqueado: boolean, motivo?: string): Promise<void> {
  await gravar('definicoes', {
    bloqueado,
    ...(motivo ? { motivo } : {}),
    ...(bloqueado ? { desde: new Date().toISOString() } : {}),
  } satisfies Definicoes);
}
