import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { ehFotoExterna, fotoReal } from '@/lib/imagens';

/**
 * Resolução das fotografias do portal.
 *
 * O caso que dá nome a este ficheiro é o segundo: durante algum tempo, a
 * lista de ficheiros era guardada numa variável de módulo, viva enquanto o
 * processo vivesse. Uma fotografia carregada pelo painel ficava no disco mas
 * invisível no portal até alguém reiniciar o servidor — e o painel dizia
 * «Fotografia carregada», por isso ninguém percebia porquê.
 */

const POSICAO = '/images/visitar/cereja.svg';
const CARREGADA = join(
  process.cwd(),
  'conteudo',
  'ficheiros',
  'imagens',
  'visitar',
  'cereja.jpg',
);

afterEach(() => {
  rmSync(CARREGADA, { force: true });
});

describe('fotoReal', () => {
  it('sem ficheiro local, serve a fotografia da origem indicada', () => {
    expect(fotoReal(POSICAO)).toMatch(/^https?:\/\//);
  });

  it('vê uma fotografia carregada sem ser preciso reiniciar o servidor', () => {
    // Primeiro acesso: enche qualquer cache que exista.
    fotoReal(POSICAO);

    mkdirSync(join(CARREGADA, '..'), { recursive: true });
    writeFileSync(CARREGADA, Buffer.from([0xff, 0xd8, 0xff, 0xe0]));

    expect(fotoReal(POSICAO)).toBe('/ficheiros/imagens/visitar/cereja.jpg');
  });

  it('o ficheiro carregado ganha à fotografia da origem', () => {
    mkdirSync(join(CARREGADA, '..'), { recursive: true });
    writeFileSync(CARREGADA, Buffer.from([0xff, 0xd8, 0xff, 0xe0]));

    const resolvida = fotoReal(POSICAO);
    expect(resolvida).toBe('/ficheiros/imagens/visitar/cereja.jpg');
    expect(ehFotoExterna(resolvida)).toBe(false);
  });

  it('deixa em paz o que não é uma posição do portal', () => {
    expect(fotoReal('https://exemplo.pt/foto.jpg')).toBe('https://exemplo.pt/foto.jpg');
    expect(fotoReal('/images/logotipo-branco.png')).toBe('/images/logotipo-branco.png');
  });
});
