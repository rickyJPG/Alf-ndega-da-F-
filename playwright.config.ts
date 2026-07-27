import { defineConfig, devices } from '@playwright/test';

import { existsSync } from 'node:fs';

const PORT = Number(process.env.PORT ?? 3100);
const baseURL = process.env.BASE_URL ?? `http://127.0.0.1:${PORT}`;

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

  webServer: {
    command: `npm run build && npx next start --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    env: { MOCK_TODAY: '2026-07-25' },
  },
});
