#!/usr/bin/env node
/**
 * Erzeugt die Bildplatzhalter als SVG.
 *
 *   npm run placeholders
 *
 * Warum SVG statt Fotos: das Repository enthält keine Fotografien, deren
 * Rechte nicht geklärt sind. Die Platzhalter sind ruhig, institutionell und
 * in der Bildsprache des Portals gehalten – sie sehen nicht nach „fehlendem
 * Bild“ aus, sondern nach Illustration.
 *
 * Vor dem Livegang ersetzt die Verwaltung die Dateien in public/images durch
 * echte Aufnahmen (JPG/AVIF). Die Seitenverhältnisse stehen in
 * src/content/data/media.ts und müssen dabei erhalten bleiben – dann bleibt
 * das Layout sprungfrei.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'images');

/** Deterministischer Pseudo-Zufall, damit jeder Build dieselben Dateien erzeugt. */
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

function hills({ width, height, palette, seed, houses = true }) {
  const rand = rng(seed);
  const layers = palette.hills
    .map((color, index) => {
      const baseY = height * (0.44 + index * 0.13);
      const amplitude = height * (0.1 - index * 0.014);
      const steps = 7;
      let d = `M0 ${height} L0 ${baseY}`;
      for (let i = 0; i <= steps; i += 1) {
        const x = (width / steps) * i;
        const y = baseY + Math.sin(i * 1.1 + seed + index) * amplitude - rand() * amplitude * 0.5;
        const cx = x - width / steps / 2;
        d += ` Q${cx} ${y - amplitude * 0.6} ${x} ${y}`;
      }
      return `<path d="${d} L${width} ${height} Z" fill="${color}"/>`;
    })
    .join('\n    ');

  // Terrassen der Vinha/Olival als feine Linien im mittleren Hang
  const terraces = Array.from({ length: 9 }, (_, i) => {
    const y = height * 0.6 + i * (height * 0.035);
    return `<path d="M${width * 0.05} ${y} Q${width * 0.5} ${y - height * 0.03} ${width * 0.98} ${y}" stroke="${palette.line}" stroke-width="1.2" fill="none" opacity="0.35"/>`;
  }).join('\n    ');

  const village = houses
    ? `<g fill="${palette.village}" opacity="0.9">
      ${Array.from({ length: 11 }, (_, i) => {
        const x = width * 0.18 + i * (width * 0.045) + rand() * 6;
        const h = height * (0.035 + rand() * 0.03);
        const w = h * (1.1 + rand() * 0.5);
        const y = height * 0.545 - h;
        return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="1"/>`;
      }).join('\n      ')}
      <rect x="${(width * 0.4).toFixed(1)}" y="${(height * 0.44).toFixed(1)}" width="7" height="${(height * 0.105).toFixed(1)}" rx="1"/>
      <path d="M${(width * 0.4 - 4).toFixed(1)} ${(height * 0.44).toFixed(1)} h15 l-7.5 -12 Z"/>
    </g>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img">
  <rect width="${width}" height="${height}" fill="${palette.sky}"/>
  <circle cx="${width * 0.78}" cy="${height * 0.2}" r="${height * 0.09}" fill="${palette.sun}" opacity="0.5"/>
  <g>
    ${layers}
    ${terraces}
    ${village}
  </g>
</svg>
`;
}

/** Abstrakte Titelbilder für Nachrichten und Rubriken. */
function motif({ width, height, palette, seed, kind }) {
  const rand = rng(seed);
  const shapes = [];

  if (kind === 'cherry') {
    for (let i = 0; i < 7; i += 1) {
      const cx = width * (0.12 + rand() * 0.76);
      const cy = height * (0.25 + rand() * 0.55);
      const r = height * (0.05 + rand() * 0.055);
      shapes.push(
        `<path d="M${cx.toFixed(1)} ${(cy - r).toFixed(1)} q${(r * 1.6).toFixed(1)} ${(-r * 1.9).toFixed(1)} ${(r * 2.6).toFixed(1)} ${(-r * 0.6).toFixed(1)}" stroke="${palette.line}" stroke-width="2" fill="none" opacity="0.6"/>`,
      );
      shapes.push(
        `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${palette.accent}" opacity="${(0.55 + rand() * 0.4).toFixed(2)}"/>`,
      );
    }
  } else if (kind === 'water') {
    for (let i = 0; i < 6; i += 1) {
      const y = height * (0.3 + i * 0.11);
      shapes.push(
        `<path d="M0 ${y.toFixed(1)} Q${(width * 0.25).toFixed(1)} ${(y - height * 0.06).toFixed(1)} ${(width * 0.5).toFixed(1)} ${y.toFixed(1)} T${width} ${y.toFixed(1)}" stroke="${palette.accent}" stroke-width="${(2 + i * 0.6).toFixed(1)}" fill="none" opacity="${(0.7 - i * 0.09).toFixed(2)}"/>`,
      );
    }
  } else if (kind === 'grid') {
    const cols = 6;
    const rows = 4;
    for (let c = 0; c < cols; c += 1) {
      for (let r = 0; r < rows; r += 1) {
        if (rand() < 0.42) continue;
        const w = width / cols;
        const h = height / rows;
        shapes.push(
          `<rect x="${(c * w + w * 0.14).toFixed(1)}" y="${(r * h + h * 0.14).toFixed(1)}" width="${(w * 0.72).toFixed(1)}" height="${(h * 0.72).toFixed(1)}" rx="3" fill="${palette.accent}" opacity="${(0.18 + rand() * 0.5).toFixed(2)}"/>`,
        );
      }
    }
  } else {
    for (let i = 0; i < 5; i += 1) {
      const x = width * (0.08 + i * 0.19);
      const h = height * (0.2 + rand() * 0.55);
      shapes.push(
        `<rect x="${x.toFixed(1)}" y="${(height - h - height * 0.12).toFixed(1)}" width="${(width * 0.11).toFixed(1)}" height="${h.toFixed(1)}" rx="4" fill="${palette.accent}" opacity="${(0.3 + rand() * 0.5).toFixed(2)}"/>`,
      );
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img">
  <rect width="${width}" height="${height}" fill="${palette.sky}"/>
  ${shapes.join('\n  ')}
</svg>
`;
}

const INSTITUTIONAL = {
  sky: '#E8F0F6',
  sun: '#FBEAEB',
  hills: ['#1D6FA3', '#16537C', '#0F3D5C', '#08283D'],
  line: '#FFFFFF',
  village: '#F5F7F9',
};

const WARM = {
  sky: '#FBEAEB',
  sun: '#F5F7F9',
  hills: ['#C9808A', '#8E1B26', '#5E1119', '#3A0B10'],
  line: '#FFFFFF',
  village: '#FBEAEB',
};

const NATURE = {
  sky: '#E6F2EF',
  sun: '#F5F7F9',
  hills: ['#4FA48C', '#1F6F5C', '#154B3F', '#0C2B24'],
  line: '#FFFFFF',
  village: '#E6F2EF',
};

const files = [
  { name: 'hero-alfandega.svg', svg: hills({ width: 1600, height: 900, palette: INSTITUTIONAL, seed: 7 }) },
  { name: 'visitar/lagos-do-sabor.svg', svg: hills({ width: 1200, height: 800, palette: NATURE, seed: 21, houses: false }) },
  { name: 'visitar/percursos.svg', svg: hills({ width: 1200, height: 800, palette: NATURE, seed: 33, houses: false }) },
  { name: 'visitar/cereja.svg', svg: motif({ width: 1200, height: 800, palette: { ...WARM, accent: '#B4232E' }, seed: 11, kind: 'cherry' }) },
  { name: 'noticias/orcamento.svg', svg: motif({ width: 1200, height: 675, palette: { ...INSTITUTIONAL, accent: '#1D6FA3' }, seed: 41, kind: 'grid' }) },
  { name: 'noticias/cereja.svg', svg: motif({ width: 1200, height: 675, palette: { ...WARM, accent: '#B4232E' }, seed: 52, kind: 'cherry' }) },
  { name: 'noticias/agua.svg', svg: motif({ width: 1200, height: 675, palette: { ...INSTITUTIONAL, accent: '#1D6FA3' }, seed: 63, kind: 'water' }) },
  { name: 'noticias/escolas.svg', svg: motif({ width: 1200, height: 675, palette: { ...INSTITUTIONAL, accent: '#16537C' }, seed: 74, kind: 'bars' }) },
  { name: 'noticias/ambiente.svg', svg: motif({ width: 1200, height: 675, palette: { ...NATURE, accent: '#1F6F5C' }, seed: 85, kind: 'grid' }) },
  { name: 'noticias/social.svg', svg: motif({ width: 1200, height: 675, palette: { ...INSTITUTIONAL, accent: '#1D6FA3' }, seed: 96, kind: 'bars' }) },
  { name: 'eventos/musica.svg', svg: motif({ width: 900, height: 600, palette: { ...WARM, accent: '#8E1B26' }, seed: 107, kind: 'bars' }) },
  { name: 'eventos/feira.svg', svg: motif({ width: 900, height: 600, palette: { ...NATURE, accent: '#1F6F5C' }, seed: 118, kind: 'grid' }) },
  { name: 'eventos/exposicao.svg', svg: motif({ width: 900, height: 600, palette: { ...INSTITUTIONAL, accent: '#16537C' }, seed: 129, kind: 'grid' }) },
];

for (const file of files) {
  const target = join(OUT, file.name);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, file.svg, 'utf8');
  console.log(`✓ public/images/${file.name}`);
}

console.log(`\n${files.length} Platzhalter erzeugt.`);
