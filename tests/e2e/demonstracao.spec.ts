import { test, expect, type APIRequestContext } from '@playwright/test';

import { URL_DEMO, URL_EXPIRADO } from '../../playwright.config';

/**
 * Modo de demonstração, nos três estados em que o portal pode estar.
 *
 * A bateria corre contra três servidores do mesmo build, com variáveis de
 * ambiente diferentes (ver `webServer` em `playwright.config.ts`) — porque
 * uma variável de ambiente não muda a meio da vida de um processo, e sem
 * isto só se conseguiria testar metade.
 *
 *   - **normal** (o `baseURL` da bateria): sem `DEMO_MODE`;
 *   - **demonstração**: `DEMO_MODE=true`, com prazo por chegar;
 *   - **terminada**: o mesmo, com `MOCK_TODAY` no dia seguinte ao prazo.
 *
 * O que mais interessa aqui é a direção negativa: **numa instalação sem
 * `DEMO_MODE` não pode haver vestígio nenhum disto.** Um portal municipal
 * entregue com uma faixa «Versão de demonstração» é uma embaraço público, e
 * um que expire sozinho por causa de uma variável esquecida é pior.
 */

const PAGINAS = ['/', '/noticias', '/servicos', '/municipio/contactos'];

async function texto(pedido: APIRequestContext, url: string): Promise<string> {
  const resposta = await pedido.get(url);
  return resposta.text();
}

test.describe('sem DEMO_MODE — a instalação que se entrega', () => {
  test('não há faixa de demonstração em página nenhuma', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'O mesmo markup nos dois ecrãs.');

    for (const caminho of PAGINAS) {
      await page.goto(caminho);
      await expect(
        page.getByText('Versão de demonstração'),
        `${caminho} não pode ter a faixa`,
      ).toHaveCount(0);
    }
  });

  test('nem nos outros idiomas', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'Basta uma vez.');

    for (const [prefixo, frase] of [
      ['/en', 'Demonstration version'],
      ['/es', 'Versión de demostración'],
      ['/fr', 'Version de démonstration'],
    ]) {
      await page.goto(prefixo);
      await expect(page.getByText(frase), `${prefixo} não pode ter a faixa`).toHaveCount(0);
    }
  });

  test('as páginas continuam indexáveis', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'Basta uma vez.');

    await page.goto('/');
    // Sem meta robots a dizer noindex — o portal verdadeiro quer ser
    // encontrado por quem procura o Município.
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
  });

  test('o robots.txt convida a indexar e anuncia o mapa', async ({ request }, info) => {
    test.skip(info.project.name !== 'desktop', 'Basta uma vez.');

    const robots = await texto(request, '/robots.txt');
    expect(robots).toContain('Allow: /');
    expect(robots).toContain('Sitemap:');
    expect(robots, 'não pode barrar o portal inteiro').not.toMatch(/^Disallow: \/$/m);
  });

  test('o mapa do sítio vem cheio', async ({ request }, info) => {
    test.skip(info.project.name !== 'desktop', 'Basta uma vez.');

    const mapa = await texto(request, '/sitemap.xml');
    expect((mapa.match(/<loc>/g) ?? []).length).toBeGreaterThan(50);
  });

  test('os formulários não têm aviso de demonstração', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'Basta uma vez.');

    for (const caminho of [
      '/viver-e-participar/ocorrencias',
      '/servicos/marcacoes',
      '/transparencia/consultas-publicas/regulamento-de-apoios-as-freguesias',
    ]) {
      await page.goto(caminho);
      await expect(
        page.getByText('não envie dados pessoais reais'),
        caminho,
      ).toHaveCount(0);
    }
  });

  test('o painel abre normalmente', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'Basta uma vez.');

    await page.goto('/admin/entrar');
    await expect(page.getByLabel(/Palavra-passe/)).toBeVisible();
    await expect(page.getByText('Demonstração terminada')).toHaveCount(0);
  });
});

test.describe('com DEMO_MODE — a demonstração a decorrer', () => {
  test('a faixa aparece em todas as páginas, e é anunciada como nota', async ({
    page,
  }, info) => {
    test.skip(info.project.name !== 'desktop', 'Basta uma vez.');

    for (const caminho of PAGINAS) {
      await page.goto(`${URL_DEMO}${caminho}`);

      const faixa = page.getByRole('note', { name: 'Versão de demonstração' });
      await expect(faixa, caminho).toBeVisible();
      await expect(faixa).toContainText('Versão de demonstração');
    }
  });

  test('a faixa está traduzida nos quatro idiomas', async ({ page }) => {
    for (const [prefixo, frase] of [
      ['', 'Versão de demonstração'],
      ['/en', 'Demonstration version'],
      ['/es', 'Versión de demostración'],
      ['/fr', 'Version de démonstration'],
    ]) {
      await page.goto(`${URL_DEMO}${prefixo || '/'}`);
      // Quem escolhe inglês não pode ficar sem o aviso.
      await expect(page.getByRole('note', { name: frase }), prefixo || 'pt').toBeVisible();
    }
  });

  test('o portal continua a funcionar — a demonstração é para ser vista', async ({ page }) => {
    const resposta = await page.goto(`${URL_DEMO}/noticias`);
    expect(resposta?.status()).toBe(200);

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('nenhuma página se deixa indexar', async ({ page }) => {
    for (const caminho of PAGINAS) {
      await page.goto(`${URL_DEMO}${caminho}`);
      await expect(
        page.locator('meta[name="robots"]'),
        caminho,
      ).toHaveAttribute('content', /noindex/);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /nofollow/);
    }
  });

  test('o robots.txt barra tudo e não anuncia mapa', async ({ request }) => {
    const robots = await texto(request, `${URL_DEMO}/robots.txt`);

    expect(robots).toMatch(/^Disallow: \/$/m);
    expect(robots, 'não se anuncia um mapa de uma demonstração').not.toContain('Sitemap:');
  });

  test('o mapa do sítio vem vazio', async ({ request }) => {
    const mapa = await texto(request, `${URL_DEMO}/sitemap.xml`);
    expect(mapa).not.toContain('<loc>');
  });

  test('os três formulários pedem que não se escrevam dados reais', async ({ page }) => {
    for (const caminho of [
      '/viver-e-participar/ocorrencias',
      '/servicos/marcacoes',
      '/transparencia/consultas-publicas/regulamento-de-apoios-as-freguesias',
    ]) {
      await page.goto(`${URL_DEMO}${caminho}`);
      await expect(
        page.getByText('Versão de demonstração: não envie dados pessoais reais.'),
        caminho,
      ).toBeVisible();
    }
  });

  test('o painel abre — a demonstração ainda está dentro do prazo', async ({ page }) => {
    await page.goto(`${URL_DEMO}/admin/entrar`);
    await expect(page.getByLabel(/Palavra-passe/)).toBeVisible();
  });
});

test.describe('com o prazo já passado', () => {
  test('todas as páginas mostram o ecrã de fim, e mais nada', async ({ page }) => {
    for (const caminho of [...PAGINAS, '/eventos', '/transparencia', '/pagina-que-nao-existe']) {
      await page.goto(`${URL_EXPIRADO}${caminho}`);

      await expect(
        page.getByRole('heading', { name: 'Demonstração terminada', level: 1 }),
        caminho,
      ).toBeVisible();

      // Nada do portal sobrevive: nem navegação, nem rodapé, nem conteúdo.
      await expect(page.locator('footer'), caminho).toHaveCount(0);
      await expect(page.getByRole('navigation'), caminho).toHaveCount(0);
    }
  });

  test('diz quando terminou e como retomar a conversa', async ({ page }) => {
    await page.goto(`${URL_EXPIRADO}/`);

    await expect(page.getByText('demonstracao@exemplo.pt')).toBeVisible();
    // A data do prazo, escrita como o portal escreve datas.
    await expect(page.getByText(/15 dez 2026/)).toBeVisible();
    // E diz o que isto não era, que é o que evita mal-entendidos.
    await expect(page.getByText(/não era o sítio oficial/i)).toBeVisible();
  });

  test('o painel fecha também', async ({ page }) => {
    const resposta = await page.goto(`${URL_EXPIRADO}/admin`);
    expect(resposta?.status()).toBeLessThan(400);

    await expect(
      page.getByRole('heading', { name: 'Demonstração terminada', level: 1 }),
    ).toBeVisible();
    // Sem formulário de entrada: não há como entrar depois do prazo.
    await expect(page.getByLabel(/Palavra-passe/)).toHaveCount(0);
  });

  test('os ficheiros e os dados abertos também deixam de responder', async ({ request }) => {
    // Fechar a porta da frente e deixar a das traseiras aberta não fecha nada.
    for (const caminho of ['/dados/orcamento-2026.csv', '/dados/ocorrencias-2026.json']) {
      const resposta = await request.get(`${URL_EXPIRADO}${caminho}`);
      expect(resposta.status(), caminho).toBe(404);
    }
  });

  test('continua fora dos motores de busca', async ({ request }) => {
    const robots = await texto(request, `${URL_EXPIRADO}/robots.txt`);
    expect(robots).toMatch(/^Disallow: \/$/m);
  });
});
