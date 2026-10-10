// C. Particle galaxy: particles gather into a spiral galaxy behind the title,
// the cursor pushes and twists it, and scrolling scatters it into a star field.
import { buffer, program, rng, type SceneFactory } from './gl';

const VS = /* glsl */ `#version 300 es
in vec4 aGal;      // radius, angle, jitter x, jitter y
in vec3 aScatter;  // scattered position x, y and twinkle phase
in vec2 aMeta;     // size, colour mix
uniform float uTime;
uniform float uForm;     // 0 = scattered, 1 = galaxy
uniform vec2 uMouse;
uniform float uAspect;
uniform float uDpr;
out vec3 vColor;
out float vAlpha;

void main() {
  float r = aGal.x;
  // Inner stars orbit faster than outer ones.
  float theta = aGal.y + uTime * 0.05 / (r + 0.25) + uMouse.x * 0.25 * (1.0 - r);
  vec2 g = vec2(cos(theta), sin(theta)) * r + aGal.zw;
  g.y *= 0.5;                                          // view the disc at an angle
  float tilt = -0.32;
  g = mat2(cos(tilt), sin(tilt), -sin(tilt), cos(tilt)) * g;
  g *= 1.2;
  g.y += 0.28;                                         // sit behind the title

  vec2 s = aScatter.xy;
  float k = smoothstep(0.0, 1.0, clamp(uForm * 1.15 - (aScatter.z * 0.15), 0.0, 1.0));
  k *= step(0.1, aScatter.z);                          // 10% stay behind as field stars
  vec2 p = mix(s, g, k);

  // Cursor pushes nearby particles away.
  vec2 m = vec2(uMouse.x * uAspect, uMouse.y);
  vec2 d = p - m;
  float dist = length(d);
  p += normalize(d + 1e-5) * smoothstep(0.35, 0.0, dist) * 0.08;

  p.x /= uAspect;
  gl_Position = vec4(p, 0.0, 1.0);

  vec3 core = vec3(1.0, 0.82, 0.62);
  vec3 arm = vec3(0.45, 0.55, 1.0);
  vec3 pink = vec3(1.0, 0.45, 0.8);
  vec3 c = mix(core, arm, smoothstep(0.05, 0.45, r));
  c = mix(c, pink, aMeta.y * smoothstep(0.2, 0.7, r));
  vColor = mix(vec3(0.85, 0.9, 1.0), c, k);

  float twinkle = 0.7 + 0.3 * sin(uTime * 1.5 + aScatter.z * 60.0);
  // Dim the very centre so the title on top stays readable.
  vAlpha = mix(0.55 * twinkle, 0.9 * (1.0 - r * 0.4) * mix(0.15, 1.0, smoothstep(0.0, 0.3, r)), k);
  gl_PointSize = aMeta.x * mix(1.0, 1.0 + 1.5 * (1.0 - r), k) * uDpr;
}`;

const FS = /* glsl */ `#version 300 es
precision mediump float;
in vec3 vColor;
in float vAlpha;
out vec4 o;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  o = vec4(vColor, a * a * vAlpha * 0.55);
}`;

export const createGalaxy: SceneFactory = (gl, { lite }) => {
  const count = lite ? 18000 : 60000;
  const rand = rng(42);
  const gauss = () => (rand() + rand() + rand() - 1.5) / 1.5;
  const gal = new Float32Array(count * 4);
  const scatter = new Float32Array(count * 3);
  const meta = new Float32Array(count * 2);
  const arms = 3;

  for (let i = 0; i < count; i++) {
    const kind = rand();
    let r: number, theta: number, jitter: number;
    if (kind < 0.18) {
      // Bright core bulge
      r = Math.abs(gauss()) * 0.12;
      theta = rand() * Math.PI * 2;
      jitter = 0.03;
    } else {
      // Spiral arms with gas spread around them
      r = 0.08 + Math.pow(rand(), 1.1) * 0.92;
      const arm = (Math.floor(rand() * arms) / arms) * Math.PI * 2;
      theta = arm + r * 4.6 + gauss() * (0.25 + r * 0.3);
      jitter = 0.05 + r * 0.07;
    }
    gal[i * 4] = r;
    gal[i * 4 + 1] = theta;
    gal[i * 4 + 2] = gauss() * jitter;
    gal[i * 4 + 3] = gauss() * jitter;
    scatter[i * 3] = (rand() * 2 - 1) * 2.0;
    scatter[i * 3 + 1] = (rand() * 2 - 1) * 1.15;
    scatter[i * 3 + 2] = rand();
    meta[i * 2] = 1 + Math.pow(rand(), 4) * 3;
    meta[i * 2 + 1] = rand() < 0.18 ? 1 : 0;
  }

  const prog = program(gl, VS, FS);
  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);
  buffer(gl, gal, gl.getAttribLocation(prog, 'aGal'), 4);
  buffer(gl, scatter, gl.getAttribLocation(prog, 'aScatter'), 3);
  buffer(gl, meta, gl.getAttribLocation(prog, 'aMeta'), 2);
  gl.bindVertexArray(null);

  const u = (n: string) => gl.getUniformLocation(prog, n);
  const uTime = u('uTime'), uForm = u('uForm'), uMouse = u('uMouse');
  const uAspect = u('uAspect'), uDpr = u('uDpr');

  return {
    frame(s) {
      // Gather over the first 2.5 s, then come apart as the first screen scrolls away.
      const intro = 1 - Math.pow(1 - Math.min(s.time / 2.5, 1), 3);
      const form = intro * (1 - s.heroProgress);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.useProgram(prog);
      gl.bindVertexArray(vao);
      gl.uniform1f(uTime, s.time);
      gl.uniform1f(uForm, form);
      gl.uniform2f(uMouse, s.mouse[0], s.mouse[1]);
      gl.uniform1f(uAspect, s.width / s.height);
      gl.uniform1f(uDpr, Math.min(devicePixelRatio, 2));
      gl.drawArrays(gl.POINTS, 0, count);
      gl.bindVertexArray(null);
    },
    dispose() {
      gl.deleteProgram(prog);
    },
  };
};
