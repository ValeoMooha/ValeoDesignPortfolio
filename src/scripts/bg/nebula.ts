// B. Living nebula: slow domain-warped clouds over a faint star field.
// The cloud colour follows the project card nearest the middle of the screen.
import { program, type SceneFactory } from './gl';

const VS = /* glsl */ `#version 300 es
const vec2 P[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
out vec2 vUv;
void main() {
  vec2 p = P[gl_VertexID];
  vUv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}`;

const FS = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uScroll;
uniform vec3 uColor;
out vec4 o;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = r * p * 2.03; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  uv += uMouse * 0.03;
  uv.y += uScroll * 0.00015;   // clouds drift up slowly as the page scrolls
  float t = uTime * 0.03;

  // Domain warping gives the soft, folded gas look.
  vec2 q = vec2(fbm(uv * 1.4 + t), fbm(uv * 1.4 - t + 5.2));
  vec2 r = vec2(fbm(uv * 1.8 + 3.0 * q + vec2(1.7, 9.2) + t * 1.5),
                fbm(uv * 1.8 + 3.0 * q + vec2(8.3, 2.8) - t));
  float n = fbm(uv * 1.6 + 3.5 * r);

  vec3 deep = vec3(0.04, 0.03, 0.12);
  vec3 violet = vec3(0.35, 0.18, 0.65);
  vec3 teal = vec3(0.05, 0.45, 0.6);
  vec3 col = mix(deep, violet, smoothstep(0.35, 0.9, n));
  col = mix(col, teal, smoothstep(0.55, 0.95, r.x) * 0.6);
  col = mix(col, uColor, smoothstep(0.45, 1.0, length(q)) * 0.75);
  col += uColor * pow(max(n - 0.55, 0.0), 2.0) * 2.0;   // bright filaments

  // Keep it dark enough for the content on top.
  float vignette = smoothstep(1.25, 0.2, length(uv * vec2(0.8, 1.0)));
  col *= 0.8 * vignette * smoothstep(0.15, 0.75, n);

  // Faint stars.
  vec2 g = gl_FragCoord.xy / 6.0;
  float s = hash(floor(g));
  float pt = smoothstep(0.35, 0.0, length(fract(g) - 0.5));
  float star = step(0.985, s) * pt * (0.6 + 0.4 * sin(uTime * 2.0 + s * 100.0));
  col += vec3(star) * 0.8;

  o = vec4(col, 1.0);
}`;

export const createNebula: SceneFactory = (gl) => {
  const prog = program(gl, VS, FS);
  const vao = gl.createVertexArray()!;
  const u = (n: string) => gl.getUniformLocation(prog, n);
  const uTime = u('uTime'), uRes = u('uRes'), uMouse = u('uMouse');
  const uScroll = u('uScroll'), uColor = u('uColor');

  return {
    scale: 0.5,
    frame(s) {
      gl.disable(gl.BLEND);
      gl.useProgram(prog);
      gl.bindVertexArray(vao);
      gl.uniform1f(uTime, s.time);
      gl.uniform2f(uRes, s.width, s.height);
      gl.uniform2f(uMouse, s.mouse[0], s.mouse[1]);
      gl.uniform1f(uScroll, s.scroll);
      gl.uniform3fv(uColor, s.color);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      gl.deleteProgram(prog);
    },
  };
};
