/**
 * Gera ícones PWA a partir do mark "C" (ApertureC) da Codratec.
 * Uso: node scripts/generate-pwa-icons.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outDir = join(root, 'public', 'icons');

const BG = '#0f172a';
const FG = '#ffffff';

/** Paths do ApertureC (viewBox 0 0 80 80) */
const APERTURE_PATHS = [
  'M70.53 59.08 L59.17 70.47 L50.92 57.35 L57.38 50.86 Z',
  'M56.89 71.79 L41.36 75.97 L40.77 60.49 L49.62 58.10 Z',
  'M38.72 75.98 L23.18 71.83 L30.42 58.12 L39.27 60.49 Z',
  'M20.89 70.51 L9.51 59.14 L22.64 50.90 L29.12 57.37 Z',
  'M8.19 56.86 L4.02 41.32 L19.51 40.75 L21.89 49.60 Z',
  'M4.02 38.68 L8.19 23.14 L21.89 30.40 L19.51 39.25 Z',
  'M9.51 20.86 L20.89 9.49 L29.12 22.63 L22.64 29.10 Z',
  'M23.18 8.17 L38.72 4.02 L39.27 19.51 L30.42 21.88 Z',
  'M41.36 4.03 L56.89 8.21 L49.62 21.90 L40.77 19.51 Z',
  'M59.17 9.53 L70.53 20.92 L57.38 29.14 L50.92 22.65 Z',
];

function markSvg({ size, padding = 0, bg = BG, fg = FG, rounded = false }) {
  const scale = (size - padding * 2) / 80;
  const tx = padding;
  const ty = padding;
  const radius = rounded ? size * 0.22 : 0;
  const paths = APERTURE_PATHS.map((d) => `<path d="${d}"/>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="${bg}"/>
  <g transform="translate(${tx} ${ty}) scale(${scale})" fill="${fg}">
    ${paths}
  </g>
</svg>`;
}

async function main() {
  mkdirSync(outDir, { recursive: true });

  const require = createRequire(import.meta.url);
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.error('Instale sharp temporariamente: npm i -D sharp');
    process.exit(1);
  }

  const assets = [
    { name: 'icon-192.png', size: 192, padding: 28 },
    { name: 'icon-512.png', size: 512, padding: 72 },
    { name: 'icon-512-maskable.png', size: 512, padding: 102 },
    { name: 'apple-touch-icon.png', size: 180, padding: 26 },
    { name: 'favicon-32.png', size: 32, padding: 4 },
    { name: 'favicon-16.png', size: 16, padding: 2 },
  ];

  for (const asset of assets) {
    const svg = markSvg(asset);
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    writeFileSync(join(outDir, asset.name), png);
    console.log('ok', asset.name);
  }

  // SVG fonte (útil para edits futuros)
  writeFileSync(join(outDir, 'icon.svg'), markSvg({ size: 512, padding: 72 }));

  // favicon.ico simples (usa 32px como ICO-like PNG fallback via cópia)
  const fav32 = await sharp(Buffer.from(markSvg({ size: 32, padding: 4 }))).png().toBuffer();
  writeFileSync(join(root, 'public', 'favicon-32x32.png'), fav32);
  writeFileSync(join(root, 'public', 'apple-touch-icon.png'), await sharp(Buffer.from(markSvg({ size: 180, padding: 26 }))).png().toBuffer());

  console.log('Ícones PWA gerados em public/icons');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
