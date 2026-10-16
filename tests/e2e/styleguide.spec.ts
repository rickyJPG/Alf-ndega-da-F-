import { test, expect } from '@playwright/test';

/**
 * O guia de estilo não existe em produção.
 *
 * Esta bateria corre contra o build de produção (`next build && next start`),
 * por isso o que aqui se mede é exactamente o que um visitante encontraria.
 *
 * O que se corrige: a página respondia **200** a quem escrevesse o endereço.
 * O que a escondia era uma linha de `Disallow` no `robots.txt` — que é um
 * pedido aos motores de busca que se portam bem, não um controlo de acesso.
 * Não impedia ninguém de entrar, nem um rastreador que ignorasse o ficheiro.
 *
 * A linha continua no `robots.txt`, e o teste confirma as duas coisas: que a
 * página deixou de responder, e que o reforço não foi retirado.
 */

const IDIOMAS = ['', '/en', '/es', '/fr'];

test.describe('páginas só de desenvolvimento', () => {
  test('o guia de estilo devolve 404 em produção, em todos os idiomas', async ({
    request,
  }, info) => {
    test.skip(info.project.name !== 'desktop', 'O código de estado não depende do ecrã.');

    for (const prefixo of IDIOMAS) {
      const resposta = await request.get(`${prefixo}/styleguide`);
      expect(resposta.status(), `${prefixo || '/'}styleguide tem de ser 404`).toBe(404);
    }
  });

  test('mostra a página de erro do portal, não um erro do servidor', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'Basta uma vez.');

    const resposta = await page.goto('/styleguide');
    expect(resposta?.status()).toBe(404);

    // Um 404 do portal, com a pesquisa e a navegação — e não um ecrã branco
    // nem um 500 vindo de meio de um render interrompido.
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('o robots.txt continua a desaconselhá-la, como reforço', async ({ request }, info) => {
    test.skip(info.project.name !== 'desktop', 'Basta uma vez.');

    const robots = await request.get('/robots.txt');
    expect(robots.status()).toBe(200);

    const texto = await robots.text();
    // Deixou de ser a tranca, mas não há razão para a tirar: um rastreador
    // que leia o ficheiro poupa o pedido, e se alguém algum dia voltar a
    // abrir a página, a linha já cá está.
    expect(texto).toContain('Disallow: /styleguide');
  });

  test('não está no sitemap', async ({ request }, info) => {
    test.skip(info.project.name !== 'desktop', 'Basta uma vez.');

    const mapa = await request.get('/sitemap.xml');
    expect(mapa.status()).toBe(200);
    expect(await mapa.text()).not.toContain('styleguide');
  });

  test('o guia de imagens continua acessível — é para o Município', async ({ request }, info) => {
    test.skip(info.project.name !== 'desktop', 'Basta uma vez.');

    // Está na mesma linha de `Disallow`, mas não é a mesma coisa: mostra à
    // autarquia onde entra cada fotografia, sem precisar de abrir código.
    // Fechá-la tiraria ao Município uma ferramenta que é dele.
    const resposta = await request.get('/guia-de-imagens');
    expect(resposta.status()).toBe(200);
  });
});
