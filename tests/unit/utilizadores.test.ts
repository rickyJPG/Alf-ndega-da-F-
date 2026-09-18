import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Contas do painel.
 *
 * O que aqui se protege são três promessas, por ordem de gravidade:
 *
 *   1. **a palavra-passe nunca é guardada** — quem leia o ficheiro (uma cópia
 *      de segurança extraviada, por exemplo) não fica a saber nenhuma;
 *   2. **duas contas com a mesma palavra-passe não se parecem** — sem sal,
 *      bastava comparar os valores guardados para saber que coincidem;
 *   3. **não se pode ficar sem ninguém lá dentro** — apagar a última conta
 *      trancava toda a gente fora do painel, sem forma de voltar a entrar.
 */

let pasta: string;

beforeEach(() => {
  pasta = mkdtempSync(join(tmpdir(), 'contas-'));
  vi.spyOn(process, 'cwd').mockReturnValue(pasta);
  vi.resetModules();
});

afterEach(() => {
  vi.restoreAllMocks();
  rmSync(pasta, { recursive: true, force: true });
});

async function carregar() {
  return import('@/lib/admin/utilizadores');
}

describe('contas do painel', () => {
  it('começa sem contas nenhumas', async () => {
    const { haContas } = await carregar();
    expect(await haContas()).toBe(false);
  });

  it('aceita a palavra-passe certa e recusa a errada', async () => {
    const { acrescentar, autenticar } = await carregar();
    await acrescentar('Ana', 'uma-frase-que-eu-decoro');

    expect(await autenticar('Ana', 'uma-frase-que-eu-decoro')).not.toBeNull();
    expect(await autenticar('Ana', 'outra-coisa-qualquer')).toBeNull();
  });

  it('não guarda a palavra-passe em lado nenhum', async () => {
    const { acrescentar, lerUtilizadores } = await carregar();
    await acrescentar('Ana', 'uma-frase-que-eu-decoro');

    const bruto = JSON.stringify(await lerUtilizadores());
    expect(bruto).not.toContain('uma-frase-que-eu-decoro');
    expect(bruto).toContain('scrypt$');
  });

  it('duas contas com a mesma palavra-passe não se parecem', async () => {
    const { acrescentar, lerUtilizadores } = await carregar();
    await acrescentar('Ana', 'a-mesma-palavra-passe');
    await acrescentar('Bruno', 'a-mesma-palavra-passe');

    const [ana, bruno] = await lerUtilizadores();
    expect(ana.segredo).not.toBe(bruno.segredo);
  });

  it('não confunde o nome de uma conta com o de outra', async () => {
    const { acrescentar, autenticar } = await carregar();
    await acrescentar('Ana', 'palavra-passe-da-ana');
    await acrescentar('Bruno', 'palavra-passe-do-bruno');

    expect(await autenticar('Ana', 'palavra-passe-do-bruno')).toBeNull();
  });

  it('não se importa com maiúsculas no nome', async () => {
    const { acrescentar, autenticar } = await carregar();
    await acrescentar('Ana', 'uma-frase-que-eu-decoro');

    expect(await autenticar('ANA', 'uma-frase-que-eu-decoro')).not.toBeNull();
    expect(await autenticar('  ana  ', 'uma-frase-que-eu-decoro')).not.toBeNull();
  });

  it('recusa quem não existe, sem rebentar', async () => {
    const { acrescentar, autenticar } = await carregar();
    await acrescentar('Ana', 'uma-frase-que-eu-decoro');

    expect(await autenticar('Ninguém', 'seja-o-que-for')).toBeNull();
  });

  it('troca a palavra-passe e a antiga deixa de servir', async () => {
    const { acrescentar, autenticar, trocarPalavraPasse } = await carregar();
    const ana = await acrescentar('Ana', 'a-antiga-que-ja-nao-serve');

    await trocarPalavraPasse(ana.id, 'a-nova-a-partir-de-agora');

    expect(await autenticar('Ana', 'a-antiga-que-ja-nao-serve')).toBeNull();
    expect(await autenticar('Ana', 'a-nova-a-partir-de-agora')).not.toBeNull();
  });

  it('nunca deixa apagar a última conta', async () => {
    const { acrescentar, remover, haContas } = await carregar();
    const ana = await acrescentar('Ana', 'uma-frase-que-eu-decoro');

    expect(await remover(ana.id)).toBe(false);
    expect(await haContas()).toBe(true);
  });

  it('apaga uma conta quando há outras', async () => {
    const { acrescentar, remover, autenticar } = await carregar();
    const ana = await acrescentar('Ana', 'palavra-passe-da-ana');
    await acrescentar('Bruno', 'palavra-passe-do-bruno');

    expect(await remover(ana.id)).toBe(true);
    expect(await autenticar('Ana', 'palavra-passe-da-ana')).toBeNull();
    expect(await autenticar('Bruno', 'palavra-passe-do-bruno')).not.toBeNull();
  });

  it('o que sai para os ecrãs não leva o segredo', async () => {
    const { acrescentar, utilizadoresVisiveis } = await carregar();
    await acrescentar('Ana', 'uma-frase-que-eu-decoro');

    const visiveis = await utilizadoresVisiveis();
    expect(visiveis[0]).not.toHaveProperty('segredo');
    expect(visiveis[0].nome).toBe('Ana');
  });
});
