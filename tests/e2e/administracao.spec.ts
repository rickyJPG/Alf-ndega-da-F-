import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Painel de administração.
 *
 * O que aqui se verifica é o circuito que a redação faz todos os dias:
 * entrar, escrever, ver aparecer no portal, corrigir, apagar. Se isto
 * funcionar, o painel serve; se falhar, alguém do Município fica sem
 * conseguir publicar — e não há forma de contornar.
 *
 * Os testes que escrevem correm em série e limpam o que criaram: partilham o
 * mesmo servidor com todos os outros testes, e conteúdo esquecido aqui
 * apareceria no portal a meio de outra verificação.
 */

const PALAVRA_PASSE = 'palavra-passe-de-teste';

async function entrar(page: Page) {
  await page.goto('/admin/entrar');
  await page.getByLabel('Palavra-passe').fill(PALAVRA_PASSE);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

test.describe('entrada', () => {
  test('sem sessão, qualquer ecrã do painel leva à entrada', async ({ page }) => {
    await page.goto('/admin/noticias');
    await expect(page).toHaveURL(/\/admin\/entrar$/);
    await expect(page.getByLabel('Palavra-passe')).toBeVisible();
  });

  test('palavra-passe errada não deixa entrar', async ({ page }) => {
    await page.goto('/admin/entrar');
    await page.getByLabel('Palavra-passe').fill('nao-e-esta');
    await page.getByRole('button', { name: 'Entrar' }).click();

    // Pelo id, não por `role=alert`: o Next tem o seu próprio elemento com
    // esse papel (o anunciador de rota) e um `getByRole` apanharia os dois.
    await expect(page.locator('#erro-entrada')).toContainText('incorreta');
    await expect(page).toHaveURL(/\/admin\/entrar$/);
  });

  test('o painel não é indexável pelos motores de busca', async ({ page }) => {
    await page.goto('/admin/entrar');
    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveAttribute('content', /noindex/);
  });

  test('a palavra-passe certa abre o painel', async ({ page }) => {
    await entrar(page);
    await expect(page).toHaveURL(/\/admin$/);
    await expect(
      page.getByRole('navigation', { name: 'Secções da administração' }),
    ).toBeVisible();
  });
});

test.describe.serial('publicar', () => {
  const TITULO = 'Notícia de verificação automática';
  const TITULO_CORRIGIDO = 'Notícia de verificação automática (corrigida)';

  test('escrever uma notícia põe-na no portal', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'Escreve conteúdo — basta uma vez.');

    await entrar(page);
    await page.goto('/admin/noticias/nova');

    await page.getByLabel('Título').fill(TITULO);
    await page.getByLabel('Resumo').fill('Escrita por um teste, apagada pelo mesmo teste.');
    await page
      .getByLabel('Texto da notícia')
      .fill('Primeiro parágrafo.\n\nSegundo parágrafo, para confirmar a separação.');
    await page.getByLabel('Data de publicação').fill('2026-07-25');

    await page.getByRole('button', { name: 'Publicar notícia' }).click();
    await expect(page.getByRole('status')).toContainText('publicada');

    // O que interessa não é a mensagem: é a notícia estar mesmo no portal.
    await page.goto('/noticias/2026/07/noticia-de-verificacao-automatica');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(TITULO);
    await expect(page.getByText('Segundo parágrafo')).toBeVisible();
  });

  test('corrigir a notícia atualiza o portal', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'Escreve conteúdo — basta uma vez.');

    await entrar(page);
    await page.goto('/admin/noticias');
    await page.getByRole('link', { name: TITULO, exact: true }).click();

    await page.getByLabel('Título').fill(TITULO_CORRIGIDO);
    await page.getByRole('button', { name: 'Guardar alterações' }).click();
    await expect(page.getByRole('status')).toContainText('atualizada');

    // O endereço não muda ao corrigir o título — as ligações já partilhadas
    // têm de continuar a funcionar.
    await page.goto('/noticias/2026/07/noticia-de-verificacao-automatica');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(TITULO_CORRIGIDO);
  });

  test('apagar a notícia tira-a do portal', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'Escreve conteúdo — basta uma vez.');

    await entrar(page);
    await page.goto('/admin/noticias');

    const linha = page.locator('li').filter({ hasText: TITULO_CORRIGIDO });
    await linha.getByRole('button', { name: 'Apagar' }).click();
    await linha.getByRole('button', { name: 'Sim, apagar' }).click();

    await expect(page.getByRole('link', { name: TITULO_CORRIGIDO })).toBeHidden();

    const resposta = await page.goto('/noticias/2026/07/noticia-de-verificacao-automatica');
    expect(resposta?.status()).toBe(404);
  });
});

test.describe('acessibilidade do painel', () => {
  const ECRAS = [
    { nome: 'entrada', caminho: '/admin/entrar', comSessao: false },
    { nome: 'início', caminho: '/admin', comSessao: true },
    { nome: 'notícias', caminho: '/admin/noticias', comSessao: true },
    { nome: 'escrever notícia', caminho: '/admin/noticias/nova', comSessao: true },
    { nome: 'avisos', caminho: '/admin/avisos', comSessao: true },
    { nome: 'agenda', caminho: '/admin/eventos', comSessao: true },
    { nome: 'fotografias', caminho: '/admin/imagens', comSessao: true },
    { nome: 'ajuda', caminho: '/admin/ajuda', comSessao: true },
  ];

  for (const ecra of ECRAS) {
    test(`${ecra.nome} sem falhas de acessibilidade`, async ({ page }) => {
      if (ecra.comSessao) await entrar(page);
      await page.goto(ecra.caminho);

      const resultado = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();

      expect(
        resultado.violations.map((v) => `${v.id} (${v.nodes.length}×): ${v.help}`),
        `Falhas em ${ecra.caminho}`,
      ).toEqual([]);
    });
  }
});
