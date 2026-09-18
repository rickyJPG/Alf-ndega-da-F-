import { test, expect, type Page } from '@playwright/test';

/**
 * Páginas institucionais.
 *
 * O que mais importa verificar aqui não é a gravação — é o que **não** se
 * perde ao gravar. Uma página tem partes que o painel edita (textos, listas,
 * destaques) e partes que não (galerias, vídeos, listas que se preenchem
 * sozinhas). Se corrigir um parágrafo apagasse a galeria por baixo, ninguém
 * daria por isso até alguém abrir a página no portal.
 */

const PALAVRA_PASSE = 'palavra-passe-de-teste';
// Uma página com galeria e vídeo — é onde o risco de perder alguma coisa é
// maior.
const CAMINHO = 'visitar';

async function entrar(page: Page) {
  await page.goto('/admin/entrar');
  await page.getByLabel('Palavra-passe').fill(PALAVRA_PASSE);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

test.describe.serial('páginas', () => {
  test('mostra o que se pode corrigir e o que fica como está', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'Basta uma vez.');

    await entrar(page);
    await page.goto(`/admin/paginas/${CAMINHO}`);

    // Os textos abrem para edição.
    await expect(page.getByLabel('Título', { exact: false }).first()).toBeVisible();

    // O que não se edita aparece na mesma, com a razão à vista — em vez de
    // desaparecer e deixar a dúvida de se ainda lá está.
    await expect(page.getByText(/não se altera por aqui/i).first()).toBeVisible();
  });

  test('corrigir um texto não leva à frente o resto da página', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'Escreve conteúdo — basta uma vez.');

    // O estado da página antes: quantas imagens e que vídeo.
    await page.goto(`/${CAMINHO}`);
    const imagensAntes = await page.locator('main img').count();
    const videoAntes = await page.locator('main [data-video], main iframe, main button').count();

    // Sem isto o teste passava mesmo que a página não tivesse nada a
    // perder — e não estaria a verificar coisa nenhuma.
    expect(imagensAntes, 'a página escolhida tem de ter fotografias').toBeGreaterThan(0);

    await entrar(page);
    await page.goto(`/admin/paginas/${CAMINHO}`);

    const textos = page.getByLabel('Texto', { exact: true });
    const original = await textos.first().inputValue();
    const frase = `Frase escrita por um teste às ${Date.now()}.`;

    try {
      await textos.first().fill(frase);
      await page.getByRole('button', { name: 'Guardar alterações' }).click();
      await expect(page.getByRole('status')).toContainText('atualizada');

      // No portal: a frase nova está lá…
      await page.goto(`/${CAMINHO}`);
      await expect(page.getByText(frase)).toBeVisible();

      // …e as fotografias e o vídeo continuam todos no sítio.
      expect(await page.locator('main img').count()).toBe(imagensAntes);
      expect(await page.locator('main [data-video], main iframe, main button').count()).toBe(
        videoAntes,
      );
    } finally {
      // Repor o texto original. Ao contrário de uma notícia, uma página não
      // se apaga no fim do teste — fica no portal. Sem isto, cada passagem
      // deixava uma frase de teste na demonstração, para sempre.
      await page.goto(`/admin/paginas/${CAMINHO}`);
      await page.getByLabel('Texto', { exact: true }).first().fill(original);
      await page.getByRole('button', { name: 'Guardar alterações' }).click();
      await expect(page.getByRole('status')).toContainText('atualizada');
    }
  });
});
