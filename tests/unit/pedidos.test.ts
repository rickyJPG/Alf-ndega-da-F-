import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { occurrences } from '@/content/data/services-operational';
import {
  arrumarReferencia,
  ESTADOS,
  ESTADOS_ABERTOS,
  FORMATO_DA_REFERENCIA,
  referenciaValida,
  tipoDaReferencia,
} from '@/lib/estado-do-pedido';

/**
 * Pedidos dos munícipes.
 *
 * O que estes testes guardam é a diferença entre um formulário que funciona
 * e um que finge: antes, as três ações validavam, devolviam um número
 * inventado com `Math.random()` e descartavam tudo. O munícipe lia «Guarde
 * este número para acompanhar o estado» e do outro lado não havia nada.
 *
 * Por isso o que mais importa aqui não é o caminho feliz — é a unicidade das
 * referências, porque duas iguais põem um munícipe a ver o pedido de outro,
 * e a ausência de dados de contacto na vista pública, porque uma referência
 * não é uma senha.
 */

/* ------------------------------------------------------------ referências -- */

describe('formato da referência', () => {
  it('aceita as três famílias de pedido', () => {
    for (const boa of ['OC-2026-0001', 'CP-2026-0042', 'AT-2027-9999']) {
      expect(referenciaValida(boa), boa).toBe(true);
    }
  });

  it('recusa o que não é uma referência', () => {
    for (const ma of [
      'OC-2026-1',
      'OC-26-0001',
      'XX-2026-0001',
      'OC-2026-00001',
      'OC 2026 0001',
      '',
      'OC-2026-000a',
    ]) {
      expect(referenciaValida(ma), ma).toBe(false);
    }
  });

  it('perdoa minúsculas e espaços a quem copia de um papel', () => {
    expect(arrumarReferencia('  oc-2026-0001 ')).toBe('OC-2026-0001');
    expect(referenciaValida(' oc-2026-0001')).toBe(true);
  });

  it('diz de que tipo é a referência', () => {
    expect(tipoDaReferencia('OC-2026-0001')).toBe('ocorrencia');
    expect(tipoDaReferencia('CP-2026-0001')).toBe('consulta');
    expect(tipoDaReferencia('AT-2026-0001')).toBe('marcacao');
    expect(tipoDaReferencia('ZZ-2026-0001')).toBeNull();
  });

  it('o formato das ocorrências de exemplo é o mesmo que o portal gera', () => {
    // Se divergissem, a página de consulta encontrava uns e não outros — que
    // foi exatamente o problema que isto corrige.
    for (const exemplo of occurrences) {
      expect(FORMATO_DA_REFERENCIA.test(exemplo.reference), exemplo.reference).toBe(true);
    }
  });
});

describe('estados', () => {
  it('tem os quatro, e dois contam como abertos', () => {
    expect(ESTADOS).toEqual(['recebido', 'em-analise', 'resolvido', 'sem-seguimento']);
    expect(ESTADOS_ABERTOS).toEqual(['recebido', 'em-analise']);
  });
});

/* ------------------------------------------------------------- gravação -- */

describe('guardar, mudar de estado e apagar', () => {
  let pasta: string;

  beforeEach(() => {
    pasta = mkdtempSync(join(tmpdir(), 'pedidos-'));
    vi.spyOn(process, 'cwd').mockReturnValue(pasta);
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    rmSync(pasta, { recursive: true, force: true });
  });

  it('sem ficheiro, a lista está vazia', async () => {
    const { lerPedidos } = await import('@/lib/admin/pedidos');
    expect(await lerPedidos()).toEqual([]);
  });

  it('um pedido novo chega como «recebido», com data e referência', async () => {
    const { guardarPedido, lerPedidos } = await import('@/lib/admin/pedidos');

    const pedido = await guardarPedido('ocorrencia', {
      category: 'iluminacao',
      description: 'Candeeiro apagado na Rua da Corredoura.',
      name: 'Maria',
      email: 'maria@exemplo.pt',
    });

    expect(pedido.estado).toBe('recebido');
    expect(referenciaValida(pedido.referencia)).toBe(true);
    expect(pedido.referencia.startsWith('OC-')).toBe(true);
    expect(pedido.criadoEm).toMatch(/^\d{4}-\d{2}-\d{2}T/);

    const guardados = await lerPedidos();
    expect(guardados).toHaveLength(1);
    expect(guardados[0].dados.description).toContain('Candeeiro');
  });

  it('não guarda a armadilha nem a caixa de consentimento', async () => {
    const { guardarPedido } = await import('@/lib/admin/pedidos');

    const pedido = await guardarPedido('consulta', {
      name: 'João',
      contribution: 'Uma contribuição com mais de vinte caracteres.',
      consent: true,
      empresa_website: '',
    });

    expect(pedido.dados).not.toHaveProperty('consent');
    expect(pedido.dados).not.toHaveProperty('empresa_website');
    expect(pedido.dados).toHaveProperty('contribution');
  });

  it('as referências não se repetem, nem em rajada', async () => {
    const { guardarPedido } = await import('@/lib/admin/pedidos');

    // Em paralelo de propósito: num dia de aviso de corte de água, dois
    // formulários no mesmo segundo não é hipótese remota. Era aqui que o
    // `Math.random()` antigo dava duas vezes o mesmo número.
    const pedidos = await Promise.all(
      Array.from({ length: 25 }, () =>
        guardarPedido('ocorrencia', { description: 'Uma ocorrência qualquer.' }),
      ),
    );

    const referencias = pedidos.map((pedido) => pedido.referencia);
    expect(new Set(referencias).size, 'todas distintas').toBe(referencias.length);
  });

  it('nenhum pedido se perde quando chegam ao mesmo tempo', async () => {
    const { guardarPedido, lerPedidos } = await import('@/lib/admin/pedidos');

    await Promise.all(
      Array.from({ length: 25 }, (_, i) =>
        guardarPedido('marcacao', { serviceId: `servico-${i}`, date: '2026-10-20', time: '09:30' }),
      ),
    );

    // Ler-modificar-escrever sem fila perderia os do meio.
    expect(await lerPedidos()).toHaveLength(25);
  });

  it('a sequência arranca acima das ocorrências de exemplo', async () => {
    const { guardarPedido } = await import('@/lib/admin/pedidos');

    const pedido = await guardarPedido(
      'ocorrencia',
      { description: 'Uma ocorrência.' },
      new Date('2026-05-05T10:00:00.000Z'),
    );

    const usadasNoExemplo = occurrences
      .filter((o) => o.reference.startsWith('OC-2026-'))
      .map((o) => Number(o.reference.slice(-4)));
    const maiorDoExemplo = Math.max(...usadasNoExemplo);

    // Sem isto, uma instalação nova começava em 0001 e, ao chegar a 0418,
    // repetia uma referência que já está nos exemplos.
    expect(Number(pedido.referencia.slice(-4))).toBeGreaterThan(maiorDoExemplo);
  });

  it('a sequência é por tipo e por ano', async () => {
    const { guardarPedido } = await import('@/lib/admin/pedidos');
    const em = (iso: string) => new Date(iso);

    const consulta2026 = await guardarPedido(
      'consulta',
      { contribution: 'x'.repeat(30) },
      em('2026-03-01T00:00:00.000Z'),
    );
    const consulta2027 = await guardarPedido(
      'consulta',
      { contribution: 'y'.repeat(30) },
      em('2027-03-01T00:00:00.000Z'),
    );

    expect(consulta2026.referencia).toBe('CP-2026-0001');
    // Ano novo, contagem nova — não continua no 0002.
    expect(consulta2027.referencia).toBe('CP-2027-0001');
  });

  it('mudar o estado guarda a data e a resposta', async () => {
    const { guardarPedido, mudarEstado, lerPedidos } = await import('@/lib/admin/pedidos');

    const pedido = await guardarPedido('ocorrencia', { description: 'Buraco na estrada.' });
    const atualizado = await mudarEstado(pedido.referencia, 'resolvido', 'Reparado a 20 de outubro.');

    expect(atualizado?.estado).toBe('resolvido');
    expect(atualizado?.resposta).toBe('Reparado a 20 de outubro.');
    expect(atualizado?.atualizadoEm).toBeDefined();

    // E ficou gravado, não só devolvido.
    const [guardado] = await lerPedidos();
    expect(guardado.estado).toBe('resolvido');
  });

  it('uma resposta vazia apaga a anterior em vez de a deixar presa', async () => {
    const { guardarPedido, mudarEstado } = await import('@/lib/admin/pedidos');

    const pedido = await guardarPedido('ocorrencia', { description: 'Uma ocorrência.' });
    await mudarEstado(pedido.referencia, 'em-analise', 'A verificar no local.');
    const limpo = await mudarEstado(pedido.referencia, 'em-analise', '   ');

    expect(limpo?.resposta).toBeUndefined();
  });

  it('mudar o estado de um pedido que não existe não inventa nada', async () => {
    const { mudarEstado, lerPedidos } = await import('@/lib/admin/pedidos');

    expect(await mudarEstado('OC-2026-9999', 'resolvido')).toBeNull();
    expect(await lerPedidos()).toEqual([]);
  });

  it('apagar leva o registo e os dados pessoais que vinham com ele', async () => {
    const { guardarPedido, apagarPedido, lerPedidos } = await import('@/lib/admin/pedidos');

    const pedido = await guardarPedido('marcacao', {
      name: 'Ana',
      email: 'ana@exemplo.pt',
      phone: '279 468 120',
      serviceId: 'certidoes',
      date: '2026-10-20',
      time: '10:00',
    });

    expect(await apagarPedido(pedido.referencia)).toBe(true);
    expect(await lerPedidos()).toEqual([]);
    // Apagar o que já não existe não é um erro, mas também não é um sucesso.
    expect(await apagarPedido(pedido.referencia)).toBe(false);
  });

  it('conta como abertos os que ainda esperam resposta', async () => {
    const { guardarPedido, mudarEstado, contarAbertos } = await import('@/lib/admin/pedidos');

    const a = await guardarPedido('ocorrencia', { description: 'Primeira ocorrência.' });
    const b = await guardarPedido('ocorrencia', { description: 'Segunda ocorrência.' });
    await guardarPedido('ocorrencia', { description: 'Terceira ocorrência.' });

    expect(await contarAbertos()).toBe(3);

    await mudarEstado(a.referencia, 'em-analise');
    expect(await contarAbertos(), 'em análise ainda está aberto').toBe(3);

    await mudarEstado(b.referencia, 'resolvido');
    expect(await contarAbertos()).toBe(2);
  });
});

/* -------------------------------------------------------- vista do munícipe -- */

describe('o que o munícipe vê', () => {
  let pasta: string;

  beforeEach(() => {
    pasta = mkdtempSync(join(tmpdir(), 'pedidos-vista-'));
    vi.spyOn(process, 'cwd').mockReturnValue(pasta);
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    rmSync(pasta, { recursive: true, force: true });
  });

  it('não leva nome, correio nem telefone — nem os do próprio', async () => {
    const { guardarPedido, vistaPublica } = await import('@/lib/admin/pedidos');

    const pedido = await guardarPedido('ocorrencia', {
      description: 'Candeeiro apagado.',
      name: 'Maria Silva',
      email: 'maria@exemplo.pt',
      phone: '279 468 120',
      freguesia: 'cerejais',
    });

    const vista = vistaPublica(pedido);
    const serializada = JSON.stringify(vista);

    // Quem escreve um número de referência não prova ser quem o pediu.
    expect(serializada).not.toContain('Maria');
    expect(serializada).not.toContain('maria@exemplo.pt');
    expect(serializada).not.toContain('279');
    expect(Object.keys(vista).sort()).toEqual(
      ['atualizadoEm', 'criadoEm', 'estado', 'referencia', 'resposta', 'resumo', 'tipo'].sort(),
    );
  });

  it('resume cada tipo de pedido sem expor contactos', async () => {
    const { guardarPedido, vistaPublica } = await import('@/lib/admin/pedidos');

    const ocorrencia = await guardarPedido('ocorrencia', {
      description: 'Lixo por recolher na Rua Nova.',
      name: 'Zé',
    });
    expect(vistaPublica(ocorrencia).resumo).toBe('Lixo por recolher na Rua Nova.');

    const marcacao = await guardarPedido('marcacao', {
      name: 'Zé',
      date: '2026-10-20',
      time: '09:30',
    });
    const resumo = vistaPublica(marcacao).resumo;
    expect(resumo).toContain('2026-10-20');
    expect(resumo).not.toContain('Zé');
  });

  it('encontra o pedido pela referência, com ou sem maiúsculas', async () => {
    const { guardarPedido, encontrarPedido } = await import('@/lib/admin/pedidos');

    const pedido = await guardarPedido('ocorrencia', { description: 'Uma ocorrência.' });

    expect((await encontrarPedido(pedido.referencia))?.referencia).toBe(pedido.referencia);
    expect((await encontrarPedido(pedido.referencia.toLowerCase()))?.referencia).toBe(
      pedido.referencia,
    );
    expect(await encontrarPedido('OC-2026-0002')).toBeNull();
    expect(await encontrarPedido('nem parece uma referência')).toBeNull();
  });
});
