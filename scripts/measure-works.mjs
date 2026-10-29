// Measures how wide each image is displayed (desktop 1440 / phone 390) so the optimised pages can
// ship an accurate `sizes` attribute. Needs the dev server: npm run dev, then
//   node scripts/measure-works.mjs [slug ...]      -> src/data/works-sizes/<slug>.json
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

// playwright is not a project dependency; use whatever install is available
const { chromium } = createRequire(import.meta.url)('playwright');

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const base = process.env.BASE || 'http://localhost:4321';
const slugs = process.argv.length > 2 ? process.argv.slice(2) : readdirSync(join(root, 'src/data/works-opt')).map((f) => f.replace(/\.json$/, ''));
const browser = await chromium.launch();
mkdirSync(join(root, 'src/data/works-sizes'), { recursive: true });

for (const slug of slugs) {
  const manifest = JSON.parse(readFileSync(join(root, `src/data/works-opt/${slug}.json`), 'utf8'));
  const byStem = Object.fromEntries(Object.keys(manifest.images).map((k) => [k.replace(/\.[^.]+$/, ''), k]));
  const url = `${base}/works/${slug === 'zencastr' ? 'zencastr/v2' : slug}/`;
  const out = {};
  for (const [w, h, k] of [[1440, 900, 'd'], [390, 844, 'm']]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    const found = await page.evaluate(() => [...document.querySelectorAll('.zc img')].map((i) => [i.getAttribute('src'), i.getBoundingClientRect().width]));
    for (const [src, width] of found) {
      const m = src?.match(new RegExp(`works/${slug}-opt/(.+)-\\d+\\.webp$`));
      const key = m && byStem[m[1]];
      if (!key) continue;
      out[key] ??= {};
      out[key][k] = Math.max(out[key][k] || 0, Math.round(width));
    }
    await page.close();
  }
  writeFileSync(join(root, `src/data/works-sizes/${slug}.json`), JSON.stringify(out, null, 1));
  console.log(slug, Object.keys(out).length);
}
await browser.close();
