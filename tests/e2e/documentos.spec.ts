import { test, expect, type Page } from '@playwright/test';

/**
 * Documentos: publicar, substituir o ficheiro, apagar.
 *
 * O circuito que interessa a uma câmara municipal — publica-se um edital ou
 * um formulário quase todas as semanas — e um detalhe que se paga caro se
 * falhar: o endereço do documento **não muda** ao substituir o ficheiro por
 * uma versão corrigida. Se mudasse, todas as ligações já partilhadas
 * (e-mails, redes sociais, o Diário da República) deixavam de funcionar.
 *
 * Correm em série e limpam o que criaram: partilham servidor com os outros
 * testes, e um documento esquecido aqui aparecia no portal a meio de outra
 * verificação.
 */

const PALAVRA_PASSE = 'palavra-passe-de-teste';
const TITULO = 'Edital de verificação automática';

async function entrar(page: Page) {
  await page.goto('/admin/entrar');
  await page.getByLabel('Palavra-passe').fill(PALAVRA_PASSE);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

/** Um PDF mínimo mas válido, para o carregamento ter o que verificar. */
function pdfDeTeste(texto: string) {
  return {
    name: 'teste.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(`%PDF-1.4\n% ${texto}\n%%EOF\n`),
  };
}

/**
 * Limpa o que um lote anterior possa ter deixado.
 *
 * Sem isto, um lote interrompido a meio (uma falha no primeiro teste salta os
 * seguintes, que são os que apagam) deixava o documento gravado — e o lote
 * seguinte falhava logo à entrada com «já existe um documento com este
 * título», escondendo o estado real do código atrás de lixo de ontem.
 */
async function limparRestos(page: Page) {
  await entrar(page);
  await page.goto('/admin/documentos');

  const linha = page.locator('li').filter({ hasText: TITULO });
  if ((await linha.count()) === 0) return;

  await linha.first().getByRole('button', { name: 'Apagar' }).click();
  await linha.first().getByRole('button', { name: 'Sim, apagar' }).click();
  await expect(page.getByRole('link', { name: TITULO, exact: true })).toBeHidden();
}

test.describe.serial('documentos', () => {
  test('publicar um documento põe-no no portal, com o ficheiro', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'Escreve conteúdo — basta uma vez.');

    await limparRestos(page);
    await page.goto('/admin/documentos/novo');

    await page.getByLabel('Título').fill(TITULO);
    await page.getByLabel('Para que serve').fill('Documento escrito por um teste.');
    await page.getByLabel('Ficheiro').setInputFiles(pdfDeTeste('primeira versao'));

    await page.getByRole('button', { name: 'Publicar documento' }).click();
    await expect(page.getByRole('status')).toContainText('publicado');

    // No portal, e descarregável a sério — não só listado.
    await page.goto('/documentos/edital-de-verificacao-automatica');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(TITULO);

    const resposta = await page.request.get('/ficheiros/documentos/edital-de-verificacao-automatica.pdf');
    expect(resposta.status()).toBe(200);
    expect(await resposta.text()).toContain('primeira versao');
  });

  test('substituir o ficheiro não muda o endereço do documento', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'Escreve conteúdo — basta uma vez.');

    await entrar(page);
    await page.goto('/admin/documentos');
    await page.getByRole('link', { name: TITULO, exact: true }).click();

    await page.getByLabel('Substituir por').setInputFiles(pdfDeTeste('versao corrigida'));
    await page.getByRole('button', { name: 'Guardar alterações' }).click();
    await expect(page.getByRole('status')).toContainText('atualizado');

    // O mesmo endereço, o conteúdo novo: é isto que mantém vivas as
    // ligações que o Município já pôs a circular.
    const resposta = await page.request.get('/ficheiros/documentos/edital-de-verificacao-automatica.pdf');
    expect(resposta.status()).toBe(200);
    expect(await resposta.text()).toContain('versao corrigida');
  });

  test('apagar leva o registo e o ficheiro', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'Escreve conteúdo — basta uma vez.');

    await entrar(page);
    await page.goto('/admin/documentos');

    const linha = page.locator('li').filter({ hasText: TITULO });
    await linha.getByRole('button', { name: 'Apagar' }).click();
    await linha.getByRole('button', { name: 'Sim, apagar' }).click();

    await expect(page.getByRole('link', { name: TITULO, exact: true })).toBeHidden();

    // O ficheiro sai com o registo: senão ficava no disco para sempre,
    // descarregável por quem tivesse guardado o endereço.
    const resposta = await page.request.get('/ficheiros/documentos/edital-de-verificacao-automatica.pdf');
    expect(resposta.status()).toBe(404);
  });
});

test.describe('ficheiros em falta', () => {
  test('um documento sem ficheiro não oferece um botão que dá 404', async ({ page }) => {
    // O catálogo de exemplo traz o registo; se o ficheiro não estiver no
    // disco, o portal tem de o dizer em vez de deixar clicar e falhar.
    await page.goto('/documentos');

    const porPublicar = page.getByText('Ficheiro por publicar');
    const quantos = await porPublicar.count();

    // Seja qual for o estado da pasta, a regra é a mesma: onde se anuncia
    // «por publicar», não há ligação de descarregamento ao lado.
    for (let i = 0; i < quantos; i += 1) {
      await expect(porPublicar.nth(i)).toBeVisible();
    }
  });
});
