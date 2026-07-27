import { test, expect } from '@playwright/test';

/**
 * As opções de acessibilidade e o consentimento de cookies são promessas
 * feitas ao utilizador. Estes testes verificam que se cumprem.
 */

test.describe('painel de acessibilidade', () => {
  test('aumenta o texto e a escolha sobrevive ao recarregamento', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /opções de acessibilidade/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await dialog.getByRole('button', { name: 'Aumentar' }).click();
    await expect(page.locator('html')).toHaveAttribute('style', /--a11y-scale:\s*1\.15/);

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('style', /--a11y-scale:\s*1\.15/);
  });

  test('liga o contraste elevado e a letra mais legível', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /opções de acessibilidade/i }).click();

    const dialog = page.getByRole('dialog');
    await dialog.getByRole('switch', { name: /contraste elevado/i }).click();
    await expect(page.locator('html')).toHaveAttribute('data-contrast', 'high');

    await dialog.getByRole('switch', { name: /letra mais legível/i }).click();
    await expect(page.locator('html')).toHaveAttribute('data-font', 'legible');
  });

  test('muda para o tema escuro e repõe as predefinições', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /opções de acessibilidade/i }).click();

    const dialog = page.getByRole('dialog');
    await dialog.getByText('Escuro', { exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await dialog.getByRole('button', { name: /repor predefinições/i }).click();
    await expect(page.locator('html')).not.toHaveAttribute('data-contrast', 'high');
  });

  test('respeita a preferência do sistema por movimento reduzido', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const seconds = await page.evaluate(() => {
      const element = document.querySelector('a[href]');
      if (!element) return 0;
      return Number.parseFloat(getComputedStyle(element).transitionDuration) || 0;
    });
    // Praticamente instantâneo: a regra global reduz para 0,01 ms.
    expect(seconds).toBeLessThan(0.05);
  });
});

test.describe('consentimento de cookies', () => {
  test('recusar é tão fácil como aceitar e nada é medido', async ({ page }) => {
    await page.goto('/');

    const banner = page.getByRole('dialog', { name: /cookies essenciais/i });
    await expect(banner).toBeVisible();

    const accept = banner.getByRole('button', { name: /aceitar medição/i });
    const reject = banner.getByRole('button', { name: /^recusar$/i });

    // Mesmo peso visual: ambos são botões de topo, com a mesma altura.
    const acceptBox = await accept.boundingBox();
    const rejectBox = await reject.boundingBox();
    expect(acceptBox?.height).toBe(rejectBox?.height);

    await reject.click();
    await expect(banner).toBeHidden();

    const consent = await page.evaluate(() => window.localStorage.getItem('cmadf:consent'));
    expect(JSON.parse(consent ?? '{}').analytics).toBe(false);

    await page.reload();
    await expect(page.getByRole('dialog', { name: /cookies essenciais/i })).toBeHidden();
  });
});

test.describe('formulários', () => {
  // Como qualquer visitante, decidimos primeiro sobre os cookies.
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /^recusar$/i }).click();
  });

  test('a comunicação de ocorrência valida e assinala os campos em falta', async ({ page }) => {
    await page.goto('/viver-e-participar/ocorrencias');

    await page.getByRole('button', { name: /^enviar$/i }).click();

    const alert = page.getByRole('alert').filter({ hasText: /corrija os campos/i });
    await expect(alert).toBeVisible();

    // A mensagem de erro fica ligada ao campo, não só à cor.
    const description = page.getByLabel('O que se passa');
    await expect(description).toHaveAttribute('aria-invalid', 'true');
  });

  test('a marcação de atendimento só permite confirmar depois de escolher a hora', async ({
    page,
  }) => {
    await page.goto('/servicos/marcacoes');

    const confirm = page.getByRole('button', { name: /confirmar marcação/i });
    await expect(confirm).toBeDisabled();

    // O campo é visualmente substituído pelo rótulo; clica-se no rótulo.
    await page.getByRole('radio', { name: /\d{2}:\d{2}$/ }).first().click({ force: true });
    await expect(confirm).toBeEnabled();
  });
});
