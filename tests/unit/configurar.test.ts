import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

/**
 * O script que prepara `.env.local`.
 *
 * O que aqui se protege é uma coisa só, mas séria: **nunca substituir um
 * valor já escrito**. Se uma segunda execução gerasse uma palavra-passe
 * nova por cima da que o Município está a usar, toda a gente ficava de fora
 * do painel sem perceber porquê — e o script corre sozinho a cada `npm
 * start`, por isso isso aconteceria depressa.
 */

const SCRIPT = resolve(__dirname, '../../scripts/configurar.mjs');

let pasta: string;

beforeEach(() => {
  pasta = mkdtempSync(join(tmpdir(), 'configurar-'));
});

afterEach(() => {
  rmSync(pasta, { recursive: true, force: true });
});

function correr(): string {
  return execFileSync(process.execPath, [SCRIPT], { cwd: pasta, encoding: 'utf8' });
}

function envLocal(): string {
  return readFileSync(join(pasta, '.env.local'), 'utf8');
}

describe('preparação do .env.local', () => {
  it('cria as três chaves quando não há ficheiro nenhum', () => {
    correr();
    const conteudo = envLocal();

    expect(conteudo).toMatch(/^ADMIN_PASSWORD=.+$/m);
    expect(conteudo).toMatch(/^ADMIN_SECRET=.+$/m);
    expect(conteudo).toMatch(/^NEWSLETTER_SECRET=.+$/m);
  });

  it('mostra a palavra-passe a quem instala', () => {
    const saida = correr();
    const gravada = /^ADMIN_PASSWORD=(.+)$/m.exec(envLocal())?.[1];

    expect(gravada).toBeTruthy();
    expect(saida).toContain(gravada!);
  });

  it('não volta a mexer no que já lá está', () => {
    correr();
    const primeira = envLocal();

    correr();
    correr();

    expect(envLocal()).toBe(primeira);
  });

  it('respeita uma palavra-passe escolhida à mão', () => {
    writeFileSync(join(pasta, '.env.local'), 'ADMIN_PASSWORD=a-que-o-municipio-escolheu\n');
    correr();

    const conteudo = envLocal();
    expect(conteudo).toContain('ADMIN_PASSWORD=a-que-o-municipio-escolheu');
    // Só há uma — não foi acrescentada outra linha por baixo.
    expect(conteudo.match(/^ADMIN_PASSWORD=/gm)).toHaveLength(1);
    // E os segredos que faltavam foram acrescentados.
    expect(conteudo).toMatch(/^ADMIN_SECRET=.+$/m);
  });

  it('o ficheiro não fica legível para os outros utilizadores da máquina', () => {
    correr();
    // Contém a palavra-passe do painel: 600 e nada mais.
    expect(statSync(join(pasta, '.env.local')).mode & 0o077).toBe(0);
  });

  it('a palavra-passe é longa e sem caracteres que se confundam ao telefone', () => {
    correr();
    const palavraPasse = /^ADMIN_PASSWORD=(.+)$/m.exec(envLocal())![1];

    expect(palavraPasse.replace(/-/g, '')).toHaveLength(16);
    expect(palavraPasse).not.toMatch(/[l1O0o]/);
  });
});
