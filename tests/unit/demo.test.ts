import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * Modo de demonstração.
 *
 * O que estes testes guardam é sobretudo uma coisa: que **sem `DEMO_MODE`
 * nada disto existe**. Uma instalação vendida não pode ficar com restos da
 * demonstração, e não pode fechar-se sozinha porque alguém se esqueceu de
 * tirar uma variável do ficheiro de configuração.
 *
 * A seguir a isso, o limite do prazo: `DEMO_VALIDO_ATE=2026-12-15` quer
 * dizer que o dia 15 ainda funciona. Num mecanismo que corta o acesso, o
 * erro de um dia é o erro que acontece a meio de uma reunião.
 */

/** Cada teste importa de fresco: o módulo lê `process.env` ao ser chamado. */
async function comAmbiente(vars: Record<string, string | undefined>) {
  for (const [chave, valor] of Object.entries(vars)) {
    if (valor === undefined) vi.stubEnv(chave, '');
    else vi.stubEnv(chave, valor);
  }
  vi.resetModules();
  return import('@/lib/demo');
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('sem DEMO_MODE, a demonstração não existe', () => {
  it('não está em demonstração', async () => {
    const demo = await comAmbiente({ DEMO_MODE: undefined });
    expect(demo.emDemonstracao()).toBe(false);
  });

  it('DEMO_MODE com outro valor qualquer não conta', async () => {
    for (const valor of ['1', 'yes', 'True', 'sim', '']) {
      const demo = await comAmbiente({ DEMO_MODE: valor });
      expect(demo.emDemonstracao(), valor).toBe(false);
    }
  });

  it('DEMO_VALIDO_ATE sozinha não faz nada — nem com a data já passada', async () => {
    const demo = await comAmbiente({
      DEMO_MODE: undefined,
      DEMO_VALIDO_ATE: '2020-01-01',
      MOCK_TODAY: '2026-12-20',
    });

    // É o ponto que protege uma instalação vendida de se fechar sozinha.
    expect(demo.validoAte()).toBeNull();
    expect(demo.demonstracaoTerminada()).toBe(false);
    expect(demo.diasQueFaltam()).toBeNull();
  });

  it('DEMO_CONTACTO sozinha também não aparece em lado nenhum', async () => {
    const demo = await comAmbiente({ DEMO_MODE: undefined, DEMO_CONTACTO: 'alguem@exemplo.pt' });
    expect(demo.emDemonstracao()).toBe(false);
  });
});

describe('em demonstração, sem prazo', () => {
  it('está em demonstração e não termina', async () => {
    const demo = await comAmbiente({ DEMO_MODE: 'true', DEMO_VALIDO_ATE: undefined });

    expect(demo.emDemonstracao()).toBe(true);
    expect(demo.validoAte()).toBeNull();
    expect(demo.demonstracaoTerminada()).toBe(false);
    expect(demo.diasQueFaltam()).toBeNull();
  });
});

describe('o limite do prazo', () => {
  const PRAZO = '2026-12-15';

  it('o próprio dia do prazo ainda funciona', async () => {
    const demo = await comAmbiente({
      DEMO_MODE: 'true',
      DEMO_VALIDO_ATE: PRAZO,
      MOCK_TODAY: PRAZO,
    });

    // «Válido até 15» lê-se como «o 15 está dentro». É assim que uma
    // pessoa o entende, e é assim que tem de funcionar.
    expect(demo.demonstracaoTerminada()).toBe(false);
    expect(demo.diasQueFaltam()).toBe(0);
  });

  it('o dia seguinte já não', async () => {
    const demo = await comAmbiente({
      DEMO_MODE: 'true',
      DEMO_VALIDO_ATE: PRAZO,
      MOCK_TODAY: '2026-12-16',
    });

    expect(demo.demonstracaoTerminada()).toBe(true);
    expect(demo.diasQueFaltam()).toBe(-1);
  });

  it('a véspera conta um dia', async () => {
    const demo = await comAmbiente({
      DEMO_MODE: 'true',
      DEMO_VALIDO_ATE: PRAZO,
      MOCK_TODAY: '2026-12-14',
    });

    expect(demo.demonstracaoTerminada()).toBe(false);
    expect(demo.diasQueFaltam()).toBe(1);
  });

  it('conta os dias que faltam, atravessando meses', async () => {
    const demo = await comAmbiente({
      DEMO_MODE: 'true',
      DEMO_VALIDO_ATE: '2027-01-05',
      MOCK_TODAY: '2026-12-20',
    });

    expect(demo.diasQueFaltam()).toBe(16);
  });

  it('muito depois do prazo continua terminada', async () => {
    const demo = await comAmbiente({
      DEMO_MODE: 'true',
      DEMO_VALIDO_ATE: PRAZO,
      MOCK_TODAY: '2030-01-01',
    });

    expect(demo.demonstracaoTerminada()).toBe(true);
  });
});

describe('uma data mal escrita', () => {
  it('é ignorada, e a demonstração continua — não fecha por um erro de escrita', async () => {
    const queixas: unknown[][] = [];
    vi.spyOn(console, 'warn').mockImplementation((...args) => {
      queixas.push(args);
    });

    for (const ma of ['15-12-2026', '2026/12/15', 'dezembro', '2026-13-45-x', 'true']) {
      const demo = await comAmbiente({
        DEMO_MODE: 'true',
        DEMO_VALIDO_ATE: ma,
        MOCK_TODAY: '2026-12-20',
      });

      expect(demo.validoAte(), ma).toBeNull();
      // O importante: não fecha. Tratar uma data ilegível como «já expirou»
      // fechava a demonstração a meio de uma reunião.
      expect(demo.demonstracaoTerminada(), ma).toBe(false);
    }

    expect(queixas.length, 'e o problema fica no registo').toBeGreaterThan(0);
  });

  it('espaços à volta da data não a estragam', async () => {
    const demo = await comAmbiente({
      DEMO_MODE: 'true',
      DEMO_VALIDO_ATE: '  2026-12-15  ',
      MOCK_TODAY: '2026-12-16',
    });

    expect(demo.validoAte()).toBe('2026-12-15');
    expect(demo.demonstracaoTerminada()).toBe(true);
  });
});

describe('contacto para retomar a conversa', () => {
  it('é devolvido quando existe', async () => {
    const demo = await comAmbiente({ DEMO_MODE: 'true', DEMO_CONTACTO: 'vendas@exemplo.pt' });
    expect(demo.contactoDaDemo()).toBe('vendas@exemplo.pt');
  });

  it('vazio ou só espaços conta como não haver', async () => {
    for (const nada of ['', '   ']) {
      const demo = await comAmbiente({ DEMO_MODE: 'true', DEMO_CONTACTO: nada });
      // O ecrã não deve mostrar uma linha de contacto em branco.
      expect(demo.contactoDaDemo()).toBeUndefined();
    }
  });
});
