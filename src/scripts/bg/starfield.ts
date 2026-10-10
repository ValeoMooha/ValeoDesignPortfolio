// A. Deep space: stars at different depths, slow flight forward on scroll,
// parallax from the cursor and a rare shooting star.
import { buffer, program, rng, type SceneFactory } from './gl';

const STAR_VS = /* glsl */ `#version 300 es
in vec3 aPos;      // x, y in -1..1, z = depth phase 0..1
in vec3 aMeta;     // size, twinkle phase, tint
uniform float uTime;
uniform float uTravel;
uniform vec2 uMouse;
uniform float uAspect;
uniform float uDpr;
out float vAlpha;
out float vTint;
void main() {
  float z = fract(aPos.z - uTravel);          // 0 = far, 1 = near
  float depth = mix(3.2, 0.25, z);
  vec2 p = aPos.xy * 1.6 / depth;
  p += uMouse * 0.04 / depth;                 // near stars move more
  p.x /= uAspect;
  gl_Position = vec4(p, 0.0, 1.0);
  float twinkle = 0.75 + 0.25 * sin(uTime * (1.0 + aMeta.y * 2.0) + aMeta.y * 40.0);
  vAlpha = smoothstep(0.0, 0.25, z) * smoothstep(1.0, 0.85, z) * twinkle;
  vTint = aMeta.z;
  gl_PointSize = aMeta.x * mix(0.8, 5.0, z * z) * uDpr;
}`;

const STAR_FS = /* glsl */ `#version 300 es
precision mediump float;
in float vAlpha;
in float vTint;
uniform vec3 uColor;
out vec4 o;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float core = smoothstep(0.5, 0.0, d);
  core = core * core + smoothstep(0.12, 0.0, d);   // soft halo + bright centre
  vec3 col = mix(vec3(0.85, 0.9, 1.0), vec3(1.0, 0.88, 0.75), vTint);
  col = mix(col, uColor, 0.15);
  o = vec4(col, core * vAlpha);
}`;

const TRAIL_VS = /* glsl */ `#version 300 es
in vec3 aTrail; // x, y in clip space, alpha
out float vA;
void main() { vA = aTrail.z; gl_Position = vec4(aTrail.xy, 0.0, 1.0); }`;

const TRAIL_FS = /* glsl */ `#version 300 es
precision mediump float;
in float vA;
out vec4 o;
void main() { o = vec4(1.0, 1.0, 1.0, vA * 0.8); }`;

export const createStarfield: SceneFactory = (gl, { lite }) => {
  const count = lite ? 2500 : 7000;
  const rand = rng(7);
  const pos = new Float32Array(count * 3);
  const meta = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = rand() * 2 - 1;
    pos[i * 3 + 1] = rand() * 2 - 1;
    pos[i * 3 + 2] = rand();
    meta[i * 3] = 0.6 + Math.pow(rand(), 3) * 2.2;
    meta[i * 3 + 1] = rand();
    meta[i * 3 + 2] = rand() < 0.2 ? 1 : 0;
  }

  const starProg = program(gl, STAR_VS, STAR_FS);
  const starVao = gl.createVertexArray()!;
  gl.bindVertexArray(starVao);
  buffer(gl, pos, gl.getAttribLocation(starProg, 'aPos'), 3);
  buffer(gl, meta, gl.getAttribLocation(starProg, 'aMeta'), 3);

  const trailProg = program(gl, TRAIL_VS, TRAIL_FS);
  const trailVao = gl.createVertexArray()!;
  gl.bindVertexArray(trailVao);
  const trailData = new Float32Array(6);
  const trailBuf = buffer(gl, trailData, gl.getAttribLocation(trailProg, 'aTrail'), 3);
  gl.bindVertexArray(null);

  const u = (name: string) => gl.getUniformLocation(starProg, name);
  const uTime = u('uTime'), uTravel = u('uTravel'), uMouse = u('uMouse');
  const uAspect = u('uAspect'), uDpr = u('uDpr'), uColor = u('uColor');

  let travel = 0;
  let lastScroll = 0;
  let nextShot = 4;
  let shot: { x: number; y: number; dx: number; dy: number; start: number } | null = null;

  return {
    frame(s) {
      // Constant slow drift, plus a push forward when the page scrolls.
      const scrollDelta = s.scroll - lastScroll;
      lastScroll = s.scroll;
      travel += s.dt * 0.012 + Math.max(-0.02, Math.min(0.02, scrollDelta * 0.00012));

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

      gl.useProgram(starProg);
      gl.bindVertexArray(starVao);
      gl.uniform1f(uTime, s.time);
      gl.uniform1f(uTravel, travel);
      gl.uniform2f(uMouse, s.mouse[0], s.mouse[1]);
      gl.uniform1f(uAspect, s.width / s.height);
      gl.uniform1f(uDpr, Math.min(devicePixelRatio, 2));
      gl.uniform3fv(uColor, s.color);
      gl.drawArrays(gl.POINTS, 0, count);

      // Shooting star every 6-14 seconds.
      if (!shot && s.time > nextShot) {
        const a = -0.35 - rand() * 0.5;
        shot = { x: rand() * 1.6 - 0.8, y: 0.3 + rand() * 0.6, dx: Math.cos(a), dy: Math.sin(a), start: s.time };
      }
      if (shot) {
        const k = (s.time - shot.start) / 0.9;
        if (k >= 1) {
          shot = null;
          nextShot = s.time + 6 + rand() * 8;
        } else {
          const head = 0.9 * k;
          const tail = Math.max(0, head - 0.35);
          const fade = Math.sin(k * Math.PI);
          trailData.set([
            shot.x + shot.dx * head, shot.y + shot.dy * head, fade,
            shot.x + shot.dx * tail, shot.y + shot.dy * tail, 0,
          ]);
          gl.useProgram(trailProg);
          gl.bindVertexArray(trailVao);
          gl.bindBuffer(gl.ARRAY_BUFFER, trailBuf);
          gl.bufferSubData(gl.ARRAY_BUFFER, 0, trailData);
          gl.drawArrays(gl.LINES, 0, 2);
        }
      }
      gl.bindVertexArray(null);
    },
    dispose() {
      gl.deleteProgram(starProg);
      gl.deleteProgram(trailProg);
    },
  };
};
