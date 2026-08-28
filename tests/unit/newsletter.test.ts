import { describe, expect, it, vi, afterEach } from 'vitest';

import { criarTestemunho, lerTestemunho, VALIDADE_HORAS } from '@/lib/newsletter';

/**
 * O que aqui se verifica é a promessa da dupla adesão: **só o dono do
 * endereço consegue inscrever o endereço**.
 *
 * Tudo assenta na assinatura do testemunho. Se ela pudesse ser forjada ou
 * ignorada, qualquer pessoa inscrevia qualquer outra no boletim de uma câmara
 * municipal — e a proteção de dados deixaria de ser uma promessa para passar a
 * ser um problema. Por isso cada caso abaixo é um ataque, não um cenário
 * acidental.
 */

afterEach(() => {
  vi.useRealTimers();
});

describe('testemunho de confirmação do boletim', () => {
  it('aceita um testemunho acabado de emitir', () => {
    const testemunho = criarTestemunho('municipe@exemplo.pt', ['noticias', 'avisos']);
    const leitura = lerTestemunho(testemunho);

    expect(leitura.estado).toBe('valido');
    if (leitura.estado !== 'valido') return;
    expect(leitura.email).toBe('municipe@exemplo.pt');
    expect(leitura.temas).toEqual(['noticias', 'avisos']);
  });

  it('recusa um testemunho com a assinatura alterada', () => {
    const testemunho = criarTestemunho('municipe@exemplo.pt', ['noticias']);
    const [corpo] = testemunho.split('.');

    expect(lerTestemunho(`${corpo}.assinaturaInventada`).estado).toBe('invalido');
  });

  it('não deixa inscrever o endereço de outra pessoa', () => {
    // O ataque óbvio: pegar numa ligação válida e trocar o endereço lá dentro,
    // mantendo a assinatura. Tem de falhar.
    const meu = criarTestemunho('eu@exemplo.pt', ['noticias']);
    const [, assinatura] = meu.split('.');

    const corpoDeOutro = Buffer.from(
      JSON.stringify({ email: 'vitima@exemplo.pt', temas: ['noticias'], emitidoEm: Date.now() }),
    ).toString('base64url');

    expect(lerTestemunho(`${corpoDeOutro}.${assinatura}`).estado).toBe('invalido');
  });

  it('expira passadas as horas de validade', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-25T10:00:00Z'));
    const testemunho = criarTestemunho('municipe@exemplo.pt', ['noticias']);

    // Uma hora antes do limite ainda vale.
    vi.setSystemTime(new Date(Date.now() + (VALIDADE_HORAS - 1) * 60 * 60 * 1000));
    expect(lerTestemunho(testemunho).estado).toBe('valido');

    // Uma hora depois, já não.
    vi.setSystemTime(new Date(Date.now() + 2 * 60 * 60 * 1000));
    expect(lerTestemunho(testemunho).estado).toBe('expirado');
  });

  it('recusa lixo sem rebentar', () => {
    for (const entrada of ['', '.', 'sem-ponto', 'a.b', 'YWJj.YWJj']) {
      expect(lerTestemunho(entrada).estado).toBe('invalido');
    }
  });

  it('ignora temas que não existem', () => {
    const testemunho = criarTestemunho('municipe@exemplo.pt', [
      'noticias',
      'inventado',
    ] as never);
    const leitura = lerTestemunho(testemunho);

    expect(leitura.estado).toBe('valido');
    if (leitura.estado !== 'valido') return;
    expect(leitura.temas).toEqual(['noticias']);
  });
});
