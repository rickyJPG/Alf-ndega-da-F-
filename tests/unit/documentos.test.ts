import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { ficheiroExiste } from '@/lib/documentos';

/**
 * Verificação de que o ficheiro de um documento existe mesmo.
 *
 * Dois problemas diferentes vivem aqui. O primeiro é de serviço: o catálogo
 * de exemplo vem cheio e a pasta dos ficheiros vem vazia, por isso o portal
 * oferecia dezenas de descarregamentos que davam 404 depois do clique.
 *
 * O segundo é de segurança: esta função recebe um caminho vindo do
 * conteúdo, e um `..` lá pelo meio não pode servir para espreitar ficheiros
 * fora de public/.
 */

const PASTA = join(process.cwd(), 'conteudo', 'ficheiros', 'documentos');
const FICHEIRO = join(PASTA, 'teste-unitario.pdf');

afterEach(() => {
  rmSync(FICHEIRO, { force: true });
});

describe('ficheiroExiste', () => {
  it('é falso quando o ficheiro não está lá', () => {
    expect(ficheiroExiste('/ficheiros/documentos/nao-existe-de-todo.pdf')).toBe(false);
  });

  it('é verdadeiro quando está', () => {
    mkdirSync(PASTA, { recursive: true });
    writeFileSync(FICHEIRO, '%PDF-1.4 teste');

    expect(ficheiroExiste('/ficheiros/documentos/teste-unitario.pdf')).toBe(true);
  });

  it('dá por bom um endereço externo, que daqui não se consegue verificar', () => {
    expect(ficheiroExiste('https://exemplo.pt/documento.pdf')).toBe(true);
  });

  it('não deixa sair da pasta com «..»', () => {
    // Existem de certeza, e estão fora das pastas servidas — a resposta
    // certa é falso, tanto no armazém como em public/.
    expect(ficheiroExiste('/ficheiros/../../package.json')).toBe(false);
    expect(ficheiroExiste('/ficheiros/documentos/../../../package.json')).toBe(false);
    expect(ficheiroExiste('/../package.json')).toBe(false);
    expect(ficheiroExiste('/documentos/../../package.json')).toBe(false);
  });
});
