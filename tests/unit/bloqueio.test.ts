import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * O interruptor de emergência do portal público.
 *
 * `deposito.ts` calcula a pasta de gravação (`process.cwd()/conteudo`) uma
 * vez, ao carregar o módulo — por isso cada teste aponta `process.cwd()`
 * para uma pasta temporária e volta a importar o módulo com
 * `vi.resetModules()`, em vez de escrever no `conteudo/` real do projeto.
 */

let pasta: string;
let cwdOriginal: string;

beforeEach(() => {
  pasta = mkdtempSync(join(tmpdir(), 'bloqueio-'));
  cwdOriginal = process.cwd();
  vi.spyOn(process, 'cwd').mockReturnValue(pasta);
  vi.resetModules();
});

afterEach(() => {
  vi.restoreAllMocks();
  rmSync(pasta, { recursive: true, force: true });
  process.chdir(cwdOriginal);
});

async function carregar() {
  return import('@/lib/admin/bloqueio');
}

describe('interruptor de emergência', () => {
  it('começa desbloqueado, sem ficheiro nenhum', async () => {
    const { portalBloqueado } = await carregar();
    expect(await portalBloqueado()).toBe(false);
  });

  it('bloqueia e o estado fica gravado', async () => {
    const { definirBloqueio, portalBloqueado, lerDefinicoes } = await carregar();

    await definirBloqueio(true, 'demonstração ao Município X');

    expect(await portalBloqueado()).toBe(true);
    const definicoes = await lerDefinicoes();
    expect(definicoes.motivo).toBe('demonstração ao Município X');
    expect(definicoes.desde).toBeTruthy();
  });

  it('desbloqueia', async () => {
    const { definirBloqueio, portalBloqueado } = await carregar();

    await definirBloqueio(true, 'a testar');
    await definirBloqueio(false);

    expect(await portalBloqueado()).toBe(false);
  });

  it('sobrevive a um ficheiro corrompido, do lado seguro (aberto)', async () => {
    const { writeFile, mkdir } = await import('node:fs/promises');
    await mkdir(join(pasta, 'conteudo'), { recursive: true });
    await writeFile(join(pasta, 'conteudo', 'definicoes.json'), '{ não é json válido');

    const { portalBloqueado } = await carregar();
    // Um ficheiro ilegível não deve trancar o portal por acidente — antes
    // aberto por engano do que fechado sem ninguém perceber porquê.
    expect(await portalBloqueado()).toBe(false);
  });
});
