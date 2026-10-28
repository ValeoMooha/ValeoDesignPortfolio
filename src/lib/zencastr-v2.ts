// Zencastr v2: swaps the original JPG/MP4 files for the optimised ones made by
// scripts/optimize-zencastr.mjs (responsive WebP with srcset, compressed silent videos
// with a poster that only start loading when they come near the screen).
import assets from '../data/zencastr-assets.json';
import measured from '../data/zencastr-sizes.json';

type Size = { d?: number; m?: number };
const sizes = measured as Record<string, Size>;
const imgs = assets.images as Record<string, { w: number; h: number; widths: number[] }>;

const stem = (p: string) => p.replace(/\.[^.]+$/, '');
const OPT = '%BASE%/works/zencastr-opt';

function sizesAttr(p: string): string {
  const s = sizes[p] ?? {};
  const d = s.d || s.m || 1042;
  const m = s.m || 336;
  return `(max-width: 767px) ${Math.min(100, Math.round((m / 390) * 100))}vw, min(${d}px, ${Math.round((d / 1440) * 100)}vw)`;
}

export function optimizeZencastr(raw: string): string {
  return raw
    .replace(/<img([^>]*?) src="%BASE%\/works\/zencastr\/([^"]+\.jpg)"/g, (whole, before: string, p: string) => {
      const a = imgs[p];
      if (!a) return whole;
      const srcset = a.widths.map((w) => `${OPT}/${stem(p)}-${w}.webp ${w}w`).join(', ');
      const fallback = a.widths.filter((w) => w >= 1280)[0] ?? a.widths.at(-1);
      return `<img${before} src="${OPT}/${stem(p)}-${fallback}.webp" srcset="${srcset}" sizes="${sizesAttr(p)}"`;
    })
    .replace(/<video data-src="%BASE%\/works\/zencastr\/([^"]+)\.(?:mp4|mov)"([^>]*)>/g, (_m, p: string, rest: string) => {
      const attrs = rest.replace(/\s*preload="[^"]*"/, '');
      return `<video data-src="${OPT}/${p}.mp4" poster="${OPT}/${p}-poster.webp" preload="none"${attrs}>`;
    });
}
