import { test, expect } from '@playwright/test';

/**
 * Identidade visual: o logótipo e o brasão do Município.
 *
 * Existe por causa de um erro real. O logótipo do rodapé apareceu esticado ao
 * dobro da largura porque estava num contentor `flex-col`, onde o alinhamento
 * predefinido é `stretch` e uma largura `auto` deixa a imagem crescer à
 * largura da coluna. Nada disso dá erro de compilação, nenhum teste de
 * acessibilidade repara, e o resultado é o símbolo do Município deformado na
 * página — a única coisa de um portal institucional que nunca pode acontecer.
 *
 * Por isso a verificação é a única que apanha isto: comparar a proporção com
 * que a imagem é desenhada com a proporção do ficheiro.
 */

const TOLERANCIA = 0.02;

test.describe('logótipo do Município', () => {
  test('é desenhado sem deformação, em todas as páginas onde aparece', async ({ page }) => {
    for (const caminho of ['/', '/servicos', '/municipio/contactos']) {
      await page.goto(caminho);

      const logotipos = page.locator('img[src*="logotipo"]');
      const quantos = await logotipos.count();
      expect(quantos, `sem logótipo em ${caminho}`).toBeGreaterThan(0);

      for (let indice = 0; indice < quantos; indice += 1) {
        const medidas = await logotipos.nth(indice).evaluate((elemento) => {
          const img = elemento as HTMLImageElement;
          const caixa = img.getBoundingClientRect();
          return {
            desenhada: caixa.width / caixa.height,
            natural: img.naturalWidth / img.naturalHeight,
            src: img.currentSrc || img.src,
          };
        });

        expect(
          Math.abs(medidas.desenhada - medidas.natural),
          `${caminho}: ${medidas.src} desenhado a ${medidas.desenhada.toFixed(3)}, ` +
            `mas o ficheiro é ${medidas.natural.toFixed(3)}`,
        ).toBeLessThan(TOLERANCIA);
      }
    }
  });

  test('o brasão mantém a proporção do seu próprio desenho', async ({ page }) => {
    await page.goto('/');

    // O brasão é SVG e não é quadrado (o escudo é mais alto do que largo): a
    // proporção certa é a do `viewBox`, e é contra ela que se compara. Se
    // alguém o puser num contentor que o estique, aparece achatado sem que
    // nada se queixe.
    for (const zona of ['header', 'footer']) {
      const medidas = await page.locator(`${zona} svg[viewBox]`).first().evaluate((elemento) => {
        const svg = elemento as unknown as SVGSVGElement;
        const caixa = svg.getBoundingClientRect();
        const [, , largura, altura] = (svg.getAttribute('viewBox') ?? '0 0 1 1')
          .split(/[\s,]+/)
          .map(Number);
        return { desenhada: caixa.width / caixa.height, propria: largura / altura };
      });

      expect(
        Math.abs(medidas.desenhada - medidas.propria),
        `${zona}: desenhado a ${medidas.desenhada.toFixed(3)}, ` +
          `mas o desenho é ${medidas.propria.toFixed(3)}`,
      ).toBeLessThan(TOLERANCIA);
    }
  });
});
