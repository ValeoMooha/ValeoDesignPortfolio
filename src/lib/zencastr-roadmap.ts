// The desktop Roadmap of the Zencastr case was three independent columns (texts left,
// one tall SVG with the icons in the middle, texts right) lined up with hard-coded
// margins. With a different font the texts drift away from the icons. This rebuilds
// it as one grid row per stage, so a stage's icon, numbers and list always sit together.

function blockEnd(h: string, start: number): number {
  const re = /<div\b|<\/div>/g;
  re.lastIndex = start;
  let depth = 0;
  for (let m = re.exec(h); m; m = re.exec(h)) {
    depth += m[0] === '</div>' ? -1 : 1;
    if (!depth) return re.lastIndex;
  }
  throw new Error('zencastr roadmap: unbalanced <div>');
}

const inner = (block: string) => block.slice(block.indexOf('>') + 1, block.length - '</div>'.length);

function childDivs(h: string): string[] {
  const out: string[] = [];
  for (let i = h.indexOf('<div'); i !== -1; i = h.indexOf('<div', i)) {
    const end = blockEnd(h, i);
    out.push(h.slice(i, end));
    i = end;
  }
  return out;
}

function column(raw: string, id: string): string[] {
  const start = raw.indexOf(`<div id="${id}"`);
  if (start === -1) throw new Error(`zencastr roadmap: #${id} not found`);
  return childDivs(inner(raw.slice(start, blockEnd(raw, start)))).map(inner);
}

export function fixZencastrRoadmap(raw: string): string {
  const start = raw.indexOf('<div id="brxe-xzqosp"');
  if (start === -1) return raw;
  const end = blockEnd(raw, start);

  const left = column(raw, 'brxe-rdfpql');
  const right = column(raw, 'brxe-dkptfp');

  // Stage icons come from the mobile roadmap (one 66px SVG each; the first is the flag).
  const mobile = raw.slice(raw.indexOf('<section id="brxe-shwvqj"'), start);
  const icons = [...mobile.matchAll(/roarmap-iconblock-mobile">(<svg.*?<\/svg>)/gs)].map((m) => m[1]);
  if (icons.length < left.length + 1 || left.length !== right.length) return raw;

  // The hidden mobile copies define the same gradient ids; keep ours unique.
  const unique = (svg: string, n: number) =>
    svg
      .replace(/ id="brxe-[a-z]+"/g, '')
      .replace(/(paint\d+_radial_\d+_\d+)/g, `$1_d${n}`);

  const article = (cell: string) =>
    cell.replace(/<(div|a) id="brxe-[a-z]+"( href="[^"]*" target="_blank")? class="brxe-block">/g, (_m, tag, attrs = '') =>
      `<${tag}${attrs} class="brxe-block zc-rm__art">`,
    );

  const rows = left
    .map(
      (l, i) => `<li class="zc-rm__row">
<div class="zc-rm__l">${article(l)}</div>
<div class="zc-rm__n" aria-hidden="true"><span class="zc-rm__node">${unique(icons[i + 1], i)}</span></div>
<div class="zc-rm__r">${right[i]}</div>
</li>`,
    )
    .join('\n');

  return `${raw.slice(0, start)}<div class="brxe-container zc-rm"><ol class="zc-rm__list">${rows}</ol></div>${raw.slice(end)}`;
}
