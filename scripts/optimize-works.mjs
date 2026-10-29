// Optimised assets for the case studies (all except zencastr, see optimize-zencastr.mjs):
//  - responsive WebP versions of every image in public/works/<slug>-opt/ (full-size originals are
//    fetched from mvaleo.com when the local file is a WordPress thumbnail like "-1024x768")
//  - GIF animations -> silent looping MP4 + WebP poster
//  - videos re-encoded (silent, faststart) + WebP poster
// and writes src/data/works-opt/<slug>.json (what exists, natural sizes).
// Run: node scripts/optimize-works.mjs [slug ...]   (needs ffmpeg and curl; safe to re-run)
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync, rmSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = process.env.WORKS_CACHE || join(tmpdir(), 'works-orig');
const all = readdirSync(join(root, 'src/content/works')).map((f) => f.replace(/\.html$/, '')).filter((s) => s !== 'zencastr');
const slugs = process.argv.length > 2 ? process.argv.slice(2) : all;

const stem = (p) => p.replace(/\.[^.]+$/, '');
const fresh = (out, src) => existsSync(out) && statSync(out).mtimeMs >= statSync(src).mtimeMs;
const WIDTHS = [640, 1280, 1920, 2560];

function original(slug, p, local) {
  // WordPress thumbnails: name-1024x768.jpg / name-scaled.jpg -> name.jpg on the live site
  const m = p.match(/^(.*?)-(?:\d+x\d+|scaled)(\.[a-z]+)$/i);
  if (!m) return local;
  const dest = join(CACHE, slug, `${m[1]}${m[2]}`);
  if (!existsSync(dest)) {
    mkdirSync(dirname(dest), { recursive: true });
    try {
      execFileSync('curl', ['-sfL', '-m', '90', '-o', dest, `https://mvaleo.com/wp-content/uploads/${m[1]}${m[2]}`]);
    } catch {
      rmSync(dest, { force: true });
      return local;
    }
  }
  return dest;
}

for (const slug of slugs) {
  const html = readFileSync(join(root, `src/content/works/${slug}.html`), 'utf8');
  const SRC = join(root, 'public/works', slug);
  const OUT = join(root, 'public/works', `${slug}-opt`);
  const rel = (m) => m.replace(new RegExp(`^.*works/${slug}/`), '');
  const manifest = { images: {}, gifs: {}, videos: {} };

  const imgs = new Set([...html.matchAll(/<img[^>]*?src="([^"]+\.(?:jpe?g|png|webp))"/g)].map((m) => rel(m[1])));
  const gifs = new Set([...html.matchAll(/<img[^>]*?src="([^"]+\.gif)"/g)].map((m) => rel(m[1])));
  const videos = new Set([...html.matchAll(/data-src="([^"]+\.(?:mp4|mov))"/g)].map((m) => rel(m[1])));

  for (const p of imgs) {
    const local = join(SRC, p);
    let src = original(slug, p, local);
    const lm = await sharp(local).metadata();
    let meta = await sharp(src).metadata();
    // use the live-site original only when it is bigger and has the same proportions
    if (src !== local && Math.abs(meta.width / meta.height - lm.width / lm.height) > 0.02) [src, meta] = [local, lm];
    const widths = [...new Set(WIDTHS.filter((w) => w < meta.width).concat(meta.width <= WIDTHS.at(-1) ? [meta.width] : []))].sort((a, b) => a - b);
    if (!widths.length) widths.push(WIDTHS.at(-1));
    for (const w of widths) {
      const out = join(OUT, `${stem(p)}-${w}.webp`);
      if (fresh(out, src)) continue;
      mkdirSync(dirname(out), { recursive: true });
      await sharp(src).resize({ width: w, withoutEnlargement: true }).webp({ quality: 82, effort: 5 }).toFile(out);
    }
    manifest.images[p] = { w: meta.width, h: meta.height, widths };
  }

  const encode = async (p, src, bag) => {
    const out = join(OUT, `${stem(p)}.mp4`);
    const poster = join(OUT, `${stem(p)}-poster.webp`);
    mkdirSync(dirname(out), { recursive: true });
    if (!fresh(out, src)) {
      execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', src, '-an', '-vf', "scale='min(1600,iw)':-2,format=yuv420p",
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '28', '-movflags', '+faststart', out]);
    }
    if (!fresh(poster, src)) {
      const tmp = join(OUT, `${stem(p)}-poster.png`);
      execFileSync('ffmpeg', ['-y', '-v', 'error', '-ss', '0.5', '-i', src, '-frames:v', '1', '-vf', "scale='min(1280,iw)':-2", tmp]);
      await sharp(tmp).webp({ quality: 78 }).toFile(poster);
      rmSync(tmp);
    }
    const meta = await sharp(poster).metadata();
    bag[p] = { w: meta.width, h: meta.height };
  };
  for (const p of gifs) await encode(p, join(SRC, p), manifest.gifs);
  for (const p of videos) await encode(p, join(SRC, p), manifest.videos);

  mkdirSync(join(root, 'src/data/works-opt'), { recursive: true });
  writeFileSync(join(root, `src/data/works-opt/${slug}.json`), JSON.stringify(manifest, null, 1));
  console.log(slug, Object.keys(manifest.images).length, 'images', gifs.size, 'gifs', videos.size, 'videos');
}
