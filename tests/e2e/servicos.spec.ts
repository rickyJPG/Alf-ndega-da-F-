import { test, expect, type Page } from '@playwright/test';

/**
 * Fichas de serviço.
 *
 * O que se verifica é a promessa do catálogo: as cinco respostas chegam ao
 * portal, e chegam completas. Uma ficha com a taxa em branco manda o
 * munícipe ao balcão perguntar — que é exatamente o que o portal existe para
 * evitar —, por isso o formulário recusa gravá-la assim.
 */

const PALAVRA_PASSE = 'palavra-passe-de-teste';
const NOME = 'Serviço de verificação automática';

async function entrar(page: Page) {
  await page.goto('/admin/entrar');
  await page.getByLabel('Palavra-passe').fill(PALAVRA_PASSE);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

/** Limpa restos de um lote interrompido a meio. */
async function limparRestos(page: Page) {
  await entrar(page);
  await page.goto('/admin/servicos');

  const linha = page.locator('li').filter({ hasText: NOME });
  if ((await linha.count()) === 0) return;

  await linha.first().getByRole('button', { name: 'Apagar' }).click();
  await linha.first().getByRole('button', { name: 'Sim, apagar' }).click();
  await expect(page.getByRole('link', { name: NOME, exact: true })).toBeHidden();
}

test.describe.serial('serviços', () => {
  test('o navegador trava logo numa resposta em falta', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'Escreve conteúdo — basta uma vez.');

    await limparRestos(page);
    await page.goto('/admin/servicos/novo');

    await page.getByLabel('Nome do serviço').fill(NOME);
    await page.getByLabel('Numa frase').fill('Uma frase qualquer.');
    // «A quem se destina», prazo e custo ficam em branco de propósito.
    await page.getByRole('button', { name: 'Criar serviço' }).click();

    // Nada é gravado, e o campo em falta fica assinalado pelo próprio
    // navegador — sem ida ao servidor e sem mensagem a meio da página.
    const porPreencher = page.getByLabel('A quem se destina');
    await expect(porPreencher).toBeFocused();
    expect(await porPreencher.evaluate((campo: HTMLTextAreaElement) => campo.validity.valid)).toBe(
      false,
    );
  });

  test('o servidor recusa uma ficha sem nenhum passo', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'Escreve conteúdo — basta uma vez.');

    await entrar(page);
    await page.goto('/admin/servicos/novo');

    // Tudo o que o navegador exige, preenchido. Só os passos ficam vazios —
    // e esses não são obrigatórios no HTML, por isso o pedido chega mesmo ao
    // servidor. É lá que tem de ser travado.
    await page.getByLabel('Nome do serviço').fill(NOME);
    await page.getByLabel('Numa frase').fill('Uma frase qualquer.');
    await page.getByLabel('A quem se destina').fill('A quem quer que seja.');
    await page.getByLabel('Quanto tempo demora').fill('Imediato');
    await page.getByLabel('Quanto custa').fill('Gratuito');

    await page.getByRole('button', { name: 'Criar serviço' }).click();

    await expect(page.getByRole('status')).toContainText('pelo menos um passo');
  });

  test('a ficha completa chega ao portal com as cinco respostas', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'Escreve conteúdo — basta uma vez.');

    await entrar(page);
    await page.goto('/admin/servicos/novo');

    await page.getByLabel('Nome do serviço').fill(NOME);
    await page.getByLabel('Numa frase').fill('Para confirmar que a ficha aparece inteira.');
    await page.getByLabel('A quem se destina').fill('A quem estiver a ler este teste.');
    await page.getByLabel('O que é preciso levar').fill('Cartão de cidadão\nComprovativo de morada');
    await page.getByLabel('Quanto tempo demora').fill('Até 15 dias úteis');
    await page.getByLabel('Quanto custa').fill('27,50 €');

    await page.getByPlaceholder('O que fazer').fill('Reúna os documentos');
    await page.getByPlaceholder('A explicação').fill('Os dois indicados em cima.');

    // Um segundo passo, para confirmar que a lista cresce.
    await page.getByRole('button', { name: 'Acrescentar passo' }).click();
    await page.getByPlaceholder('O que fazer').nth(1).fill('Entregue ao balcão');
    await page.getByPlaceholder('A explicação').nth(1).fill('Largo de D. Dinis, de manhã.');

    await page.getByRole('button', { name: 'Criar serviço' }).click();
    await expect(page.getByRole('status')).toContainText('criado');

    // No portal: as respostas todas, incluindo a taxa e o prazo, que são as
    // que mais vezes obrigam a telefonar quando faltam.
    await page.goto('/servicos/balcao/servico-de-verificacao-automatica');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(NOME);
    await expect(page.getByText('27,50 €')).toBeVisible();
    await expect(page.getByText('Até 15 dias úteis')).toBeVisible();
    await expect(page.getByText('Comprovativo de morada')).toBeVisible();
    await expect(page.getByText('Entregue ao balcão')).toBeVisible();
  });

  test('apagar tira a ficha do portal', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'Escreve conteúdo — basta uma vez.');

    await entrar(page);
    await page.goto('/admin/servicos');

    const linha = page.locator('li').filter({ hasText: NOME });
    await linha.first().getByRole('button', { name: 'Apagar' }).click();
    await linha.first().getByRole('button', { name: 'Sim, apagar' }).click();

    await expect(page.getByRole('link', { name: NOME, exact: true })).toBeHidden();

    const resposta = await page.goto('/servicos/balcao/servico-de-verificacao-automatica');
    expect(resposta?.status()).toBe(404);
  });
});
