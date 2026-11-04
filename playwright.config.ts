import { defineConfig, devices } from '@playwright/test';

import { existsSync } from 'node:fs';

const PORT = Number(process.env.PORT ?? 3100);
const baseURL = process.env.BASE_URL ?? `http://127.0.0.1:${PORT}`;

/** Os outros dois estados do portal — ver o bloco `webServer` em baixo. */
export const PORT_DEMO = PORT + 1;
export const PORT_EXPIRADO = PORT + 2;
export const URL_DEMO = `http://127.0.0.1:${PORT_DEMO}`;
export const URL_EXPIRADO = `http://127.0.0.1:${PORT_EXPIRADO}`;

/**
 * Em ambientes onde o Chromium já vem instalado (contentores de CI com
 * imagem própria), aponta-se para esse executável em vez de o descarregar.
 * Fora desses casos, o Playwright usa o browser que instalou.
 */
const preinstalledChromium = process.env.PLAYWRIGHT_CHROMIUM_PATH ?? '/opt/pw-browsers/chromium';
const launchOptions = existsSync(preinstalledChromium)
  ? { executablePath: preinstalledChromium }
  : {};

/**
 * Os testes de ponta a ponta correm contra o build de produção, não contra o
 * servidor de desenvolvimento: é a única forma de verificar o que as pessoas
 * vão mesmo receber — incluindo o middleware de idioma e a pré-renderização.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],

  use: {
    baseURL,
    locale: 'pt-PT',
    timezoneId: 'Europe/Lisbon',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 }, launchOptions },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'], launchOptions },
    },
  ],

  /**
   * Três servidores do mesmo build, para se poderem verificar os três
   * estados em que o portal pode estar.
   *
   * Só o primeiro compila. Os outros dois esperam que ele responda e
   * arrancam o mesmo build com outras variáveis de ambiente — é a única
   * forma de testar `DEMO_MODE` a sério, porque uma variável de ambiente
   * não muda a meio da vida de um processo.
   *
   * O da porta 3100 é o normal, e é contra ele que corre a bateria toda.
   * Isso faz com que **todos** os testes sejam também uma verificação de
   * que, sem `DEMO_MODE`, não há vestígios da demonstração em lado nenhum.
   */
  webServer: [
    {
      command: `npm run build && npx next start --port ${PORT}`,
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
      // A palavra-passe do painel é fixada aqui para os testes de administração
      // poderem entrar. Sem ela, o servidor gera uma ao arrancar e escreve-a no
      // registo — bom para quem instala, impossível de adivinhar num teste.
      env: { MOCK_TODAY: '2026-07-25', ADMIN_PASSWORD: 'palavra-passe-de-teste' },
    },
    {
      // Demonstração a decorrer, com prazo ainda por chegar.
      //
      // Compila outra vez, para outra pasta: a faixa de demonstração e o
      // `noindex` das páginas ficam decididos na compilação, por isso não
      // há forma de os ver num build feito sem `DEMO_MODE`.
      command:
        `npx next build && npx next start --port ${PORT_DEMO}`,
      url: `http://127.0.0.1:${PORT_DEMO}`,
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
      env: {
        MOCK_TODAY: '2026-07-25',
        ADMIN_PASSWORD: 'palavra-passe-de-teste',
        DEMO_MODE: 'true',
        DEMO_VALIDO_ATE: '2026-12-15',
        DEMO_CONTACTO: 'demonstracao@exemplo.pt',
        NEXT_DIST_DIR: '.next-demonstracao',
      },
    },
    {
      // A mesma demonstração, com o prazo já passado: MOCK_TODAY é o dia
      // seguinte ao limite, que é exatamente a fronteira que interessa.
      //
      // Reaproveita o build do servidor anterior — e é isso que torna este
      // caso uma verificação a sério: o mesmo build, com uma data
      // diferente, tem de fechar-se sozinho. Se o prazo estivesse fixado na
      // compilação, este servidor abria na mesma.
      command: `node scripts/esperar-e-arrancar.mjs ${PORT_EXPIRADO} ${PORT_DEMO}`,
      url: `http://127.0.0.1:${PORT_EXPIRADO}`,
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
      env: {
        MOCK_TODAY: '2026-12-16',
        ADMIN_PASSWORD: 'palavra-passe-de-teste',
        DEMO_MODE: 'true',
        DEMO_VALIDO_ATE: '2026-12-15',
        DEMO_CONTACTO: 'demonstracao@exemplo.pt',
        NEXT_DIST_DIR: '.next-demonstracao',
      },
    },
  ],
});
