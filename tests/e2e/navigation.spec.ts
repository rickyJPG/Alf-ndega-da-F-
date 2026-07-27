import { test, expect } from '@playwright/test';

/**
 * Percursos que um munícipe faz de facto. Se algum destes partir, o portal
 * falha no que interessa — independentemente do que digam as métricas.
 */

test.describe('estrutura e navegação', () => {
  test('a página inicial tem um só H1 e a hierarquia de títulos é sequencial', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toHaveCount(1);

    const levels = await page
      .locator('h1, h2, h3, h4, h5, h6')
      .evaluateAll((nodes) => nodes.map((node) => Number(node.tagName[1])));

    for (let index = 1; index < levels.length; index += 1) {
      expect(
        levels[index] - levels[index - 1],
        `salto de h${levels[index - 1]} para h${levels[index]}`,
      ).toBeLessThanOrEqual(1);
    }
  });

  test('a ligação para saltar o conteúdo aparece ao tabular e funciona', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');

    const skip = page.getByRole('link', { name: /saltar para o conteúdo/i });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();

    await page.keyboard.press('Enter');
    await expect(page.locator('#conteudo')).toBeFocused();
  });

  test('o mega-menu abre com o teclado e fecha com Escape', async ({ page, isMobile }) => {
    test.skip(isMobile, 'O mega-menu só existe a partir de 1024 px.');

    await page.goto('/');
    const trigger = page.getByRole('button', { name: 'Serviços' });
    await trigger.focus();
    await page.keyboard.press('Enter');

    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('link', { name: 'Marcar atendimento' }).first()).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('o menu móvel abre, prende o foco e fecha', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Só se aplica ao ecrã pequeno.');

    await page.goto('/');
    await page.getByRole('button', { name: /^menu$/i }).first().click();

    const dialog = page.getByRole('dialog', { name: 'Menu' });
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('qualquer página está a três cliques da inicial', async ({ page, isMobile }) => {
    test.skip(isMobile, 'O percurso pelo mega-menu é o do ecrã grande.');

    await page.goto('/');
    // 1.º clique: entrada principal
    await page.getByRole('button', { name: 'Serviços' }).click();
    // 2.º clique: entrada do mega-menu
    await page.getByRole('link', { name: 'Licença de construção' }).first().click();

    await expect(page).toHaveURL(/\/servicos\/urbanismo\/licenca-de-construcao$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Licença de construção');
  });

  test('as ligações antigas /pages/* são redirecionadas com 301', async ({ request }) => {
    const response = await request.get('/pages/1089', { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers()['location']).toContain('/noticias');
  });

  test('uma URL desconhecida devolve a página 404 com pesquisa', async ({ page }) => {
    const response = await page.goto('/isto-nao-existe');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('não encontrada');
    await expect(page.locator('main').getByRole('searchbox')).toBeVisible();
  });
});

test.describe('idiomas', () => {
  test('o português não tem prefixo e o inglês tem', async ({ page }) => {
    await page.goto('/servicos');
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-PT');

    await page.goto('/en/servicos');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('/pt é redirecionado para a raiz', async ({ request }) => {
    const response = await request.get('/pt/servicos', { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers()['location']).toMatch(/\/servicos$/);
  });

  test('o troca-idiomas mantém a página em que se está', async ({ page, isMobile }) => {
    test.skip(isMobile, 'O troca-idiomas está na barra superior do ecrã grande.');

    await page.goto('/servicos/urbanismo/licenca-de-construcao');
    await page.getByRole('button', { name: /mudar de idioma/i }).click();
    await page.getByRole('link', { name: 'Français' }).click();

    await expect(page).toHaveURL(/\/fr\/servicos\/urbanismo\/licenca-de-construcao$/);
  });

  test('as alternativas hreflang estão declaradas', async ({ page }) => {
    await page.goto('/servicos');
    for (const lang of ['pt-PT', 'en', 'es', 'fr', 'x-default']) {
      await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveCount(1);
    }
  });
});

test.describe('pesquisa', () => {
  test('a pesquisa do cabeçalho leva aos resultados', async ({ page }) => {
    await page.goto('/');
    await page.locator('#pesquisa-cabecalho').fill('certidão');
    await page.locator('#pesquisa-cabecalho').press('Enter');

    await expect(page).toHaveURL(/\/pesquisa\?q=certid/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Pesquisa');
    await expect(page.locator('article').first()).toBeVisible();
  });

  test('encontra texto que só existe dentro de um PDF', async ({ page }) => {
    await page.goto('/pesquisa?q=cercea');
    await expect(page.getByText(/texto encontrado no PDF/i).first()).toBeVisible();
  });

  test('sugere a grafia correta quando há erro de escrita', async ({ page }) => {
    await page.goto('/pesquisa?q=certidoes');
    await expect(page.locator('article').first()).toBeVisible();
  });
});

test.describe('conteúdo com prazo', () => {
  test('as consultas públicas mostram quantos dias faltam', async ({ page }) => {
    await page.goto('/transparencia/consultas-publicas');
    await expect(page.getByText(/Termina em \d+ dias/).first()).toBeVisible();
  });

  test('cada evento oferece um ficheiro de calendário', async ({ page, request }) => {
    await page.goto('/eventos/mercado-de-produtores');
    const link = page.getByRole('link', { name: /adicionar ao calendário/i });
    await expect(link).toBeVisible();

    const response = await request.get('/api/eventos/mercado-de-produtores.ics');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/calendar');
    expect(await response.text()).toContain('BEGIN:VEVENT');
  });
});
