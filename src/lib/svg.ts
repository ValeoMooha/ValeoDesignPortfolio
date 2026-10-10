/**
 * Prepare an inline SVG for CSS animation: every direct child of the root
 * <svg> gets `--i` (its index) and `--n` (child count) so styles can stagger
 * and vary the motion per shape.
 */
export function indexShapes(svg: string): string {
  const tag = /<(\/?)([a-zA-Z][\w:-]*)([^>]*?)(\/?)>/g;
  let depth = 0;
  let index = 0;
  const marks: { at: number; i: number }[] = [];
  for (let m = tag.exec(svg); m; m = tag.exec(svg)) {
    const [, close, name, , self] = m;
    if (close) { depth--; continue; }
    if (depth === 1 && name !== 'defs') marks.push({ at: m.index + 1 + name.length, i: index++ });
    if (!self) depth++;
  }
  let out = svg;
  for (const { at, i } of marks.reverse()) {
    out = `${out.slice(0, at)} style="--i:${i};--n:${index}"${out.slice(at)}`;
  }
  return out;
}
