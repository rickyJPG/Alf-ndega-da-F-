#!/usr/bin/env node
/**
 * Descarrega as três famílias tipográficas em woff2 para public/fonts e
 * guarda-as no próprio servidor — em execução não se carrega nada da Google.
 *
 *   npm run fonts
 *
 * Os ficheiros estão versionados no repositório; este script só é preciso
 * para atualizar uma fonte. Se faltarem, entra a pilha de recurso definida em
 * src/styles/fonts.css — o portal continua legível.
 */
import { mkdir, writeFile, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'fonts');

/** Maximal drei Schriftschnitte pro Familie – siehe Performance-Budget. */
const FAMILIES = [
  { css: 'Source+Serif+4:opsz,wght@8..60,600', file: 'source-serif-4-600' },
  { css: 'Inter:wght@400', file: 'inter-400' },
  { css: 'Inter:wght@600', file: 'inter-600' },
  { css: 'Atkinson+Hyperlegible:wght@400', file: 'atkinson-400' },
  { css: 'Atkinson+Hyperlegible:wght@700', file: 'atkinson-700' },
];

/** Apenas conjuntos latinos — o pt-PT precisa de latin e latin-ext. */
const WANTED_SUBSETS = ['latin', 'latin-ext'];

const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} – ${url}`);
  return res.text();
}

async function main() {
  await mkdir(OUT, { recursive: true });

  for (const family of FAMILIES) {
    const url = `https://fonts.googleapis.com/css2?family=${family.css}&display=swap`;
    const css = await fetchText(url);

    // A Google devolve os blocos agrupados por subconjunto, com comentários /* latin */.
    const blocks = css.split('/*').slice(1);
    for (const block of blocks) {
      const subset = block.slice(0, block.indexOf('*/')).trim();
      if (!WANTED_SUBSETS.includes(subset)) continue;

      const match = block.match(/src:\s*url\((https:[^)]+\.woff2)\)/);
      if (!match) continue;

      const target = join(OUT, `${family.file}-${subset}.woff2`);
      const res = await fetch(match[1], { headers: { 'User-Agent': UA } });
      if (!res.ok) throw new Error(`${res.status} ao carregar ${match[1]}`);
      await writeFile(target, Buffer.from(await res.arrayBuffer()));
      const { size } = await stat(target);
      console.log(`✓ ${family.file}-${subset}.woff2  (${(size / 1024).toFixed(1)} kB)`);
    }
  }

  console.log('\nFertig. Die @font-face-Regeln stehen in src/styles/fonts.css.');
}

main().catch((error) => {
  console.error('\nNão foi possível carregar as fontes:', error.message);
  console.error('O portal passa a usar a pilha de recurso do sistema definida em fonts.css.');
  process.exitCode = 1;
});
