import { test, expect, type APIRequestContext, type Page } from '@playwright/test';

/**
 * Todos os descarregamentos que o portal oferece.
 *
 * A auditoria encontrou 24 ligações de ficheiro em 404 e nenhum teste que as
 * apanhasse — porque nenhum teste olhava para as ligações como um conjunto.
 * Verificava-se a lista de documentos, que tinha a verificação feita, e não
 * as outras sete páginas que também oferecem ficheiros e não tinham.
 *
 * A regra que este teste impõe é uma só, e não depende de haver ou não
 * ficheiros de demonstração instalados:
 *
 *     **se o portal oferece o botão, o botão tem de funcionar.**
 *
 * Numa instalação sem os PDF de exemplo, `ficheiroExiste()` esconde-os e não
 * há nada para verificar — e é isso que o terceiro teste confirma, para que
 * «esconder tudo» não seja uma forma de passar. Os dados abertos, esses, são
 * gerados e têm de estar sempre lá.
 */

/** Páginas a percorrer: as que o próprio portal declara no sitemap. */
async function paginasDoPortal(pedido: APIRequestContext): Promise<string[]> {
  const resposta = await pedido.get('/sitemap.xml');
  expect(resposta.status(), 'o sitemap tem de responder').toBe(200);

  const xml = await resposta.text();
  const caminhos = new Set<string>();
  for (const achado of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    caminhos.add(new URL(achado[1]).pathname || '/');
  }

  // Só a versão portuguesa: as traduções desenham os mesmos componentes com
  // os mesmos ficheiros, e percorrer quatro idiomas quadruplicava o tempo
  // sem acrescentar uma única ligação diferente.
  return [...caminhos].filter((c) => !/^\/(en|es|fr)(\/|$)/.test(c)).sort();
}

const ENDERECO_DE_FICHEIRO = /^\/(documentos|dados|ficheiros)\//;

/** As ligações para ficheiros numa página, com o sítio onde apareceram. */
async function ficheirosOferecidos(pagina: Page, caminho: string) {
  const hrefs = await pagina.$$eval('a[href]', (ancoras) =>
    ancoras.map((a) => a.getAttribute('href') ?? ''),
  );

  return hrefs
    .filter((href) => ENDERECO_DE_FICHEIRO.test(href))
    .map((href) => ({ href, pagina: caminho }));
}

test.describe('descarregamentos', () => {
  test('todas as ligações de ficheiro que o portal mostra respondem', async ({
    page,
    request,
  }, info) => {
    test.skip(info.project.name !== 'desktop', 'O conjunto de ligações não depende do ecrã.');

    // Percorre umas noventa páginas. O limite normal de 30 s chega quando
    // corre sozinho e não chega quando corre ao lado do resto da bateria.
    test.setTimeout(180_000);

    const paginas = await paginasDoPortal(request);
    expect(paginas.length, 'o sitemap tem de trazer páginas').toBeGreaterThan(20);

    const oferecidos: { href: string; pagina: string }[] = [];
    const naoAbriram: string[] = [];

    for (const caminho of paginas) {
      const resposta = await page.goto(caminho, { waitUntil: 'domcontentloaded' });

      // Uma página que não abre não faz falhar este teste, e não é
      // indulgência: os outros testes da bateria publicam e apagam notícias,
      // documentos e serviços enquanto este corre, e uma ficha apagada a
      // meio do percurso dá 404 sem que nada esteja mal. Quem verifica as
      // páginas é `navigation.spec.ts`. Aqui o que se verifica são os
      // ficheiros — e de uma página que não abriu não saem ligações.
      if (resposta?.status() !== 200) {
        naoAbriram.push(`${caminho} (HTTP ${resposta?.status() ?? '—'})`);
        continue;
      }

      oferecidos.push(...(await ficheirosOferecidos(page, caminho)));
    }

    // Mas se quase nada abriu, o teste não verificou nada e não pode passar
    // em silêncio — seria o caso se o interruptor de bloqueio ficasse ligado.
    expect(
      naoAbriram.length,
      `demasiadas páginas não abriram:\n${naoAbriram.join('\n')}`,
    ).toBeLessThan(paginas.length / 4);

    // Cada endereço uma vez só: o mesmo formulário aparece em várias fichas
    // de serviço, e não vale a pena pedi-lo doze vezes.
    const porEndereco = new Map<string, string[]>();
    for (const { href, pagina } of oferecidos) {
      porEndereco.set(href, [...(porEndereco.get(href) ?? []), pagina]);
    }

    expect(
      porEndereco.size,
      'o portal tem de oferecer ficheiros — se não oferece nenhum, há algo a esconder tudo',
    ).toBeGreaterThan(1);

    const falhas: string[] = [];
    for (const [href, paginasOnde] of porEndereco) {
      const resposta = await request.get(href);
      if (resposta.status() !== 200) {
        falhas.push(`HTTP ${resposta.status()}  ${href}  (em ${paginasOnde.join(', ')})`);
      }
    }

    expect(
      falhas,
      `O portal oferece ${porEndereco.size} ficheiros. Estes não existem:\n${falhas.join('\n')}`,
    ).toEqual([]);
  });

  test('os dados abertos são servidos e vêm com o que prometem', async ({ request }, info) => {
    test.skip(info.project.name !== 'desktop', 'Basta uma vez.');

    const csv = await request.get('/dados/orcamento-2026.csv');
    expect(csv.status()).toBe(200);
    expect(csv.headers()['content-type']).toContain('text/csv');
    expect(csv.headers()['content-disposition']).toContain('orcamento-2026.csv');

    const texto = await csv.text();
    // BOM: sem ele o Excel em Windows estraga os acentos.
    expect(texto.charCodeAt(0)).toBe(0xfeff);
    expect(texto).toContain('CC BY 4.0');
    expect(texto).toContain('"Água, saneamento e resíduos"');

    const json = await request.get('/dados/ocorrencias-2026.json');
    expect(json.status()).toBe(200);
    expect(json.headers()['content-type']).toContain('application/json');
    expect(json.headers()['content-disposition']).toContain('ocorrencias-2026.json');

    const dados = JSON.parse(await json.text());
    expect(dados.total).toBe(dados.ocorrencias.length);
    expect(dados.licenca).toContain('CC BY 4.0');

    // Um ano sem orçamento não se inventa.
    expect((await request.get('/dados/orcamento-2031.csv')).status()).toBe(404);
    // E a rota não serve nada além dos dois ficheiros que conhece.
    expect((await request.get('/dados/qualquer-coisa.csv')).status()).toBe(404);
  });

  test('a página de dados abertos oferece mesmo os dois ficheiros', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'Basta uma vez.');

    await page.goto('/transparencia/dados-abertos');

    // Sem esta verificação, esconder tudo passaria no primeiro teste. Já
    // aconteceu durante a própria correção: `ficheiroExiste()` ia procurar
    // estes dois a `public/`, onde nunca estarão, e escondia-os.
    await expect(page.locator('a[href="/dados/orcamento-2026.csv"]')).toBeVisible();
    await expect(page.locator('a[href="/dados/ocorrencias-2026.json"]')).toBeVisible();
  });

  test('um ficheiro em falta aparece como «por publicar», sem botão', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'Basta uma vez.');

    // As atas são PDF de demonstração, gerados por `npm run
    // documentos-exemplo`. O servidor de testes não o corre, por isso aqui
    // faltam mesmo — o que faz desta página o sítio certo para confirmar que
    // a página mostra a ata e não oferece um botão que dá 404.
    await page.goto('/municipio/reunioes');

    const atas = page.locator('a[href^="/documentos/ata-"]');
    const marcas = page.getByText('Ficheiro por publicar');

    const quantasAtas = await atas.count();
    const quantasMarcas = await marcas.count();

    // Uma das duas situações, e as duas são aceitáveis — o que não é
    // aceitável é oferecer a ata e dar 404, e isso o primeiro teste apanha.
    if (quantasAtas === 0) {
      expect(quantasMarcas, 'sem ficheiros, tem de dizer que estão por publicar').toBeGreaterThan(
        0,
      );
    } else {
      // Se existem, têm de funcionar.
      for (let i = 0; i < quantasAtas; i += 1) {
        const href = await atas.nth(i).getAttribute('href');
        expect((await page.request.get(href!)).status()).toBe(200);
      }
    }
  });
});
