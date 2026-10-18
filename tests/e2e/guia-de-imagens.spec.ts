import { test, expect, type Page } from '@playwright/test';

/**
 * A ligação do painel para o guia de imagens.
 *
 * O ecrã Fotografias mostra uma parede de quadrados com nomes como
 * `visitar/patrimonio`, e quem o abre pela primeira vez não tem como saber
 * qual deles é a fotografia que vê na página inicial. O inventário existia —
 * é a página `/guia-de-imagens`, com a pré-visualização de cada posição,
 * onde aparece e em que proporção — mas não havia nada no painel a dizer
 * que existia.
 *
 * O que estes testes fixam é a ligação inteira, não só o `href`: que abre em
 * separador novo (quem troca fotografias quer os dois ecrãs ao mesmo tempo)
 * e que o destino responde. Um `target="_blank"` para uma página que dá 404
 * é pior do que não ter ligação nenhuma — abre um separador para mostrar um
 * erro.
 */

const PALAVRA_PASSE = 'palavra-passe-de-teste';

async function entrar(pagina: Page) {
  await pagina.goto('/admin/entrar');

  const campo = pagina.getByLabel(/Palavra-passe/);
  if ((await campo.count()) === 0) return; // já tinha sessão

  await campo.fill(PALAVRA_PASSE);
  await pagina.getByRole('button', { name: 'Entrar' }).click();
  await pagina.waitForURL((url) => new URL(url).pathname === '/admin', { timeout: 15_000 });
}

test.describe('guia de imagens, a partir do painel', () => {
  test('o ecrã Fotografias aponta para o guia, em separador novo', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'A ligação não depende do ecrã.');

    await entrar(page);
    await page.goto('/admin/imagens');

    const ligacao = page.locator('a[href="/guia-de-imagens"]');
    await expect(ligacao).toHaveCount(1);
    await expect(ligacao).toBeVisible();

    // Em separador novo: trocar fotografias é comparar os dois ecrãs.
    await expect(ligacao).toHaveAttribute('target', '_blank');

    // E fica em cima, antes da parede de quadrados — é aí que a dúvida
    // aparece, não depois de se ter carregado a fotografia errada.
    const posicaoDaLigacao = await ligacao.evaluate(
      (elemento) => elemento.compareDocumentPosition(document.querySelector('h2')!),
    );
    // DOCUMENT_POSITION_FOLLOWING = 4: o primeiro <h2> vem depois da ligação.
    expect(posicaoDaLigacao & 4, 'a ligação tem de vir antes dos grupos').toBeTruthy();
  });

  test('a página de ajuda aponta para o guia, em separador novo', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'A ligação não depende do ecrã.');

    await entrar(page);
    await page.goto('/admin/ajuda');

    const ligacao = page.locator('a[href="/guia-de-imagens"]');
    await expect(ligacao).toHaveCount(1);
    await expect(ligacao).toBeVisible();
    await expect(ligacao).toHaveAttribute('target', '_blank');

    // Na receita das fotografias, não perdida no fim da página.
    const receita = page.locator('section', { has: page.getByText('Trocar uma fotografia') });
    await expect(receita.locator('a[href="/guia-de-imagens"]')).toHaveCount(1);
  });

  test('o guia responde, e diz que se trocam as fotografias pelo painel', async ({
    page,
  }, info) => {
    test.skip(info.project.name !== 'desktop', 'Basta uma vez.');

    const resposta = await page.goto('/guia-de-imagens');
    expect(resposta?.status(), 'uma ligação que abre um 404 é pior que nenhuma').toBe(200);

    // O inventário, que é a razão de se ligar para aqui.
    await expect(page.getByRole('heading', { name: 'Guia de imagens', level: 1 })).toBeVisible();
    await expect(page.getByText(/em que página|onde entram/).first()).toBeVisible();

    // E a indicação certa em primeiro lugar: a página explicava só o caminho
    // antigo — copiar ficheiros para `public/images` e recompilar — que é o
    // contrário do que o painel faz. Mandar a redação para cá a ler isso
    // seria mandá-la fazer o trabalho à mão.
    await expect(page.getByText(/Pelo painel, sem tocar em ficheiros/)).toBeVisible();
  });

  test('clicar na ligação abre mesmo o guia noutro separador', async ({ page, context }, info) => {
    test.skip(info.project.name !== 'desktop', 'Basta uma vez.');

    await entrar(page);
    await page.goto('/admin/imagens');

    const [novo] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('a[href="/guia-de-imagens"]').click(),
    ]);

    await novo.waitForLoadState('domcontentloaded');
    expect(new URL(novo.url()).pathname).toBe('/guia-de-imagens');

    // O separador do painel ficou onde estava.
    expect(new URL(page.url()).pathname).toBe('/admin/imagens');

    await novo.close();
  });
});
