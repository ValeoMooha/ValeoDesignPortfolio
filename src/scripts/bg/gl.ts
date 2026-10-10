// Small WebGL helpers shared by the background scenes.

export interface FrameState {
  time: number; // seconds since start
  dt: number; // seconds since last frame
  width: number; // canvas size in device pixels
  height: number;
  scroll: number; // page scroll in CSS px
  scrollProgress: number; // 0..1 over the whole page
  heroProgress: number; // 0..1 over the first screen
  mouse: [number, number]; // -1..1, smoothed
  color: [number, number, number]; // accent colour 0..1, smoothed
}

export interface Scene {
  // Render resolution relative to the screen (soft scenes can render smaller).
  scale?: number;
  frame(state: FrameState): void;
  dispose(): void;
}

export type SceneFactory = (gl: WebGL2RenderingContext, opts: { lite: boolean }) => Scene;

export function program(gl: WebGL2RenderingContext, vs: string, fs: string): WebGLProgram {
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(s) ?? 'shader compile failed');
    }
    return s;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, compile(gl.VERTEX_SHADER, vs));
  gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(p) ?? 'program link failed');
  }
  return p;
}

export function buffer(gl: WebGL2RenderingContext, data: Float32Array, loc: number, size: number) {
  const b = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
  return b;
}

// Deterministic random so every visit sees the same sky.
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
