import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Verificação automática de acessibilidade em todos os modelos de página.
 *
 * axe-core não substitui a verificação manual — apanha talvez metade dos
 * problemas reais —, mas apanha-os sempre, em todas as alterações. É a rede
 * mínima que uma entidade pública deve ter no CI.
 */

const TEMPLATES: { name: string; path: string }[] = [
  { name: 'página inicial', path: '/' },
  { name: 'catálogo de serviços', path: '/servicos' },
  { name: 'área de serviços', path: '/servicos/urbanismo' },
  { name: 'ficha de serviço', path: '/servicos/urbanismo/licenca-de-construcao' },
  { name: 'lista de notícias', path: '/noticias' },
  {
    name: 'notícia',
    path: '/noticias/2026/07/municipio-sai-da-situacao-de-excesso-de-endividamento',
  },
  { name: 'agenda', path: '/eventos' },
  { name: 'evento', path: '/eventos/exposicao-longe-de-perto' },
  { name: 'catálogo de documentos', path: '/documentos' },
  { name: 'documento', path: '/documentos/requerimento-de-certidao' },
  { name: 'transparência', path: '/transparencia' },
  { name: 'explorador do orçamento', path: '/transparencia/orcamento' },
  { name: 'consultas públicas', path: '/transparencia/consultas-publicas' },
  {
    name: 'consulta pública',
    path: '/transparencia/consultas-publicas/regulamento-de-apoios-as-freguesias',
  },
  { name: 'reuniões', path: '/municipio/reunioes' },
  { name: 'reunião', path: '/municipio/reunioes/reuniao-ordinaria-13-07-2026' },
  { name: 'contactos', path: '/municipio/contactos' },
  { name: 'freguesias', path: '/municipio/freguesias' },
  { name: 'freguesia', path: '/municipio/freguesias/sambade' },
  { name: 'marcação de atendimento', path: '/servicos/marcacoes' },
  { name: 'comunicar ocorrência', path: '/viver-e-participar/ocorrencias' },
  { name: 'orçamento participativo', path: '/viver-e-participar/orcamento-participativo' },
  { name: 'recolha de resíduos', path: '/servicos/agua-e-residuos/recolha' },
  { name: 'pesquisa', path: '/pesquisa?q=certidao' },
  { name: 'página editorial', path: '/visitar/lagos-do-sabor' },
  { name: 'declaração de acessibilidade', path: '/acessibilidade' },
  { name: 'guia de estilo', path: '/styleguide' },
  { name: 'página não encontrada', path: '/pagina-que-nao-existe' },
];

async function analyse(page: Page) {
  return new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
    // A biblioteca de mapas gera nós fora do nosso controlo.
    .exclude('.leaflet-container')
    .analyze();
}

for (const template of TEMPLATES) {
  test(`sem violações de acessibilidade: ${template.name}`, async ({ page }) => {
    await page.goto(template.path);
    await page.waitForLoadState('networkidle');

    const results = await analyse(page);

    // Mensagem legível quando falha, em vez de um despejo de JSON.
    const summary = results.violations.map(
      (violation) =>
        `${violation.id} (${violation.impact}): ${violation.help}\n  ${violation.nodes
          .slice(0, 3)
          .map((node) => node.target.join(' '))
          .join('\n  ')}`,
    );

    expect(summary, `${template.path}\n${summary.join('\n')}`).toEqual([]);
  });
}

test('o modo escuro mantém-se acessível', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const results = await analyse(page);
  expect(results.violations.map((violation) => violation.id)).toEqual([]);
});

test('o modo de contraste elevado mantém-se acessível', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    window.localStorage.setItem(
      'cmadf:prefs',
      JSON.stringify({ theme: 'light', highContrast: true, fontScale: 1.3 }),
    );
  });
  await page.reload();
  await page.waitForLoadState('networkidle');

  const results = await analyse(page);
  expect(results.violations.map((violation) => violation.id)).toEqual([]);
});
