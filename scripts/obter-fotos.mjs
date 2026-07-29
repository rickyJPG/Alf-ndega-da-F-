#!/usr/bin/env node
/**
 * Descarrega as fotografias reais para os sítios certos.
 *
 *   npm run fotos
 *
 * A lista de endereços foi fornecida pelo Município (documento
 * «Links_Imagens_CM_Alfandega_da_Fe»). Cada entrada em DESTINOS aponta um
 * endereço para a posição de imagem que substitui — depois de descarregada,
 * o portal usa-a automaticamente (ver src/lib/imagens.ts), sem tocar em
 * código. As restantes fotografias do documento ficam em
 * public/images/recolha/, à disposição da redação.
 *
 * ATENÇÃO: correr num computador com acesso à internet (o ambiente de
 * construção pode não ter). Antes da publicação, confirmar junto do
 * Município os direitos de utilização de cada fotografia — sobretudo das
 * que vêm de sítios de terceiros (blogues, reservas de hotéis, Wikimedia).
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'images');

/** Posições do portal ← fotografia escolhida do documento. */
const DESTINOS = [
  {
    ficheiro: 'hero-alfandega.jpg',
    url: 'https://www.tempodeviajar.com/wp-content/uploads/alfandega-da-fe.jpg',
    nota: 'Vista da vila — destaque da página inicial (16:9).',
  },
  {
    ficheiro: 'visitar/patrimonio.jpg',
    url: 'https://www.cm-alfandegadafe.pt/cmalfandegadafe/uploads/poi/image/205/castelo_alfandega_4b747579d9fc5_1_1024_2500.jpg',
    nota: 'O castelo — fotografia do próprio sítio municipal.',
  },
  {
    ficheiro: 'visitar/lagos-do-sabor.jpg',
    url: 'https://ncultura.pt/wp-content/uploads/2022/12/Um-paraiso-chamado-Lagos-do-Sabor-00.jpg',
    nota: 'Lagos do Sabor.',
  },
  {
    ficheiro: 'visitar/cereja.jpg',
    url: 'https://www.cm-alfandegadafe.pt/cmalfandegadafe/uploads/poi/image/30/Cerejais_4b7473dcb61aa.jpg',
    nota: 'Os cerejais — fotografia do próprio sítio municipal.',
  },
  {
    ficheiro: 'visitar/percursos.jpg',
    url: 'https://www.dareyouspot.com/Routes/LoadImage/533',
    nota: 'Percursos pedestres.',
  },
  {
    ficheiro: 'visitar/amendoeiras.jpg',
    url: 'https://www.vagamundos.pt/wp-content/uploads/2020/11/1-147.jpg',
    nota: 'Paisagem do concelho — confirmar se mostra amendoeiras.',
  },
  {
    ficheiro: 'noticias/cereja.jpg',
    url: 'https://www.cm-alfandegadafe.pt/cmalfandegadafe/uploads/poi/image/30/Cerejais_4b7473dcb61aa.jpg',
    nota: 'Cerejais, para as notícias da campanha da cereja.',
  },
  {
    ficheiro: 'noticias/agua.jpg',
    url: 'https://assets.e-konomista.pt/uploads/2022/02/lagos-sabor1.jpg',
    nota: 'Água/lagos, para notícias de abastecimento.',
  },
  {
    ficheiro: 'noticias/orcamento.jpg',
    url: 'https://www.cm-alfandegadafe.pt/imgcrop/cmalfandegadafe/uploads/poi/image/29/castelo_alfandega_4b747579d9fc5_1_736_540.jpg',
    nota: 'Vista institucional da vila.',
  },
  {
    ficheiro: 'noticias/ambiente.jpg',
    url: 'https://www.acp.pt/ResourcesUser/ACP/img_lista/ACP-Estrada-Fora-Fins-de-Semana-Alfandega-da-Fe-lista.jpg',
    nota: 'Paisagem do concelho.',
  },
  {
    ficheiro: 'logotipo-branco.png',
    url: 'https://www.cm-alfandegadafe.pt/imgcrop/cmalfandegadafe/uploads/image_link/image/2/logo_alfandaga_de_fe_1_314_132.png',
    nota: 'Logótipo oficial em alta qualidade — substitui o extraído da captura.',
  },
];

/** Fotografias adicionais do documento, para a pasta recolha/. */
const RECOLHA = [
  ['sambade-aldeia.jpg', 'https://www.aldeiasdeportugal.pt/media/2020/12/Sambade-02-cut-1024x1011.jpg'],
  ['sambade-calcada.jpg', 'https://www.aldeiasdeportugal.pt/media/2020/12/Sambade-calcada.jpg'],
  ['sambade-vista.jpg', 'https://www.aldeiasdeportugal.pt/media/2020/12/sambade-7.jpg'],
  ['parada.jpg', 'https://www.cm-alfandegadafe.pt/thumbs/cmalfandegadafe/uploads/writer_file/image/852/Parada_1_250_250.jpg'],
  ['valverde.jpg', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Valverde_-_Portugal_%2833040060492%29.jpg/1280px-Valverde_-_Portugal_%2833040060492%29.jpg'],
  ['vila-vista.jpg', 'https://www.vagamundos.pt/wp-content/uploads/2020/11/1-147.jpg'],
  ['castelo-alto.jpg', 'https://www.cm-alfandegadafe.pt/thumbs/cmalfandegadafe/uploads/poi/image/205/castelo_alfandega_4b747579d9fc5_1_1024_2500_1_736_2500.jpg'],
  ['poi-dsc2541.jpg', 'https://www.cm-alfandegadafe.pt/cmalfandegadafe/uploads/poi/image/202/_dsc2541_copiar.jpg'],
  ['hotel-spa-1.jpg', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/379153661.jpg?k=cb3acad058ebd6333933f828cba876775dddbd55c6f1700f896c7e1dea53e49b&o='],
  ['hotel-spa-2.jpg', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/652626404.jpg?k=b09de7876c5a52e8a98fbd57834a232ec852e16f54388c5b20965e47072b013a&o='],
  ['hotel-spa-3.jpg', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/897520125.jpg?k=665a673a16b7bb58acc673669d2ea59345faedd90f449413315ef3706e852e37&o='],
  ['hotel-spa-4.jpg', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/897518810.jpg?k=67184ade7150f632bc92b1395bd3e236b9c5a6513356c8b2786652d7c5ec61df&o='],
  ['hotel-spa-5.jpg', 'https://cdn.quierohotel.com/hotel-spa-alfandega-da-fe-PF46413_99.jpg'],
  ['lagos-2.jpg', 'https://assets.e-konomista.pt/uploads/2022/02/lagos-sabor1.jpg'],
];

async function descarregar(url, destino) {
  const resposta = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(30_000),
    headers: { 'User-Agent': 'Mozilla/5.0 (portal-alfandega; recolha de imagens autorizada)' },
  });
  if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
  const tipo = resposta.headers.get('content-type') ?? '';
  if (!tipo.startsWith('image/')) throw new Error(`não é uma imagem (${tipo})`);
  const dados = Buffer.from(await resposta.arrayBuffer());
  if (dados.length < 5_000) throw new Error(`ficheiro suspeito de ${dados.length} bytes`);
  await mkdir(dirname(destino), { recursive: true });
  await writeFile(destino, dados);
  return dados.length;
}

let ok = 0;
let falhas = 0;

console.log('— Posições do portal —');
for (const { ficheiro, url, nota } of DESTINOS) {
  try {
    const bytes = await descarregar(url, join(OUT, ficheiro));
    ok += 1;
    console.log(`✓ ${ficheiro}  (${Math.round(bytes / 1024)} kB) — ${nota}`);
  } catch (erro) {
    falhas += 1;
    console.error(`✗ ${ficheiro} — ${erro.message}\n  ${url}`);
  }
}

console.log('\n— Recolha adicional (public/images/recolha) —');
for (const [nome, url] of RECOLHA) {
  try {
    const bytes = await descarregar(url, join(OUT, 'recolha', nome));
    ok += 1;
    console.log(`✓ recolha/${nome}  (${Math.round(bytes / 1024)} kB)`);
  } catch (erro) {
    falhas += 1;
    console.error(`✗ recolha/${nome} — ${erro.message}`);
  }
}

console.log(`\n${ok} descarregadas, ${falhas} falhadas.`);
if (ok > 0) {
  console.log('Reinicie o servidor (ou volte a compilar) para o portal as usar.');
}
if (falhas > 0) {
  console.log('As posições falhadas continuam a mostrar o substituto desfocado.');
  process.exitCode = 1;
}
