import { test, expect, type Page } from '@playwright/test';

/**
 * Contactos do Município.
 *
 * O que interessa verificar é o alcance: um número alterado no painel tem de
 * aparecer no rodapé de **todas** as páginas e na página de contactos, não
 * só no ecrã onde foi escrito. Era essa a razão de os tirar do código.
 *
 * Repõe os valores no fim. Ao contrário de uma notícia, os contactos não se
 * apagam — ficam no portal, e sem a reposição cada passagem deixava um
 * número de teste na demonstração.
 */

const PALAVRA_PASSE = 'palavra-passe-de-teste';
const TELEFONE_DE_TESTE = '279 111 222';

async function entrar(page: Page) {
  await page.goto('/admin/entrar');
  await page.getByLabel('Palavra-passe').fill(PALAVRA_PASSE);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

test.describe.serial('contactos', () => {
  test('o telefone alterado aparece no rodapé e na página de contactos', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'Escreve conteúdo — basta uma vez.');

    await entrar(page);
    await page.goto('/admin/contactos');

    const campo = page.getByLabel('Telefone');
    const original = await campo.inputValue();
    expect(original, 'o campo tem de vir preenchido com o número atual').not.toBe('');

    try {
      await campo.fill(TELEFONE_DE_TESTE);
      await page.getByRole('button', { name: 'Guardar contactos' }).click();
      await expect(page.getByRole('status')).toContainText('atualizados');

      // No rodapé de uma página qualquer do portal — não a de contactos.
      await page.goto('/servicos');
      await expect(page.locator('footer').getByText(TELEFONE_DE_TESTE)).toBeVisible();

      // E na página de contactos.
      await page.goto('/municipio/contactos');
      await expect(page.getByRole('main').getByText(TELEFONE_DE_TESTE).first()).toBeVisible();

      // A ligação `tel:` acompanha, em formato internacional.
      await expect(
        page.locator('footer a[href="tel:+351279111222"]').first(),
      ).toBeAttached();

      // E a ficha que os motores de busca leem, que ninguém vê e por isso é
      // a que mais facilmente ficaria a dizer o número antigo. Este serviço
      // não se trata pela internet — é por isso que a ficha leva telefone.
      await page.goto('/servicos/agua-e-residuos/contrato-de-agua');
      const fichas = await page.locator('script[type="application/ld+json"]').allTextContents();
      expect(fichas.join('\n')).toContain('+351279111222');
    } finally {
      await page.goto('/admin/contactos');
      await page.getByLabel('Telefone').fill(original);
      await page.getByRole('button', { name: 'Guardar contactos' }).click();
      await expect(page.getByRole('status')).toContainText('atualizados');
    }
  });

  test('recusa um código postal mal escrito', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'Basta uma vez.');

    await entrar(page);
    await page.goto('/admin/contactos');

    const campo = page.getByLabel('Código postal');
    const original = await campo.inputValue();

    await campo.fill('5350014');
    await page.getByRole('button', { name: 'Guardar contactos' }).click();

    await expect(page.getByRole('status')).toContainText('5350-014');

    // E nada foi gravado: ao recarregar, o valor bom continua lá.
    await page.reload();
    await expect(page.getByLabel('Código postal')).toHaveValue(original);
  });
});
