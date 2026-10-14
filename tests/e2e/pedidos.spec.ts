import { test, expect, type Page } from '@playwright/test';

/**
 * O percurso completo de um pedido de munícipe.
 *
 * Formulário → número de referência → visível no painel → estado mudado →
 * o munícipe vê o novo estado com o mesmo número.
 *
 * É o teste que faltava, e é o único que apanharia o que a auditoria
 * encontrou: cada metade funcionava à sua maneira — o formulário validava, o
 * painel listava — e no meio não havia ligação nenhuma. O número dado ao
 * munícipe não existia em sítio nenhum, e a página de consulta respondia
 * «Verifique se o copiou corretamente», culpando-o por um engano que não
 * tinha cometido.
 *
 * Usa a consulta pública por ser o formulário sem mapa nem escolha de hora.
 * O percurso que se verifica é o mesmo para as três: a gravação, a
 * referência e o estado são código partilhado.
 */

const PALAVRA_PASSE = 'palavra-passe-de-teste';
const CONSULTA = '/transparencia/consultas-publicas/regulamento-de-apoios-as-freguesias';
const MARCA_DE_TESTE = 'Teste automático';
const CONTRIBUTO = `${MARCA_DE_TESTE}: sugiro que o regulamento preveja um prazo de resposta às juntas de freguesia.`;

/**
 * Garante sessão aberta no painel.
 *
 * Verifica primeiro se já está dentro, e só preenche a palavra-passe se o
 * ecrã de entrada aparecer. Ir a `/admin/entrar` com sessão válida
 * reencaminha logo para `/admin`, e nesse caso o campo da palavra-passe
 * nunca aparece — esperar por ele é esperar para sempre.
 */
async function garantirSessao(pagina: Page) {
  await pagina.goto('/admin/entrar');

  const campo = pagina.getByLabel(/Palavra-passe/);
  if ((await campo.count()) === 0) return; // já estava dentro

  await campo.fill(PALAVRA_PASSE);
  await pagina.getByRole('button', { name: 'Entrar' }).click();
  await pagina.waitForURL((url) => new URL(url).pathname === '/admin', { timeout: 15_000 });
}

/**
 * Consulta uma referência na página pública e devolve o painel do resultado.
 *
 * Restrito ao painel do separador: o cabeçalho do portal tem a pesquisa do
 * sítio, com um botão que também se chama «Pesquisar».
 */
async function consultarNoPortal(pagina: Page, referencia: string) {
  await pagina.goto('/viver-e-participar/ocorrencias');
  await pagina.getByRole('tab', { name: /Consultar/ }).click();

  const painel = pagina.getByLabel('Consultar ocorrência');
  await painel.getByLabel('Número de referência').fill(referencia);
  await painel.getByRole('button', { name: /Pesquisar|A procurar/ }).click();
  return painel;
}

/**
 * Apaga os pedidos que ficaram de passagens anteriores.
 *
 * Corre no início e no fim. No início porque uma passagem interrompida a
 * meio deixa registos atrás, e a seguinte encontrava-os na lista.
 */
async function limparRestos(pagina: Page) {
  await garantirSessao(pagina);
  await pagina.goto('/admin/pedidos?tipo=consulta');

  const restos = await pagina
    .locator('a[href^="/admin/pedidos/CP-"]')
    .evaluateAll((ligacoes) => ligacoes.map((l) => l.getAttribute('href') ?? ''));

  for (const href of restos) {
    await pagina.goto(href);
    if (!(await pagina.getByText(MARCA_DE_TESTE).count())) continue;

    const apagar = pagina.getByRole('button', { name: 'Apagar', exact: true });
    if ((await apagar.count()) === 0) continue;
    await apagar.click();
    await pagina.getByRole('button', { name: 'Sim, apagar' }).click();
    await pagina
      .waitForURL((url) => new URL(url).pathname === '/admin/pedidos', { timeout: 15_000 })
      .catch(() => {});
  }
}

test.describe.serial('pedidos de munícipes', () => {
  test('do formulário ao painel, e de volta ao munícipe', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'Escreve conteúdo — basta uma vez.');
    test.setTimeout(90_000);

    await limparRestos(page);

    let referencia = '';

    try {
      /* -------------------------------------------- 1. o munícipe submete -- */

      await page.goto(CONSULTA);

      // O aviso de proteção de dados tem de estar à vista antes do clique,
      // não escondido numa página de política.
      await expect(page.getByText(/ficam guardados no servidor do Município/)).toBeVisible();

      // Restrito ao formulário: o rodapé do portal tem a subscrição do
      // boletim, que também pede «Correio eletrónico».
      const formulario = page
        .locator('form')
        .filter({ has: page.getByLabel('O seu contributo') });

      await formulario.getByLabel('Nome completo').fill('Munícipe de Teste');
      await formulario.getByLabel('Correio eletrónico').fill('teste@exemplo.pt');
      await formulario.getByLabel('O seu contributo').fill(CONTRIBUTO);
      await formulario.getByRole('checkbox').check();
      await formulario.getByRole('button', { name: /Enviar|Participar|Submeter/ }).click();

      // A referência que o munícipe é mandado guardar.
      const comprovativo = page.getByText(/Referência:/);
      await expect(comprovativo).toBeVisible({ timeout: 15_000 });

      const texto = (await comprovativo.textContent()) ?? '';
      const achado = texto.match(/CP-\d{4}-\d{4}/);
      expect(achado, `a referência tem de vir no formato CP-ANO-NÚMERO: «${texto}»`).not.toBeNull();
      referencia = achado![0];

      /* ----------------------- 2. o munícipe consulta e já há o que ver -- */

      const painel = await consultarNoPortal(page, referencia);

      // Antes desta correção, aqui aparecia «Não encontrámos nenhuma
      // ocorrência com essa referência».
      await expect(painel.getByText(referencia)).toBeVisible({ timeout: 15_000 });
      await expect(painel.getByText('Recebida')).toBeVisible();

      // E não traz os dados de contacto de ninguém, nem os do próprio.
      const conteudo = (await page.content()).toLowerCase();
      expect(conteudo, 'o nome não pode chegar ao navegador').not.toContain('munícipe de teste');
      expect(conteudo, 'o correio não pode chegar ao navegador').not.toContain('teste@exemplo.pt');

      /* ------------------------------ 3. o serviço vê-o no painel e trata -- */

      await garantirSessao(page);

      // A contagem de abertos aparece na entrada do painel.
      await expect(page.getByText(/à espera de resposta/).first()).toBeVisible();

      await page.goto('/admin/pedidos');
      await expect(page.getByText(referencia)).toBeVisible();

      // O filtro por tipo encontra-o.
      await page.goto('/admin/pedidos?tipo=consulta');
      await expect(page.getByText(referencia)).toBeVisible();
      // E o filtro por outro tipo não.
      await page.goto('/admin/pedidos?tipo=marcacao');
      await expect(page.getByText(referencia)).toHaveCount(0);

      await page.goto(`/admin/pedidos/${referencia}`);
      // Aqui — e só aqui — os dados de contacto aparecem, porque é com eles
      // que se responde.
      await expect(page.getByText('teste@exemplo.pt')).toBeVisible();
      await expect(page.getByText(CONTRIBUTO)).toBeVisible();

      await page.getByLabel('Estado').selectOption('resolvido');
      await page
        .getByLabel('Resposta ao munícipe')
        .fill('O prazo de resposta foi acrescentado ao artigo 7.º.');
      await page.getByRole('button', { name: 'Guardar estado' }).click();
      await expect(page.getByRole('status')).toContainText('resolvido');

      /* ---------------------- 4. o munícipe vê o estado novo, mesmo número -- */

      const depois = await consultarNoPortal(page, referencia);

      await expect(depois.getByText('Resolvida')).toBeVisible({ timeout: 15_000 });
      await expect(depois.getByText('O prazo de resposta foi acrescentado')).toBeVisible();
    } finally {
      await limparRestos(page).catch(() => {});
    }
  });

  test('uma referência que não existe diz isso, sem culpar quem escreveu', async ({
    page,
  }, info) => {
    test.skip(info.project.name !== 'desktop', 'Basta uma vez.');

    // Formato certo, pedido inexistente: a resposta é «não encontrámos».
    const painel = await consultarNoPortal(page, 'OC-2026-9998');
    await expect(painel.getByText(/Não encontrámos nenhum pedido/)).toBeVisible({
      timeout: 15_000,
    });

    // Formato errado: a resposta diz qual é o formato, em vez de mandar
    // procurar o papel outra vez.
    await painel.getByLabel('Número de referência').fill('12345');
    await painel.getByRole('button', { name: /Pesquisar/ }).click();
    await expect(painel.getByText(/O formato é OC-2026-0001/)).toBeVisible();
  });

  test('o painel não deixa mudar o estado sem sessão', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'Basta uma vez.');

    // Sem entrar: os dois ecrãs mandam para a entrada em vez de mostrarem
    // dados pessoais de quem quer que seja.
    for (const caminho of ['/admin/pedidos', '/admin/pedidos/OC-2026-0001']) {
      await page.goto(caminho);
      await expect(page).toHaveURL(/\/admin\/entrar/);
    }
  });
});
