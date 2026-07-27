#!/usr/bin/env node
/**
 * Gera as imagens do portal em SVG.
 *
 *   npm run placeholders
 *
 * Porquê SVG e não fotografias: o repositório não inclui fotografias cujos
 * direitos não estejam esclarecidos. Estas ilustrações são cenas reconhecíveis
 * do concelho — os socalcos de cerejeiras, os lagos do Sabor, o castelo, a
 * amendoeira em flor — desenhadas na paleta do Município.
 *
 * Para substituir por fotografias reais: coloque os ficheiros em public/images
 * com o MESMO nome (mudando .svg para .jpg) e atualize o caminho em
 * src/content/data/. Mantenha as proporções indicadas em cada cena, senão o
 * texto salta enquanto a imagem carrega.
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

/* --------------------------------------------------------------- paletas -- */

const PALETTES = {
  /** Dia de verão sobre a vila: céu azul, encostas verdes, casario branco. */
  verao: {
    sky: ['#F2F9FD', '#D8ECF8', '#B5DBF0'],
    sun: '#FFF7DC',
    hills: ['#B5C98F', '#8FB06A', '#6E9455', '#54763F'],
    field: '#93B26E',
    tree: '#57432F',
    leaf: '#47734C',
    village: '#FFFFFF',
    roof: '#B4232E',
    line: '#FFFFFF',
  },
  /** Fim de tarde sobre a vila — quente, mas claro. */
  entardecer: {
    sky: ['#FDF0DC', '#FAD5A8', '#F2B583'],
    sun: '#FFF8E6',
    hills: ['#D9AE8C', '#C08F6D', '#A16F52', '#7E523E'],
    field: '#B07E5D',
    tree: '#5C4232',
    leaf: '#6E8757',
    village: '#FFFAF2',
    roof: '#B4232E',
    line: '#FFFFFF',
  },
  /** Manhã de junho nos cerejais. */
  cerejal: {
    sky: ['#EAF3F8', '#CFE4F0', '#A9CDE2'],
    sun: '#FFFFFF',
    hills: ['#8FAE7A', '#5F8A5C', '#3E6647', '#2A4736'],
    field: '#6E9159',
    tree: '#4B3A2F',
    leaf: '#3E6647',
    village: '#FFFFFF',
    roof: '#B4232E',
    line: '#FFFFFF',
  },
  /** Os lagos do Sabor entre encostas de xisto. */
  sabor: {
    sky: ['#E6F2F6', '#C2E0EA', '#96C8DA'],
    sun: '#FFFFFF',
    hills: ['#7FA394', '#4E7A6C', '#33564E', '#223A36'],
    field: '#4E7A6C',
    tree: '#2F4A42',
    leaf: '#4E7A6C',
    village: '#F2FAFB',
    roof: '#8E1B26',
    line: '#FFFFFF',
    water: ['#7FC0D8', '#4E9BBA', '#31768F'],
  },
  /** Amendoeiras em flor, fevereiro. */
  amendoeira: {
    sky: ['#F6F0F6', '#E7DCEA', '#D2C2DA'],
    sun: '#FFFFFF',
    hills: ['#B9A9A2', '#8E7B78', '#63524F', '#3E3231'],
    field: '#9C8A80',
    tree: '#4A3B36',
    leaf: '#F7E6EE',
    village: '#FFFFFF',
    roof: '#8E1B26',
    line: '#FFFFFF',
  },
};

/* ------------------------------------------------------------ primitivas -- */

function skyGradient(id, palette) {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${palette.sky[0]}"/>
      <stop offset="55%" stop-color="${palette.sky[1]}"/>
      <stop offset="100%" stop-color="${palette.sky[2]}"/>
    </linearGradient>`;
}

/** Cordilheira: cada camada mais escura e mais baixa que a anterior. */
function ridge(width, height, baseY, amplitude, color, rand, roughness = 6) {
  let d = `M0 ${height} L0 ${round(baseY)}`;
  const steps = roughness;
  for (let i = 1; i <= steps; i += 1) {
    const x = (width / steps) * i;
    const previousX = (width / steps) * (i - 1);
    const y = baseY + (rand() - 0.5) * amplitude * 2;
    const cx = (previousX + x) / 2;
    d += ` Q${round(cx)} ${round(y - amplitude * 0.8)} ${round(x)} ${round(y)}`;
  }
  return `<path d="${d} L${width} ${height} Z" fill="${color}"/>`;
}

/** Socalcos: as linhas de nível que desenham as encostas do concelho. */
function terraces(width, height, fromY, toY, count, color, opacity = 0.28) {
  return Array.from({ length: count }, (_, i) => {
    const y = fromY + ((toY - fromY) / count) * i;
    const bow = (toY - y) * 0.06;
    return `<path d="M${round(width * -0.02)} ${round(y)} Q${round(width * 0.5)} ${round(y - bow)} ${round(width * 1.02)} ${round(y)}" fill="none" stroke="${color}" stroke-width="1.4" opacity="${opacity}"/>`;
  }).join('\n    ');
}

/**
 * Ramo de cerejeira em primeiro plano.
 *
 * É o elemento que dá identidade às cenas: um ramo que entra pelo canto, com
 * folhas e cerejas grandes, como o primeiro plano de uma fotografia. Substitui
 * as cerejas soltas espalhadas pela encosta, que pareciam flutuar.
 */
function cherryBough(x, y, scale, palette, flip = false) {
  const s = flip ? -1 : 1;
  const px = (v) => round(x + v * scale * s);
  const py = (v) => round(y + v * scale);
  // Deslocamentos relativos (comandos `q`) também têm de ir à escala.
  const dx = (v) => round(v * scale * s);
  const dy = (v) => round(v * scale);

  // Ramo principal, ligeiramente ascendente.
  const branch =
    `<path d="M${px(0)} ${py(0)} C${px(12)} ${py(-3)} ${px(26)} ${py(-5)} ${px(42)} ${py(-6)}"` +
    ` stroke="${palette.tree}" stroke-width="${round(2.2 * scale)}" stroke-linecap="round" fill="none"/>`;

  /** Folha lanceolada, com nervura, presa ao ramo por um pecíolo curto. */
  const leaf = (at, up) => {
    const bx = at;
    const by = -3 - at * 0.07;
    const dir = up ? -1 : 1;
    return (
      `<path d="M${px(bx)} ${py(by)} q${dx(3)} ${dy(2.5 * dir)} ${dx(6)} ${dy(3 * dir)}"` +
      ` stroke="${palette.tree}" stroke-width="${round(0.7 * scale)}" fill="none"/>` +
      `<path d="M${px(bx + 6)} ${py(by + 3 * dir)}` +
      ` q${dx(6)} ${dy(-4 * dir)} ${dx(13)} ${dy(1.5 * dir)}` +
      ` q${dx(-7)} ${dy(4.5 * dir)} ${dx(-13)} ${dy(-1.5 * dir)} Z"` +
      ` fill="${palette.leaf}"/>`
    );
  };

  const leaves = leaf(8, true) + leaf(22, false) + leaf(34, true);

  /**
   * Duas cerejas do mesmo pedúnculo — a forma que toda a gente reconhece.
   * Os pés partem do mesmo ponto do ramo e abrem em Y.
   */
  const pair = (at, drop, r) => {
    const ax = at;
    const ay = -5;
    const left = { x: ax - 3.2, y: ay + drop };
    const right = { x: ax + 4.6, y: ay + drop * 0.78 };
    return (
      `<path d="M${px(ax)} ${py(ay)} Q${px(ax - 4.4)} ${py(ay + drop * 0.55)} ${px(left.x)} ${py(left.y - r * 0.8)}"` +
      ` stroke="${palette.tree}" stroke-width="${round(0.8 * scale)}" fill="none"/>` +
      `<path d="M${px(ax)} ${py(ay)} Q${px(ax + 5.2)} ${py(ay + drop * 0.4)} ${px(right.x)} ${py(right.y - r * 0.8)}"` +
      ` stroke="${palette.tree}" stroke-width="${round(0.8 * scale)}" fill="none"/>` +
      `<circle cx="${px(left.x)}" cy="${py(left.y)}" r="${round(r * scale)}" fill="#B4232E"/>` +
      `<circle cx="${px(right.x)}" cy="${py(right.y)}" r="${round(r * 0.92 * scale)}" fill="#8E1B26"/>` +
      `<circle cx="${px(left.x - r * 0.35)}" cy="${py(left.y - r * 0.38)}" r="${round(r * 0.26 * scale)}" fill="#FFFFFF" opacity="0.35"/>`
    );
  };

  return `<g>${branch}${leaves}${pair(15, 13, 3.6)}${pair(33, 10, 3.1)}</g>`;
}

/** Uma cerejeira: tronco curto, copa larga e, se pedido, cerejas. */
function cherryTree(x, y, scale, palette, withFruit, rand) {
  const trunk = `<path d="M${round(x - 1.6 * scale)} ${round(y)} L${round(x - 0.9 * scale)} ${round(y - 7 * scale)} L${round(x + 0.9 * scale)} ${round(y - 7 * scale)} L${round(x + 1.6 * scale)} ${round(y)} Z" fill="${palette.tree}"/>`;

  const canopy = [0, 1, 2]
    .map((i) => {
      const cx = x + (i - 1) * 4.2 * scale;
      const cy = y - (9 + (i === 1 ? 3.4 : 0)) * scale;
      const r = (i === 1 ? 6.6 : 5.2) * scale;
      return `<circle cx="${round(cx)}" cy="${round(cy)}" r="${round(r)}" fill="${palette.leaf}"/>`;
    })
    .join('');

  const fruit = withFruit
    ? Array.from({ length: 5 }, () => {
        const fx = x + (rand() - 0.5) * 11 * scale;
        const fy = y - (7 + rand() * 7) * scale;
        return `<circle cx="${round(fx)}" cy="${round(fy)}" r="${round(1.5 * scale)}" fill="#B4232E"/>`;
      }).join('')
    : '';

  return `<g>${trunk}${canopy}${fruit}</g>`;
}

/** Silhueta da vila: casario baixo, telhados vermelhos e a torre da igreja. */
function village(x, y, scale, palette, rand, houses = 9) {
  const parts = [];

  for (let i = 0; i < houses; i += 1) {
    const w = (7 + rand() * 5) * scale;
    const h = (5 + rand() * 4) * scale;
    const hx = x + i * 8.4 * scale + rand() * 2;
    parts.push(
      `<rect x="${round(hx)}" y="${round(y - h)}" width="${round(w)}" height="${round(h)}" fill="${palette.village}"/>`,
      `<path d="M${round(hx - 0.8)} ${round(y - h)} L${round(hx + w / 2)} ${round(y - h - 2.6 * scale)} L${round(hx + w + 0.8)} ${round(y - h)} Z" fill="${palette.roof}"/>`,
    );
  }

  // Torre da igreja
  const tx = x + houses * 4.2 * scale;
  const th = 19 * scale;
  parts.push(
    `<rect x="${round(tx)}" y="${round(y - th)}" width="${round(6 * scale)}" height="${round(th)}" fill="${palette.village}"/>`,
    `<path d="M${round(tx - 1.4)} ${round(y - th)} L${round(tx + 3 * scale)} ${round(y - th - 7 * scale)} L${round(tx + 6 * scale + 1.4)} ${round(y - th)} Z" fill="${palette.roof}"/>`,
    `<rect x="${round(tx + 2.2 * scale)} " y="${round(y - th + 4 * scale)}" width="${round(1.6 * scale)}" height="${round(3.4 * scale)}" fill="${palette.roof}" opacity="0.75"/>`,
  );

  return `<g>${parts.join('')}</g>`;
}

/* ----------------------------------------------------------------- cenas -- */

/** Panorâmica da vila entre socalcos de cerejeiras. */
function sceneVila({ width, height, palette, seed }) {
  const rand = rng(seed);
  const horizon = height * 0.52;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img">
  <defs>${skyGradient('ceu', palette)}</defs>
  <rect width="${width}" height="${height}" fill="url(#ceu)"/>
  <circle cx="${round(width * 0.74)}" cy="${round(height * 0.2)}" r="${round(height * 0.075)}" fill="${palette.sun}" opacity="0.85"/>

  ${ridge(width, height, horizon - height * 0.1, height * 0.05, palette.hills[0], rand, 5)}
  ${ridge(width, height, horizon, height * 0.045, palette.hills[1], rand, 6)}
  ${village(width * 0.44, horizon + height * 0.07, height / 95, palette, rand, 8)}
  ${ridge(width, height, horizon + height * 0.16, height * 0.04, palette.hills[2], rand, 7)}
  ${terraces(width, height, horizon + height * 0.2, height * 0.98, 11, palette.line, 0.22)}
  ${Array.from({ length: 14 }, (_, i) => {
    const x = width * 0.04 + (i % 7) * (width * 0.145) + (i > 6 ? width * 0.07 : 0);
    const y = horizon + height * (i > 6 ? 0.53 : 0.3);
    return cherryTree(x, y, (height / 150) * (i > 6 ? 1.7 : 1), palette, i > 6, rand);
  }).join('\n  ')}
</svg>
`;
}

/** Cerejal em primeiro plano, com fruta bem visível. */
function sceneCerejal({ width, height, palette, seed }) {
  const rand = rng(seed);
  const horizon = height * 0.46;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img">
  <defs>${skyGradient('ceu', palette)}</defs>
  <rect width="${width}" height="${height}" fill="url(#ceu)"/>
  ${ridge(width, height, horizon, height * 0.05, palette.hills[0], rand, 5)}
  ${ridge(width, height, horizon + height * 0.12, height * 0.04, palette.hills[1], rand, 6)}
  <rect x="0" y="${round(horizon + height * 0.24)}" width="${width}" height="${round(height * 0.76)}" fill="${palette.field}"/>
  ${terraces(width, height, horizon + height * 0.3, height * 0.98, 8, palette.line, 0.18)}
  ${Array.from({ length: 5 }, (_, i) =>
    cherryTree(width * (0.12 + i * 0.19), height * 0.94, height / 110, palette, true, rand),
  ).join('\n  ')}
  ${cherryBough(width * 0.05, height * 0.21, height / 62, palette)}
</svg>
`;
}

/** Os lagos do Sabor entre penhascos. */
function sceneSabor({ width, height, palette, seed }) {
  const rand = rng(seed);
  const waterLine = height * 0.58;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img">
  <defs>
    ${skyGradient('ceu', palette)}
    <linearGradient id="agua" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${palette.water[0]}"/>
      <stop offset="60%" stop-color="${palette.water[1]}"/>
      <stop offset="100%" stop-color="${palette.water[2]}"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#ceu)"/>
  ${ridge(width, height, height * 0.3, height * 0.06, palette.hills[0], rand, 5)}
  ${ridge(width, height, height * 0.42, height * 0.05, palette.hills[1], rand, 6)}
  <rect x="0" y="${round(waterLine)}" width="${width}" height="${round(height - waterLine)}" fill="url(#agua)"/>

  <path d="M0 ${round(waterLine)} L${round(width * 0.3)} ${round(waterLine)} L${round(width * 0.2)} ${round(height * 0.3)} L0 ${round(height * 0.36)} Z" fill="${palette.hills[2]}"/>
  <path d="M${width} ${round(waterLine)} L${round(width * 0.66)} ${round(waterLine)} L${round(width * 0.78)} ${round(height * 0.28)} L${width} ${round(height * 0.34)} Z" fill="${palette.hills[2]}"/>
  <path d="M${round(width * 0.28)} ${round(waterLine)} L${round(width * 0.48)} ${round(waterLine)} L${round(width * 0.4)} ${round(height * 0.44)} Z" fill="${palette.hills[3]}"/>

  ${Array.from({ length: 6 }, (_, i) => {
    const y = waterLine + height * 0.06 + i * height * 0.06;
    return `<path d="M${round(width * 0.08)} ${round(y)} Q${round(width * 0.3)} ${round(y - height * 0.018)} ${round(width * 0.52)} ${round(y)} T${round(width * 0.95)} ${round(y)}" stroke="${palette.line}" stroke-width="${round(1.4 + i * 0.3)}" fill="none" opacity="${round(0.34 - i * 0.045)}"/>`;
  }).join('\n  ')}
  ${Array.from({ length: 4 }, (_, i) =>
    cherryTree(width * (0.06 + i * 0.06), waterLine - height * 0.01, height / 240, palette, false, rand),
  ).join('\n  ')}
</svg>
`;
}

/** Amendoeiras em flor sobre encosta de xisto. */
function sceneAmendoeira({ width, height, palette, seed }) {
  const rand = rng(seed);
  const horizon = height * 0.5;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img">
  <defs>${skyGradient('ceu', palette)}</defs>
  <rect width="${width}" height="${height}" fill="url(#ceu)"/>
  ${ridge(width, height, horizon, height * 0.05, palette.hills[0], rand, 5)}
  ${ridge(width, height, horizon + height * 0.14, height * 0.04, palette.hills[1], rand, 6)}
  <rect x="0" y="${round(horizon + height * 0.26)}" width="${width}" height="${round(height * 0.74)}" fill="${palette.field}"/>
  ${terraces(width, height, horizon + height * 0.3, height * 0.98, 7, palette.line, 0.16)}
  ${Array.from({ length: 6 }, (_, i) =>
    cherryTree(width * (0.1 + i * 0.16), height * 0.9, height / 120, palette, false, rand),
  ).join('\n  ')}
</svg>
`;
}

/** Ruínas do castelo sobre a vila. */
function sceneCastelo({ width, height, palette, seed }) {
  const rand = rng(seed);
  const base = height * 0.78;
  const w = height * 0.06;

  const towers = [0, 1, 2, 3]
    .map((i) => {
      const x = width * 0.3 + i * w * 1.9;
      const h = height * (i === 1 || i === 2 ? 0.34 : 0.24);
      const merlons = Array.from({ length: 3 }, (_, m) =>
        `<rect x="${round(x + m * (w / 3))}" y="${round(base - h - height * 0.03)}" width="${round(w / 4.2)}" height="${round(height * 0.03)}" fill="${palette.hills[3]}"/>`,
      ).join('');
      return `<g><rect x="${round(x)}" y="${round(base - h)}" width="${round(w)}" height="${round(h)}" fill="${palette.hills[3]}"/>${merlons}</g>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img">
  <defs>${skyGradient('ceu', palette)}</defs>
  <rect width="${width}" height="${height}" fill="url(#ceu)"/>
  <circle cx="${round(width * 0.2)}" cy="${round(height * 0.2)}" r="${round(height * 0.07)}" fill="${palette.sun}" opacity="0.8"/>
  ${ridge(width, height, height * 0.55, height * 0.04, palette.hills[0], rand, 5)}
  <path d="M${round(width * 0.18)} ${round(base)} Q${round(width * 0.5)} ${round(height * 0.5)} ${round(width * 0.86)} ${round(base)} Z" fill="${palette.hills[2]}"/>
  ${towers}
  <rect x="${round(width * 0.3)}" y="${round(base - height * 0.12)}" width="${round(w * 7.1)}" height="${round(height * 0.12)}" fill="${palette.hills[3]}"/>
  ${village(width * 0.1, height * 0.99, height / 150, palette, rand, 12)}
</svg>
`;
}

/** Motivo gráfico de cerejas — para cartões sem cena própria. */
function motifCerejas({ width, height, seed, background = '#FBEAEB' }) {
  const rand = rng(seed);
  const fruits = Array.from({ length: 9 }, () => {
    const cx = width * (0.1 + rand() * 0.8);
    const cy = height * (0.25 + rand() * 0.55);
    const r = height * (0.045 + rand() * 0.03);
    return `<g opacity="${round(0.55 + rand() * 0.45)}">
      <path d="M${round(cx)} ${round(cy - r)} q${round(r * 1.5)} ${round(-r * 2)} ${round(r * 2.6)} ${round(-r * 0.6)}" stroke="#3E6647" stroke-width="${round(r * 0.34)}" fill="none"/>
      <circle cx="${round(cx)}" cy="${round(cy)}" r="${round(r)}" fill="#B4232E"/>
      <circle cx="${round(cx + r * 2.6)}" cy="${round(cy - r * 0.5)}" r="${round(r * 0.92)}" fill="#8E1B26"/>
    </g>`;
  }).join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img">
  <rect width="${width}" height="${height}" fill="${background}"/>
  ${fruits}
</svg>
`;
}

/* ------------------------------------------------------------- ficheiros -- */

const files = [
  // Imagem principal da página inicial — 16:9
  { name: 'hero-alfandega.svg', svg: sceneVila({ width: 1600, height: 900, palette: PALETTES.verao, seed: 7 }) },

  // Turismo — 3:2
  { name: 'visitar/lagos-do-sabor.svg', svg: sceneSabor({ width: 1200, height: 800, palette: PALETTES.sabor, seed: 21 }) },
  { name: 'visitar/percursos.svg', svg: sceneVila({ width: 1200, height: 800, palette: PALETTES.cerejal, seed: 33 }) },
  { name: 'visitar/cereja.svg', svg: sceneCerejal({ width: 1200, height: 800, palette: PALETTES.cerejal, seed: 11 }) },
  { name: 'visitar/patrimonio.svg', svg: sceneCastelo({ width: 1200, height: 800, palette: PALETTES.entardecer, seed: 52 }) },
  { name: 'visitar/amendoeiras.svg', svg: sceneAmendoeira({ width: 1200, height: 800, palette: PALETTES.amendoeira, seed: 64 }) },

  // Notícias — 16:9
  { name: 'noticias/orcamento.svg', svg: sceneVila({ width: 1200, height: 675, palette: PALETTES.cerejal, seed: 41 }) },
  { name: 'noticias/cereja.svg', svg: sceneCerejal({ width: 1200, height: 675, palette: PALETTES.cerejal, seed: 52 }) },
  { name: 'noticias/agua.svg', svg: sceneSabor({ width: 1200, height: 675, palette: PALETTES.sabor, seed: 63 }) },
  { name: 'noticias/escolas.svg', svg: sceneVila({ width: 1200, height: 675, palette: PALETTES.entardecer, seed: 74 }) },
  { name: 'noticias/ambiente.svg', svg: sceneAmendoeira({ width: 1200, height: 675, palette: PALETTES.amendoeira, seed: 85 }) },
  { name: 'noticias/social.svg', svg: sceneVila({ width: 1200, height: 675, palette: PALETTES.cerejal, seed: 96 }) },
  { name: 'noticias/festa.svg', svg: motifCerejas({ width: 1200, height: 675, seed: 101 }) },

  // Eventos — 3:2
  { name: 'eventos/musica.svg', svg: sceneVila({ width: 900, height: 600, palette: PALETTES.entardecer, seed: 107 }) },
  { name: 'eventos/feira.svg', svg: sceneCerejal({ width: 900, height: 600, palette: PALETTES.cerejal, seed: 118 }) },
  { name: 'eventos/exposicao.svg', svg: sceneCastelo({ width: 900, height: 600, palette: PALETTES.amendoeira, seed: 129 }) },
];

for (const file of files) {
  const target = join(OUT, file.name);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, file.svg, 'utf8');
  console.log(`✓ public/images/${file.name}`);
}

console.log(`\n${files.length} imagens geradas.`);
