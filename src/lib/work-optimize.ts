// Swaps the original images/videos of a ported case study for the optimised files made by
// scripts/optimize-works.mjs (responsive WebP with srcset, silent compressed videos with a
// poster that only start loading near the screen, GIFs turned into looping videos).
type Img = { w: number; h: number; widths: number[] };
type Manifest = { images: Record<string, Img>; gifs?: Record<string, unknown>; videos: Record<string, unknown> };
type Size = { d?: number; m?: number };

const manifests = import.meta.glob<Manifest>('../data/works-opt/*.json', { eager: true, import: 'default' });
const measured = import.meta.glob<Record<string, Size>>('../data/works-sizes/*.json', { eager: true, import: 'default' });

const stem = (p: string) => p.replace(/\.[^.]+$/, '');

export function optimizeWork(raw: string, slug: string): string {
  const manifest = manifests[`../data/works-opt/${slug}.json`];
  if (!manifest) return raw;
  const sizes = measured[`../data/works-sizes/${slug}.json`] ?? {};
  const OPT = `%BASE%/works/${slug}-opt`;
  const SRC = `%BASE%/works/${slug}/`;

  const sizesAttr = (p: string) => {
    const s = sizes[p] ?? {};
    const d = s.d || s.m || 1042;
    const m = s.m || 336;
    return `(max-width: 767px) ${Math.min(100, Math.round((m / 390) * 100))}vw, min(${d}px, ${Math.round((d / 1440) * 100)}vw)`;
  };
  const attr = (tag: string, name: string) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];

  return raw
    .replace(/<img\b[^>]*?>/g, (tag) => {
      const src = attr(tag, 'src');
      if (!src?.startsWith(SRC)) return tag;
      const p = src.slice(SRC.length);
      if (p.endsWith('.gif') && manifest.gifs?.[p]) {
        // animated GIF -> looping silent video, started by the page script when it is near the screen
        const cls = attr(tag, 'class') ?? '';
        const w = attr(tag, 'width');
        const h = attr(tag, 'height');
        return `<video id="${attr(tag, 'id') ?? ''}" class="${cls}"${w ? ` width="${w}"` : ''}${h ? ` height="${h}"` : ''} data-src="${OPT}/${stem(p)}.mp4" poster="${OPT}/${stem(p)}-poster.webp" preload="none" muted loop playsinline aria-hidden="true"></video>`;
      }
      const a = manifest.images[p];
      if (!a) return tag;
      const srcset = a.widths.map((w) => `${OPT}/${stem(p)}-${w}.webp ${w}w`).join(', ');
      const fallback = a.widths.find((w) => w >= 1280) ?? a.widths.at(-1);
      return tag.replace(` src="${src}"`, ` src="${OPT}/${stem(p)}-${fallback}.webp" srcset="${srcset}" sizes="${sizesAttr(p)}"`);
    })
    .replace(/<video data-src="%BASE%\/works\/[^/]+\/([^"]+)\.(?:mp4|mov)"([^>]*)>/g, (whole, p: string, rest: string) => {
      if (!manifest.videos[`${p}.mp4`] && !manifest.videos[`${p}.mov`]) return whole;
      return `<video data-src="${OPT}/${p}.mp4" poster="${OPT}/${p}-poster.webp" preload="none"${rest.replace(/\s*preload="[^"]*"/, '')}>`;
    });
}
