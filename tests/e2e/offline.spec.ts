import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { test, expect } from '@playwright/test';

/**
 * A página que se vê quando não há rede.
 *
 * Existia, era compilada, e devolvia 404: o middleware de idioma apanhava
 * `/offline` como apanha qualquer caminho sem idioma e reescrevia-o para
 * `/pt/offline` — uma rota que não existe, porque esta página vive de
 * propósito fora de `/[locale]`.
 *
 * O estrago não era um 404 a mais. `cache.addAll()` é tudo-ou-nada: bastava
 * um dos endereços da lista falhar para **nada** ficar guardado — nem a
 * página, nem as três fontes. O service worker instalava-se na mesma, sem se
 * queixar, e no dia em que a rede falhasse o munícipe via o ecrã de erro do
 * navegador em vez dos números de emergência.
 *
 * Um erro que só aparece sem rede não se vê a navegar. Por isso a lista é
 * lida do próprio `sw.js`: se alguém lhe acrescentar uma entrada, este teste
 * passa a verificá-la sem ninguém se lembrar disso.
 */

function listaDePrecache(): string[] {
  const sw = readFileSync(join(process.cwd(), 'public', 'sw.js'), 'utf8');
  const bloco = sw.match(/const PRECACHE = \[([\s\S]*?)\]/);
  if (!bloco) throw new Error('Não encontrei a lista PRECACHE em public/sw.js.');

  const entradas = [...bloco[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
  // `OFFLINE_URL` entra pela constante, não como texto entre plicas.
  if (bloco[1].includes('OFFLINE_URL')) entradas.push('/offline');

  return entradas;
}

test.describe('página sem ligação', () => {
  test('serve-se com 200 — não é reescrita para /pt/offline', async ({ request }) => {
    const resposta = await request.get('/offline');

    expect(resposta.status(), 'um 404 aqui faz falhar o precache todo').toBe(200);
    expect(await resposta.text()).toContain('Sem ligação');
  });

  test('todos os endereços do precache respondem — addAll é tudo-ou-nada', async ({ request }) => {
    const enderecos = listaDePrecache();
    expect(enderecos.length, 'a lista foi lida do sw.js').toBeGreaterThan(1);

    for (const endereco of enderecos) {
      const resposta = await request.get(endereco);
      expect(resposta.status(), `${endereco} tem de responder para o precache passar`).toBe(200);
    }
  });

  test('mostra os números de emergência e o contacto da câmara', async ({ page }) => {
    await page.goto('/offline');

    // Os números de emergência são a razão de ser desta página: sem rede, é o
    // que tem de estar à vista, e por isso são eles o H1.
    await expect(
      page.getByRole('heading', { level: 1, name: 'Números de emergência' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: '112' }).first()).toBeVisible();

    // Marcáveis a partir do telemóvel, que é onde isto acontece.
    await expect(page.locator('a[href="tel:112"]').first()).toBeAttached();

    await expect(page.locator('address')).toContainText('Alfândega da Fé');
  });

  test('fica fora dos motores de busca', async ({ page }) => {
    await page.goto('/offline');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      /noindex/,
    );
  });
});
