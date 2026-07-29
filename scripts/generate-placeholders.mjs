#!/usr/bin/env node
/**
 * Gera as molduras de espera das fotografias.
 *
 *   npm run placeholders
 *
 * O portal foi desenhado para fotografias reais do concelho. Enquanto elas
 * não estão cá, cada posição mostra uma MOLDURA DE ESPERA: fundo claro com o
 * padrão de flor de cerejeira do Município, o símbolo de fotografia e, por
 * baixo, o motivo que ali deve entrar e o nome exato do ficheiro.
 *
 * Porquê assim e não uma paisagem inventada: uma ilustração desenhada lê-se
 * como banda desenhada, e uma paisagem desfocada lê-se como fotografia
 * estragada. A moldura não se confunde com nenhuma das duas — é claramente
 * intencional, fica bem numa apresentação e diz a quem a vê o que falta.
 *
 * Para pôr as fotografias reais:
 *   • `npm run fotos` — descarrega as escolhidas pelo Município; ou
 *   • abra `ferramentas/obter-fotos.html` no navegador e guarde cada uma; ou
 *   • guarde o ficheiro em public/images com o mesmo nome, mudando .svg
 *     para .jpg.
 * O portal passa a usá-las sozinho (ver src/lib/imagens.ts).
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'images');

const round = (n) => Math.round(n * 10) / 10;
const escapar = (texto) =>
  texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ------------------------------------------------------------------ cores -- */

/** As cores do sítio oficial, medidas na captura do cabeçalho. */
const CEREJA = '#A40C04';
const CEREJA_ESCURA = '#640404';
const FLOR = '#B43C34';
const FOLHA = '#A9B416';

/* -------------------------------------------------------------- primitivas -- */

/** Uma flor de cerejeira de cinco pétalas, como a do cabeçalho. */
function flor(tom, opacidade, escala = 1) {
  const petalas = [0, 72, 144, 216, 288]
    .map((graus) => {
      const rad = (graus * Math.PI) / 180;
      return `<circle cx="${round(Math.cos(rad) * 14.8 * escala)}" cy="${round(
        Math.sin(rad) * 14.8 * escala,
      )}" r="${round(11.5 * escala)}" fill="${tom}" opacity="${opacidade}"/>`;
    })
    .join('');
  return `${petalas}<circle r="${round(5 * escala)}" fill="${CEREJA_ESCURA}" opacity="${round(
    opacidade * 0.8 * 100,
  ) / 100}"/>`;
}

/** Símbolo de fotografia: a moldura da máquina e a objetiva. */
function simboloFotografia(x, y, escala) {
  const s = (v) => round(v * escala);
  return `<g transform="translate(${round(x)} ${round(y)})" fill="none" stroke="${CEREJA}" stroke-width="${s(
    2.4,
  )}" stroke-linejoin="round" stroke-linecap="round" opacity="0.85">
      <path d="M${s(-26)} ${s(-14)}h${s(13)}l${s(4)} ${s(-6)}h${s(18)}l${s(4)} ${s(6)}h${s(13)}a${s(
        4,
      )} ${s(4)} 0 0 1 ${s(4)} ${s(4)}v${s(26)}a${s(4)} ${s(4)} 0 0 1 ${s(-4)} ${s(4)}h${s(-52)}a${s(
        4,
      )} ${s(4)} 0 0 1 ${s(-4)} ${s(-4)}v${s(-26)}a${s(4)} ${s(4)} 0 0 1 ${s(4)} ${s(-4)}Z"/>
      <circle cx="0" cy="${s(7)}" r="${s(12)}"/>
    </g>`;
}

/* ------------------------------------------------------------------ moldura -- */

/**
 * Moldura de espera de uma fotografia.
 *
 * O texto vai desenhado no próprio SVG: quem abrir a pasta public/images vê
 * logo o que cada ficheiro representa, sem ter de abrir o código.
 */
function moldura({ width: w, height: h, legenda, ficheiro }) {
  const escala = Math.min(w, h) / 320;
  const centroY = h * 0.44;

  // Flores dispostas em quatro cantos, muito discretas.
  const flores = [
    [w * 0.12, h * 0.18, 1.15, 0.14],
    [w * 0.88, h * 0.24, 0.85, 0.11],
    [w * 0.2, h * 0.84, 0.7, 0.1],
    [w * 0.8, h * 0.8, 1.0, 0.12],
  ]
    .map(
      ([x, y, s, o]) =>
        `<g transform="translate(${round(x)} ${round(y)}) scale(${round(s * escala * 1.6)})">${flor(
          FLOR,
          o,
        )}</g>`,
    )
    .join('\n    ');

  const folhas = [
    [w * 0.3, h * 0.3, -20, 0.9],
    [w * 0.72, h * 0.66, 145, 1.1],
  ]
    .map(
      ([x, y, r, s]) =>
        `<path transform="translate(${round(x)} ${round(y)}) rotate(${r}) scale(${round(
          s * escala * 1.4,
        )})" d="M0 0q12-15 30-12q-10 17-30 12Z" fill="${FOLHA}" opacity="0.16"/>`,
    )
    .join('\n    ');

  const corpo = round(15 * escala);
  const nota = round(11.5 * escala);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
  <rect width="${w}" height="${h}" fill="#FBF7F5"/>
  <g>
    ${flores}
    ${folhas}
  </g>
  <rect x="${round(w * 0.02)}" y="${round(h * 0.03)}" width="${round(w * 0.96)}" height="${round(
    h * 0.94,
  )}" rx="${round(6 * escala)}" fill="none" stroke="${CEREJA}" stroke-width="${round(
    1.6 * escala,
  )}" stroke-dasharray="${round(10 * escala)} ${round(7 * escala)}" opacity="0.4"/>
  ${simboloFotografia(w / 2, centroY, escala)}
  <text x="${round(w / 2)}" y="${round(centroY + 46 * escala)}" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="${corpo}" font-weight="600" fill="${CEREJA_ESCURA}">${escapar(
    legenda,
  )}</text>
  <text x="${round(w / 2)}" y="${round(centroY + 46 * escala + nota * 1.9)}" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="${nota}" fill="${CEREJA}" opacity="0.75">${escapar(
    ficheiro,
  )}</text>
</svg>
`;
}

/* -------------------------------------------------------------- ficheiros -- */

/** Cada posição: proporção, motivo que ali entra e nome do ficheiro. */
const POSICOES = [
  // Destaque — 16:9
  ['hero-alfandega', 1600, 900, 'Vista da vila de Alfândega da Fé'],

  // Visitar — 3:2
  ['visitar/lagos-do-sabor', 1200, 800, 'Lagos do Sabor'],
  ['visitar/percursos', 1200, 800, 'Percursos pedestres'],
  ['visitar/cereja', 1200, 800, 'Cerejais em produção'],
  ['visitar/patrimonio', 1200, 800, 'O castelo de Alfândega da Fé'],
  ['visitar/amendoeiras', 1200, 800, 'Amendoeiras em flor'],

  // Notícias — 16:9
  ['noticias/orcamento', 1200, 675, 'Contas e orçamento municipal'],
  ['noticias/cereja', 1200, 675, 'Campanha da cereja'],
  ['noticias/agua', 1200, 675, 'Água e saneamento'],
  ['noticias/ambiente', 1200, 675, 'Ambiente e floresta'],
  ['noticias/escolas', 1200, 675, 'Educação e escolas'],
  ['noticias/social', 1200, 675, 'Ação social'],
  ['noticias/festa', 1200, 675, 'Cultura e festas'],

  // Eventos — 3:2
  ['eventos/musica', 900, 600, 'Espetáculos e concertos'],
  ['eventos/feira', 900, 600, 'Feiras e mercados'],
  ['eventos/exposicao', 900, 600, 'Exposições'],

  // Freguesias — 3:2
  ['freguesias/alfandega-da-fe', 1200, 800, 'Alfândega da Fé'],
  ['freguesias/agrobom-saldonha-vale-pereiro', 1200, 800, 'Agrobom, Saldonha e Vale Pereiro'],
  ['freguesias/cerejais', 1200, 800, 'Cerejais'],
  ['freguesias/eucisia-gouveia-valverde', 1200, 800, 'Eucísia, Gouveia e Valverde'],
  ['freguesias/ferradosa-sendim-da-serra', 1200, 800, 'Ferradosa e Sendim da Serra'],
  ['freguesias/gebelim-soeima', 1200, 800, 'Gebelim e Soeima'],
  ['freguesias/parada-sendim-da-ribeira', 1200, 800, 'Parada e Sendim da Ribeira'],
  ['freguesias/pombal-vales', 1200, 800, 'Pombal e Vales'],
  ['freguesias/sambade', 1200, 800, 'Sambade'],
  ['freguesias/vilar-chao', 1200, 800, 'Vilar Chão'],
  ['freguesias/vilarelhos', 1200, 800, 'Vilarelhos'],
  ['freguesias/vilares-de-vilarica-vale-frechoso', 1200, 800, 'Vilares de Vilariça e Vale Frechoso'],
];

for (const [nome, width, height, legenda] of POSICOES) {
  const caminho = join(OUT, `${nome}.svg`);
  await mkdir(dirname(caminho), { recursive: true });
  await writeFile(
    caminho,
    moldura({ width, height, legenda, ficheiro: `${nome}.jpg` }),
    'utf8',
  );
  console.log(`✓ public/images/${nome}.svg — ${legenda}`);
}

console.log(`\n${POSICOES.length} molduras geradas.`);
console.log('Substitua-as por fotografias com `npm run fotos` ou ferramentas/obter-fotos.html.');
