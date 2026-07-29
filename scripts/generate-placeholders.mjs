#!/usr/bin/env node
/**
 * Gera as imagens provisórias do portal.
 *
 *   npm run placeholders
 *
 * O portal foi desenhado para fotografias reais do concelho — como o sítio
 * oficial sempre teve. Este repositório não pode incluir essas fotografias
 * (os direitos têm de ser confirmados pela autarquia), por isso cada posição
 * de imagem recebe um SUBSTITUTO FOTOGRÁFICO: uma cena desfocada, com grão e
 * vinheta, que se lê como uma fotografia fora de foco — não como um desenho.
 * Assim o aspeto fica próximo do definitivo e é óbvio o que falta substituir.
 *
 * Para pôr as fotografias reais: guarde cada ficheiro em public/images com o
 * MESMO nome (mudando .svg para .jpg) e atualize o caminho em
 * src/content/data/. Mantenha as proporções de cada cena — são elas que
 * impedem o texto de saltar enquanto a imagem carrega.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'images');

/** Aleatoriedade determinística: cada compilação gera ficheiros idênticos. */
function rng(seed) {
  let state = (seed * 2654435761) >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

const round = (n) => Math.round(n * 10) / 10;

/* ---------------------------------------------------------------- do SVG -- */

/**
 * Moldura comum de todas as cenas: gradiente de céu, um grupo fortemente
 * desfocado com as formas da cena, realces de bokeh pouco desfocados,
 * vinheta e grão. É a combinação destas quatro camadas que faz o resultado
 * parecer uma fotografia fora de foco e não um desenho plano.
 */
function fotografia({ width, height, sky, shapes, subject = '', bokeh = '', vignette = 0.16 }) {
  const blur = round(height * 0.034);
  const medium = round(height * 0.013);
  const soft = round(height * 0.006);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img">
  <defs>
    <linearGradient id="ceu" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${sky[0]}"/>
      <stop offset="55%" stop-color="${sky[1]}"/>
      <stop offset="100%" stop-color="${sky[2]}"/>
    </linearGradient>
    <radialGradient id="vinheta" cx="50%" cy="42%" r="78%">
      <stop offset="62%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="${vignette}"/>
    </radialGradient>
    <filter id="desfoque" x="-25%" y="-25%" width="150%" height="150%">
      <feGaussianBlur stdDeviation="${blur}"/>
    </filter>
    <filter id="medio" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="${medium}"/>
    </filter>
    <filter id="suave" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="${soft * 2}"/>
    </filter>
    <filter id="grao">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.7 0.7 0.7 0 0"/>
    </filter>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#ceu)"/>
  <g filter="url(#desfoque)">
    ${shapes}
  </g>
  ${subject ? `<g filter="url(#medio)">\n    ${subject}\n  </g>` : ''}
  ${bokeh ? `<g filter="url(#suave)">\n    ${bokeh}\n  </g>` : ''}
  <rect width="${width}" height="${height}" fill="url(#vinheta)"/>
  <rect width="${width}" height="${height}" filter="url(#grao)" opacity="0.055"/>
</svg>
`;
}

/** Elipse difusa — o tijolo de todas as cenas. */
function mancha(cx, cy, rx, ry, fill, opacity = 1) {
  return `<ellipse cx="${round(cx)}" cy="${round(cy)}" rx="${round(rx)}" ry="${round(ry)}" fill="${fill}" opacity="${opacity}"/>`;
}

/** Banda horizontal que sangra pelas margens — encosta, campo ou água. */
function banda(width, y, h, fill, opacity = 1) {
  return `<rect x="${round(-width * 0.1)}" y="${round(y)}" width="${round(width * 1.2)}" height="${round(h)}" fill="${fill}" opacity="${opacity}"/>`;
}

/** Círculo de bokeh: um ponto fora de foco, com um rebordo mais claro. */
function bokeh(cx, cy, r, fill, opacity = 0.8) {
  return (
    `<circle cx="${round(cx)}" cy="${round(cy)}" r="${round(r)}" fill="${fill}" opacity="${opacity}"/>` +
    `<circle cx="${round(cx - r * 0.3)}" cy="${round(cy - r * 0.3)}" r="${round(r * 0.35)}" fill="#FFFFFF" opacity="${round(opacity * 0.28 * 10) / 10}"/>`
  );
}

/** Casario desfocado: blocos claros e telhados quentes, sem arestas legíveis. */
function casario(w, h, cx, cy, spread, rand, count = 16) {
  const parts = [];
  for (let i = 0; i < count; i += 1) {
    // Distribuição em fuso: mais denso ao centro, casas soltas nas pontas.
    const t = (i / (count - 1)) * 2 - 1;
    const x = cx + t * spread * 0.5 + (rand() - 0.5) * spread * 0.1;
    const y = cy + Math.abs(t) * h * 0.02 + (rand() - 0.5) * h * 0.03;
    const rw = w * (0.016 + rand() * 0.02);
    const rh = h * (0.018 + rand() * 0.016);
    parts.push(mancha(x, y, rw, rh, '#FBF8F1', 0.97));
    parts.push(mancha(x, y - rh * 1.05, rw * 0.9, rh * 0.6, '#9E4B38', 0.95));
  }
  // a torre da igreja: um traço vertical claro que sobressai do conjunto
  parts.push(mancha(cx + spread * 0.08, cy - h * 0.075, w * 0.011, h * 0.065, '#FBF8F1', 0.97));
  parts.push(mancha(cx + spread * 0.08, cy - h * 0.135, w * 0.015, h * 0.02, '#9E4B38', 0.95));
  return parts.join('\n    ');
}

/* ----------------------------------------------------------------- cenas -- */

/** A vila ao meio da encosta, num dia claro de verão. */
function cenaVila({ width: w, height: h, seed, quente = false }) {
  const rand = rng(seed);
  const sky = quente ? ['#FBEFDA', '#F6D9AE', '#EFC08C'] : ['#F0F7FC', '#D9EBF7', '#BADDF0'];
  const far = quente ? '#C4A182' : '#A9BF97';
  const mid = quente ? '#A87E62' : '#7FA36B';
  const near = quente ? '#8A6350' : '#5C8253';

  const shapes = [
    banda(w, h * 0.42, h * 0.7, far),
    mancha(w * 0.25, h * 0.46, w * 0.4, h * 0.13, far === '#C4A182' ? '#CFA98A' : '#B2C79E'),
    banda(w, h * 0.56, h * 0.6, mid),
    mancha(w * 0.78, h * 0.6, w * 0.36, h * 0.14, mid),
    banda(w, h * 0.78, h * 0.4, near),
    mancha(w * 0.14, h * 0.92, w * 0.3, h * 0.16, near),
    mancha(w * 0.6, h * 0.5, w * 0.2, h * 0.05, quente ? '#D5B294' : '#BCCfa2'.replace('f','F'), 0.6),
    mancha(w * 0.35, h * 0.68, w * 0.24, h * 0.05, quente ? '#96704F' : '#6F9460', 0.7),
    mancha(w * 0.85, h * 0.86, w * 0.26, h * 0.07, quente ? '#7E5A45' : '#527549', 0.7),
  ].join('\n    ');

  // O casario fica na camada de desfoque médio: é o assunto da fotografia,
  // um pouco mais nítido do que a paisagem à volta — como numa objetiva
  // com pouca profundidade de campo.
  const subject = casario(w, h, w * 0.5, h * 0.52, w * 0.62, rand, 16);

  return fotografia({ width: w, height: h, sky, shapes, subject });
}

/** O cerejal: verde fundo e cerejas fora de foco em primeiro plano. */
function cenaCerejal({ width: w, height: h, seed }) {
  const rand = rng(seed);
  const shapes = [
    banda(w, h * 0.38, h * 0.75, '#9DBB84'),
    mancha(w * 0.3, h * 0.42, w * 0.42, h * 0.12, '#AFC996'),
    banda(w, h * 0.58, h * 0.55, '#6E9159'),
    mancha(w * 0.72, h * 0.78, w * 0.5, h * 0.3, '#4F7345'),
    mancha(w * 0.12, h * 0.88, w * 0.34, h * 0.24, '#42663C'),
  ].join('\n    ');

  const dots = Array.from({ length: 9 }, () => {
    const r = h * (0.028 + rand() * 0.05);
    return bokeh(
      w * (0.06 + rand() * 0.88),
      h * (0.52 + rand() * 0.4),
      r,
      rand() > 0.45 ? '#A62531' : '#7E1B24',
      0.85,
    );
  }).join('\n    ');

  return fotografia({ width: w, height: h, sky: ['#EFF6FA', '#D5E8F4', '#B4D6EC'], shapes, bokeh: dots });
}

/** Os lagos do Sabor: água serena entre encostas de xisto. */
function cenaSabor({ width: w, height: h, seed }) {
  const rand = rng(seed);
  const shapes = [
    banda(w, h * 0.36, h * 0.3, '#8FAE9E'),
    mancha(w * 0.2, h * 0.4, w * 0.34, h * 0.13, '#7B9C8B'),
    mancha(w * 0.85, h * 0.42, w * 0.3, h * 0.16, '#68907E'),
    banda(w, h * 0.52, h * 0.55, '#79B4CD'),
    banda(w, h * 0.6, h * 0.05, '#9CCADE', 0.85),
    banda(w, h * 0.72, h * 0.04, '#8FC2D8', 0.7),
    mancha(w * 0.1, h * 0.95, w * 0.36, h * 0.2, '#3E5F54'),
    mancha(w * 0.92, h * 0.92, w * 0.3, h * 0.18, '#466B5E'),
  ].join('\n    ');

  const shimmer = Array.from({ length: 5 }, () =>
    mancha(w * (0.2 + rand() * 0.6), h * (0.56 + rand() * 0.2), w * (0.05 + rand() * 0.06), h * 0.008, '#EAF6FB', 0.7),
  ).join('\n    ');

  return fotografia({ width: w, height: h, sky: ['#EDF5F9', '#D2E7F1', '#AFD3E5'], shapes, bokeh: shimmer });
}

/** Amendoeiras em flor: copas claras sobre um céu de fevereiro. */
function cenaAmendoeira({ width: w, height: h, seed }) {
  const rand = rng(seed);
  const shapes = [
    banda(w, h * 0.55, h * 0.6, '#B6A794'),
    banda(w, h * 0.72, h * 0.45, '#9B876F'),
    mancha(w * 0.3, h * 0.4, w * 0.26, h * 0.2, '#F5E4EA', 0.96),
    mancha(w * 0.52, h * 0.34, w * 0.22, h * 0.17, '#F9EDF1', 0.96),
    mancha(w * 0.74, h * 0.42, w * 0.24, h * 0.19, '#F2DFE6', 0.96),
    mancha(w * 0.3, h * 0.62, w * 0.014, h * 0.09, '#6B5443'),
    mancha(w * 0.55, h * 0.58, w * 0.013, h * 0.1, '#6B5443'),
    mancha(w * 0.75, h * 0.63, w * 0.014, h * 0.09, '#6B5443'),
  ].join('\n    ');

  const petals = Array.from({ length: 7 }, () =>
    bokeh(w * (0.1 + rand() * 0.8), h * (0.2 + rand() * 0.45), h * (0.014 + rand() * 0.02), '#FBF3F6', 0.85),
  ).join('\n    ');

  return fotografia({ width: w, height: h, sky: ['#F4F0F5', '#E4DAE9', '#CDBFD9'], shapes, bokeh: petals, vignette: 0.12 });
}

/** O castelo: pedra quente ao fim da tarde, no alto da vila. */
function cenaCastelo({ width: w, height: h, seed }) {
  const rand = rng(seed);
  const shapes = [
    banda(w, h * 0.5, h * 0.65, '#C0996F'),
    mancha(w * 0.5, h * 0.52, w * 0.34, h * 0.16, '#CBA57B'),
    // a muralha e a torre de menagem, em blocos de pedra desfocados
    mancha(w * 0.44, h * 0.44, w * 0.05, h * 0.1, '#B08A5C'),
    mancha(w * 0.53, h * 0.4, w * 0.035, h * 0.14, '#A67F52'),
    mancha(w * 0.61, h * 0.45, w * 0.05, h * 0.09, '#B08A5C'),
    banda(w, h * 0.7, h * 0.45, '#8F6B47'),
    mancha(w * 0.85, h * 0.92, w * 0.34, h * 0.22, '#7A5A3C'),
  ].join('\n    ');

  const sun = bokeh(w * (0.7 + rand() * 0.1), h * 0.16, h * 0.05, '#FFF4DE', 0.9);

  return fotografia({ width: w, height: h, sky: ['#FBEEDD', '#F6D9B4', '#EDBE8D'], shapes, bokeh: sun });
}

/** Luzes de festa ao anoitecer: bokeh quente sobre o largo. */
function cenaFesta({ width: w, height: h, seed }) {
  const rand = rng(seed);
  const shapes = [
    banda(w, h * 0.55, h * 0.6, '#5A5560'),
    mancha(w * 0.3, h * 0.72, w * 0.4, h * 0.22, '#4A4650'),
    mancha(w * 0.8, h * 0.8, w * 0.36, h * 0.24, '#403C46'),
  ].join('\n    ');

  const lights = Array.from({ length: 12 }, () => {
    const warm = ['#F6CE7C', '#F2B564', '#EFDCA9', '#E9A25B'];
    return bokeh(
      w * (0.05 + rand() * 0.9),
      h * (0.18 + rand() * 0.5),
      h * (0.02 + rand() * 0.045),
      warm[Math.floor(rand() * warm.length)],
      0.85,
    );
  }).join('\n    ');

  return fotografia({ width: w, height: h, sky: ['#8B84A0', '#6E6784', '#4E4A62'], shapes, bokeh: lights, vignette: 0.22 });
}

/** O mercado de manhã: toldos e bancas em cores quentes, fora de foco. */
function cenaMercado({ width: w, height: h, seed }) {
  const rand = rng(seed);
  const shapes = [
    banda(w, h * 0.44, h * 0.7, '#CDBFA5'),
    mancha(w * 0.22, h * 0.5, w * 0.18, h * 0.09, '#B8503F'),
    mancha(w * 0.5, h * 0.46, w * 0.2, h * 0.1, '#E5E0D2'),
    mancha(w * 0.78, h * 0.51, w * 0.18, h * 0.09, '#5C8253'),
    banda(w, h * 0.68, h * 0.45, '#A9997D'),
    mancha(w * 0.35, h * 0.85, w * 0.4, h * 0.2, '#8F805F'),
  ].join('\n    ');

  const produce = Array.from({ length: 7 }, () => {
    const cores = ['#A62531', '#D6A21E', '#7E9C43', '#C4682F'];
    return bokeh(
      w * (0.1 + rand() * 0.8),
      h * (0.55 + rand() * 0.3),
      h * (0.02 + rand() * 0.03),
      cores[Math.floor(rand() * cores.length)],
      0.8,
    );
  }).join('\n    ');

  return fotografia({ width: w, height: h, sky: ['#F3F6F4', '#E2E9E2', '#CBD8CC'], shapes, bokeh: produce, vignette: 0.13 });
}

/** Interior de exposição: paredes claras e quadros desfocados. */
function cenaExposicao({ width: w, height: h, seed }) {
  const rand = rng(seed);
  const shapes = [
    banda(w, h * 0.68, h * 0.45, '#B9AE9F'),
    mancha(w * 0.26, h * 0.4, w * 0.09, h * 0.13, '#8C6E52'),
    mancha(w * 0.52, h * 0.38, w * 0.11, h * 0.15, '#5F7186'),
    mancha(w * 0.78, h * 0.41, w * 0.09, h * 0.12, '#96453C'),
  ].join('\n    ');

  const glow = Array.from({ length: 3 }, (_, i) =>
    bokeh(w * (0.26 + i * 0.26), h * 0.16, h * 0.03, '#FFF7E2', 0.8 - rand() * 0.1),
  ).join('\n    ');

  return fotografia({ width: w, height: h, sky: ['#F6F4F0', '#EDE9E2', '#DDD6CB'], shapes, bokeh: glow, vignette: 0.15 });
}

/* --------------------------------------------------------------- ficheiros -- */

/** As doze freguesias: uma cena por aldeia, com semente própria. */
const FREGUESIAS = [
  ['alfandega-da-fe', cenaVila, {}],
  ['agrobom-saldonha-vale-pereiro', cenaAmendoeira, {}],
  ['cerejais', cenaCerejal, {}],
  ['eucisia-gouveia-valverde', cenaVila, {}],
  ['ferradosa-sendim-da-serra', cenaSabor, {}],
  ['gebelim-soeima', cenaVila, { quente: true }],
  ['parada-sendim-da-ribeira', cenaVila, {}],
  ['pombal-vales', cenaCerejal, {}],
  ['sambade', cenaVila, {}],
  ['vilar-chao', cenaVila, { quente: true }],
  ['vilarelhos', cenaAmendoeira, {}],
  ['vilares-de-vilarica-vale-frechoso', cenaCerejal, {}],
].map(([slug, cena, extra], i) => ({
  name: `freguesias/${slug}.svg`,
  svg: cena({ width: 1200, height: 800, seed: 200 + i * 7, ...extra }),
}));

const FILES = [
  // Destaque da página inicial — 16:9
  { name: 'hero-alfandega.svg', svg: cenaVila({ width: 1600, height: 900, seed: 7 }) },

  // Visitar — 3:2
  { name: 'visitar/lagos-do-sabor.svg', svg: cenaSabor({ width: 1200, height: 800, seed: 21 }) },
  { name: 'visitar/percursos.svg', svg: cenaVila({ width: 1200, height: 800, seed: 33 }) },
  { name: 'visitar/cereja.svg', svg: cenaCerejal({ width: 1200, height: 800, seed: 11 }) },
  { name: 'visitar/patrimonio.svg', svg: cenaCastelo({ width: 1200, height: 800, seed: 52 }) },
  { name: 'visitar/amendoeiras.svg', svg: cenaAmendoeira({ width: 1200, height: 800, seed: 61 }) },

  // Notícias — 16:9
  { name: 'noticias/orcamento.svg', svg: cenaVila({ width: 1200, height: 675, seed: 41 }) },
  { name: 'noticias/cereja.svg', svg: cenaCerejal({ width: 1200, height: 675, seed: 52 }) },
  { name: 'noticias/agua.svg', svg: cenaSabor({ width: 1200, height: 675, seed: 63 }) },
  { name: 'noticias/ambiente.svg', svg: cenaCerejal({ width: 1200, height: 675, seed: 68 }) },
  { name: 'noticias/escolas.svg', svg: cenaVila({ width: 1200, height: 675, seed: 74, quente: true }) },
  { name: 'noticias/social.svg', svg: cenaMercado({ width: 1200, height: 675, seed: 96 }) },
  { name: 'noticias/festa.svg', svg: cenaFesta({ width: 1200, height: 675, seed: 88 }) },

  // Eventos — 3:2
  { name: 'eventos/musica.svg', svg: cenaFesta({ width: 900, height: 600, seed: 107 }) },
  { name: 'eventos/feira.svg', svg: cenaMercado({ width: 900, height: 600, seed: 118 }) },
  { name: 'eventos/exposicao.svg', svg: cenaExposicao({ width: 900, height: 600, seed: 129 }) },

  // Freguesias — 3:2
  ...FREGUESIAS,
];

for (const file of FILES) {
  const path = join(OUT, file.name);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, file.svg, 'utf8');
  console.log(`✓ public/images/${file.name}`);
}

console.log(`\n${FILES.length} imagens geradas.`);
