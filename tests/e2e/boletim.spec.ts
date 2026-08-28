import { test, expect } from '@playwright/test';

/**
 * Boletim informativo, com dupla adesão.
 *
 * O que interessa verificar não é que o formulário responde — é que **não
 * inscreve ninguém**. A subscrição só existe depois de a ligação enviada por
 * correio ser aberta, e uma ligação forjada tem de ser recusada.
 */

test.describe('subscrição do boletim', () => {
  test('o formulário responde e não promete mais do que faz', async ({ page }) => {
    await page.goto('/');

    const rodape = page.locator('footer');
    await rodape.getByLabel('Correio eletrónico').fill('municipe@exemplo.pt');
    await rodape.getByRole('button', { name: 'Subscrever' }).click();

    const confirmacao = rodape.getByRole('status');
    await expect(confirmacao).toBeVisible();

    // A mensagem tem de deixar claro que falta um passo — quem sai daqui a
    // pensar que já está subscrito nunca mais confirma.
    await expect(confirmacao).toContainText(/confirm|demonstração/i);
  });

  test('uma ligação de confirmação forjada não inscreve ninguém', async ({ page }) => {
    await page.goto('/boletim/confirmar?t=inventado.tambeminventado');

    await expect(page.getByText('Não foi possível confirmar')).toBeVisible();
    await expect(page.getByText('Subscrição confirmada')).toBeHidden();
  });

  test('sem testemunho nenhum, também não', async ({ page }) => {
    await page.goto('/boletim/confirmar');

    await expect(page.getByText('Não foi possível confirmar')).toBeVisible();
  });

  test('a página de confirmação fica fora dos motores de busca', async ({ page }) => {
    await page.goto('/boletim/confirmar');

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });
});
