// Runs the animated page background and the colour light behind project cards.
import type { FrameState, Scene } from './gl';
import { createStarfield } from './starfield';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const lite = matchMedia('(max-width: 700px)').matches || (navigator.hardwareConcurrency ?? 8) <= 4;

/* ---------- Card colours (sampled once from each preview) ---------- */

const cardColor = new Map<HTMLElement, [number, number, number]>();

function sample(img: HTMLImageElement): [number, number, number] {
  const c = document.createElement('canvas');
  c.width = c.height = 8;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, 8, 8);
  const d = ctx.getImageData(0, 0, 8, 8).data;
  let r = 0, g = 0, b = 0;
  for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
  const n = d.length / 4;
  let rgb: [number, number, number] = [r / n / 255, g / n / 255, b / n / 255];
  // Push away from grey so the light reads as a colour.
  const avg = (rgb[0] + rgb[1] + rgb[2]) / 3;
  rgb = rgb.map((v) => Math.min(1, Math.max(0, avg + (v - avg) * 1.6))) as typeof rgb;
  return rgb;
}

function colorOf(card: HTMLElement) {
  if (!cardColor.has(card)) {
    const img = card.querySelector('img');
    if (img?.complete && img.naturalWidth) cardColor.set(card, sample(img));
  }
  return cardColor.get(card);
}

const cards = [...document.querySelectorAll<HTMLElement>('.card')];

/* ---------- D. Light behind the hovered card ---------- */

const glow = document.querySelector<HTMLElement>('.card-glow')!;
let hovered: HTMLElement | null = null;

function placeGlow() {
  if (!hovered) return;
  const r = hovered.getBoundingClientRect();
  glow.style.transform = `translate(${r.left + r.width / 2}px, ${r.top + r.height / 2}px)`;
  glow.style.width = `${r.width * 1.5}px`;
  glow.style.height = `${r.height * 1.5}px`;
}

if (matchMedia('(hover: hover)').matches) {
  for (const card of cards) {
    card.addEventListener('pointerenter', () => {
      const c = colorOf(card);
      if (!c) return;
      hovered = card;
      glow.style.setProperty('--glow', `rgb(${c.map((v) => Math.round(v * 255)).join(' ')})`);
      placeGlow();
      glow.classList.add('on');
    });
    card.addEventListener('pointerleave', () => {
      hovered = null;
      glow.classList.remove('on');
    });
  }
  addEventListener('scroll', placeGlow, { passive: true });
}

/* ---------- Animated background ---------- */

const host = document.querySelector<HTMLElement>('.bg')!;
let canvas: HTMLCanvasElement | null = null;
let gl: WebGL2RenderingContext | null = null;
let scene: Scene | null = null;
let raf = 0;

const state: FrameState = {
  time: 0, dt: 0, width: 1, height: 1,
  scroll: 0, scrollProgress: 0, heroProgress: 0,
  mouse: [0, 0], color: [0.55, 0.35, 0.95],
};
const target = { mouse: [0, 0] as [number, number], color: [0.55, 0.35, 0.95] as [number, number, number] };

addEventListener('pointermove', (e) => {
  target.mouse = [(e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1)];
}, { passive: true });

// Accent follows the card closest to the middle of the screen.
function updateAccent() {
  const mid = innerHeight / 2;
  let best: HTMLElement | null = null;
  let bestDist = Infinity;
  for (const card of cards) {
    const r = card.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) continue;
    const dist = Math.abs(r.top + r.height / 2 - mid);
    if (dist < bestDist) { bestDist = dist; best = card; }
  }
  const c = (hovered && colorOf(hovered)) || (best && colorOf(best));
  if (c && scrollY > innerHeight * 0.3) target.color = c;
  else target.color = [0.55, 0.35, 0.95];
}

function resize() {
  if (!canvas || !scene) return;
  const scale = Math.min(devicePixelRatio, lite ? 1.25 : 1.5) * (scene.scale ?? 1);
  canvas.width = Math.round(innerWidth * scale);
  canvas.height = Math.round(innerHeight * scale);
  state.width = canvas.width;
  state.height = canvas.height;
}

// Stars fade in on load and fade out over the first screen of scrolling,
// leaving plain black behind the rest of the page.
function visibility(time: number) {
  const intro = reducedMotion ? 1 : 1 - Math.pow(1 - Math.min(time / 1.6, 1), 3);
  const k = Math.min(scrollY / innerHeight, 1);
  const fade = 1 - k * k * (3 - 2 * k);
  return intro * fade;
}

let start = 0;
let last = 0;
function tick(now: number) {
  if (!gl || !scene) return;
  if (!start) start = last = now;
  state.dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  state.time = reducedMotion ? 3 : (now - start) / 1000;

  state.scroll = scrollY;
  const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  state.scrollProgress = scrollY / max;
  state.heroProgress = Math.min(1, scrollY / (innerHeight * 0.9));

  updateAccent();
  const ease = 1 - Math.pow(0.001, state.dt);       // frame-rate independent smoothing
  state.mouse[0] += (target.mouse[0] - state.mouse[0]) * ease;
  state.mouse[1] += (target.mouse[1] - state.mouse[1]) * ease;
  const cEase = 1 - Math.pow(0.15, state.dt);
  for (let i = 0; i < 3; i++) state.color[i] += (target.color[i] - state.color[i]) * cEase;

  const opacity = visibility(state.time);
  host.style.opacity = opacity.toFixed(3);
  // Nothing to draw once the stars are gone; keep the loop alive to fade back in.
  if (opacity > 0.001) {
    gl.viewport(0, 0, state.width, state.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    scene.frame(state);
  }

  if (!reducedMotion) raf = requestAnimationFrame(tick);
}

export function startBackground() {
  cancelAnimationFrame(raf);
  scene?.dispose();
  canvas?.remove();
  canvas = document.createElement('canvas');
  host.appendChild(canvas);
  gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  if (!gl) { host.classList.add('off'); return; }
  try {
    scene = createStarfield(gl, { lite });
  } catch (err) {
    console.error(err);
    host.classList.add('off');
    return;
  }
  start = 0;
  resize();
  raf = requestAnimationFrame(tick);
}

addEventListener('resize', resize);
if (reducedMotion) addEventListener('scroll', () => { host.style.opacity = visibility(3).toFixed(3); }, { passive: true });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) cancelAnimationFrame(raf);
  else if (!reducedMotion && scene) { last = performance.now(); raf = requestAnimationFrame(tick); }
});

// Dev-only hooks for checking frames in a hidden browser tab.
if (import.meta.env.DEV) Object.assign(window, { __bg: state, __bgTick: tick });
