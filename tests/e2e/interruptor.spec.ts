import { test, expect } from '@playwright/test';

/**
 * Interruptor de emergência do portal público.
 *
 * O que está em jogo aqui: sem DEMO_MODE, ninguém — nem a redação de um
 * município que comprou o portal — deve conseguir apagar o acesso público
 * com um clique. É por isso que a maior parte deste ficheiro testa a
 * AUSÊNCIA do botão, não a sua presença.
 *
 * Os testes que bloqueiam a sério só correm com DEMO_MODE=true, definido em
 * playwright.config.ts. Sem essa variável (o caso de uma instalação
 * vendida), o botão de bloquear não deve sequer aparecer no HTML.
 */

test.describe('sem DEMO_MODE — o caso de uma instalação vendida', () => {
  test('o botão de bloquear não existe no painel', async ({ page }) => {
    await page.goto('/admin/entrar');
    await page.getByLabel('Palavra-passe').fill('palavra-passe-de-teste');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByRole('button', { name: /bloquear o acesso público/i })).toHaveCount(0);
  });
});
