#!/usr/bin/env node
/**
 * Lädt die drei Schriftfamilien als woff2 nach public/fonts und legt sie
 * selbst gehostet ab – es wird zur Laufzeit nichts von Google geladen.
 *
 *   npm run fonts
 *
 * Die Dateien sind im Repository eingecheckt; das Skript wird nur gebraucht,
 * wenn eine Schrift aktualisiert werden soll. Fehlen die Dateien, greift der
 * Fallback-Stack aus src/styles/fonts.css – die Seite bleibt benutzbar.
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

/** Nur lateinische Zeichensätze – pt-PT braucht latin + latin-ext. */
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

    // Google liefert die Blöcke nach Subset gruppiert, mit /* latin */-Kommentaren.
    const blocks = css.split('/*').slice(1);
    for (const block of blocks) {
      const subset = block.slice(0, block.indexOf('*/')).trim();
      if (!WANTED_SUBSETS.includes(subset)) continue;

      const match = block.match(/src:\s*url\((https:[^)]+\.woff2)\)/);
      if (!match) continue;

      const target = join(OUT, `${family.file}-${subset}.woff2`);
      const res = await fetch(match[1], { headers: { 'User-Agent': UA } });
      if (!res.ok) throw new Error(`${res.status} beim Laden von ${match[1]}`);
      await writeFile(target, Buffer.from(await res.arrayBuffer()));
      const { size } = await stat(target);
      console.log(`✓ ${family.file}-${subset}.woff2  (${(size / 1024).toFixed(1)} kB)`);
    }
  }

  console.log('\nFertig. Die @font-face-Regeln stehen in src/styles/fonts.css.');
}

main().catch((error) => {
  console.error('\nSchriften konnten nicht geladen werden:', error.message);
  console.error('Die Seite nutzt dann den System-Fallback-Stack aus fonts.css.');
  process.exitCode = 1;
});
