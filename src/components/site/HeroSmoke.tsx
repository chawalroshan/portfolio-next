'use client';

import { useEffect, useRef } from 'react';

/**
 * HeroSmoke — one8-style GPU fluid smoke for the hero.
 *
 * A faithful port of the stable-fluid solver behind one8.com's banner smoke
 * (archived 2021-12-28): velocity/dye advection, vorticity confinement,
 * divergence + Jacobi pressure solve, gradient subtract — with dye splats
 * injected wherever the pointer moves, so the smoke curls and billows around
 * the cursor instead of following it like a sticker.
 *
 * Adaptations for this hero (no visual-identity changes to the smoke itself):
 * - Transparent canvas over the 3D scene, below the copy (parent stacks it
 *   at z-index 0 vs content 1); dye renders as soft gray wisps like one8.
 * - Gray dye (#5d5d5d, same as the reference) reads on light and dark themes.
 * - No preventDefault on touch — page scroll keeps working.
 * - Pauses off-screen / when the tab hides; full cleanup on unmount.
 * - Never mounted when prefers-reduced-motion (parent renders StaticBackdrop
 *   instead) — same rule as HeroScene.
 */

type GL = WebGLRenderingContext | WebGL2RenderingContext;

const CONFIG = {
  TEXTURE_DOWNSAMPLE: 1,
  DENSITY_DISSIPATION: 0.975,
  VELOCITY_DISSIPATION: 0.99,
  PRESSURE_DISSIPATION: 0.8,
  PRESSURE_ITERATIONS: 20,
  CURL: 28,
  SPLAT_RADIUS: 0.007,
  /** Grayish sky-blue dye (one8's was neutral gray #5d5d5d). */
  SMOKE_RGB: [0.44, 0.6, 0.74] as [number, number, number],
  /** Dye deposited per splat. */
  DENSITY_SCALE: 0.6,
  /** Pointer-velocity → force gain (reference used 10). */
  FORCE: 8,
};

const BASE_VERTEX = `precision highp float;
attribute vec2 aPosition;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform vec2 texelSize;
void main () {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const CLEAR_FRAG = `precision highp float;
precision mediump sampler2D;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;
void main () {
  gl_FragColor = value * texture2D(uTexture, vUv);
}`;

const SPLAT_FRAG = `precision highp float;
precision mediump sampler2D;
varying vec2 vUv;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
void main () {
  vec2 p = vUv - point.xy;
  p.x *= aspectRatio;
  vec3 splat = exp(-dot(p, p) / radius) * color;
  vec3 base = texture2D(uTarget, vUv).xyz;
  gl_FragColor = vec4(base + splat, 1.0);
}`;

const ADVECTION_FRAG = `precision highp float;
precision mediump sampler2D;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;
vec4 bilerp (in sampler2D sam, in vec2 p) {
  vec4 st;
  st.xy = floor(p - 0.5) + 0.5;
  st.zw = st.xy + 1.0;
  vec4 uv = st * texelSize.xyxy;
  vec4 a = texture2D(sam, uv.xy);
  vec4 b = texture2D(sam, uv.zy);
  vec4 c = texture2D(sam, uv.xw);
  vec4 d = texture2D(sam, uv.zw);
  vec2 f = p - st.xy;
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
void main () {
  vec2 coord = gl_FragCoord.xy - dt * texture2D(uVelocity, vUv).xy;
  gl_FragColor = dissipation * bilerp(uSource, coord);
  gl_FragColor.a = 1.0;
}`;

const DIVERGENCE_FRAG = `precision highp float;
precision mediump sampler2D;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;
vec2 sampleVelocity (in vec2 uv) {
  vec2 multiplier = vec2(1.0, 1.0);
  if (uv.x < 0.0) { uv.x = 0.0; multiplier.x = -1.0; }
  if (uv.x > 1.0) { uv.x = 1.0; multiplier.x = -1.0; }
  if (uv.y < 0.0) { uv.y = 0.0; multiplier.y = -1.0; }
  if (uv.y > 1.0) { uv.y = 1.0; multiplier.y = -1.0; }
  return multiplier * texture2D(uVelocity, uv).xy;
}
void main () {
  float L = sampleVelocity(vL).x;
  float R = sampleVelocity(vR).x;
  float T = sampleVelocity(vT).y;
  float B = sampleVelocity(vB).y;
  float div = 0.5 * (R - L + T - B);
  gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}`;

const CURL_FRAG = `precision highp float;
precision mediump sampler2D;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uVelocity, vL).y;
  float R = texture2D(uVelocity, vR).y;
  float T = texture2D(uVelocity, vT).x;
  float B = texture2D(uVelocity, vB).x;
  float vorticity = R - L - T + B;
  gl_FragColor = vec4(vorticity, 0.0, 0.0, 1.0);
}`;

const VORTICITY_FRAG = `precision highp float;
precision mediump sampler2D;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curl;
uniform float dt;
void main () {
  float L = texture2D(uCurl, vL).y;
  float R = texture2D(uCurl, vR).y;
  float T = texture2D(uCurl, vT).x;
  float B = texture2D(uCurl, vB).x;
  float C = texture2D(uCurl, vUv).x;
  vec2 force = vec2(abs(T) - abs(B), abs(R) - abs(L));
  force *= 1.0 / length(force + 0.00001) * curl * C;
  vec2 vel = texture2D(uVelocity, vUv).xy;
  gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
}`;

const PRESSURE_FRAG = `precision highp float;
precision mediump sampler2D;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
vec2 boundary (in vec2 uv) {
  uv = min(max(uv, 0.0), 1.0);
  return uv;
}
void main () {
  float L = texture2D(uPressure, boundary(vL)).x;
  float R = texture2D(uPressure, boundary(vR)).x;
  float T = texture2D(uPressure, boundary(vT)).x;
  float B = texture2D(uPressure, boundary(vB)).x;
  float C = texture2D(uPressure, vUv).x;
  float divergence = texture2D(uDivergence, vUv).x;
  float pressure = (L + R + B + T - divergence) * 0.25;
  gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
}`;

const GRADIENT_SUBTRACT_FRAG = `precision highp float;
precision mediump sampler2D;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
vec2 boundary (in vec2 uv) {
  uv = min(max(uv, 0.0), 1.0);
  return uv;
}
void main () {
  float L = texture2D(uPressure, boundary(vL)).x;
  float R = texture2D(uPressure, boundary(vR)).x;
  float T = texture2D(uPressure, boundary(vT)).x;
  float B = texture2D(uPressure, boundary(vB)).x;
  vec2 velocity = texture2D(uVelocity, vUv).xy;
  velocity.xy -= vec2(R - L, T - B);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}`;

declare global {
  interface Window {
    __heroSmoke?: { status: string; detail?: string };
  }
}

/**
 * Final composite over the transparent page. The rgb is intentionally NOT
 * multiplied by alpha: premultiplying both (dye*a, a) causes quadratic
 * falloff — faint dye goes to black and the smoke is invisible. Emitting
 * dye brightness with a soft coverage alpha keeps thin wisps visible on
 * both light and dark themes.
 */
const DISPLAY_FRAG = `precision highp float;
precision mediump sampler2D;
varying vec2 vUv;
uniform sampler2D uTexture;
void main () {
  vec3 dye = texture2D(uTexture, vUv).rgb * 1.15;
  float a = clamp((dye.r + dye.g + dye.b) / 3.0 * 4.0, 0.0, 0.85);
  gl_FragColor = vec4(dye, a);
}`;

export default function HeroSmoke() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Any GL failure must only kill the smoke — never the hero.
    try {
      const cleanup = initSmoke(canvas);
      if (cleanup) {
        window.__heroSmoke = { status: 'ok' };
        return cleanup;
      }
    } catch (err) {
      console.error('[HeroSmoke] disabled:', err);
      window.__heroSmoke = { status: 'error', detail: String(err) };
      canvas.style.display = 'none';
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  );
}

/** Full WebGL setup + sim loop. Throws on any failure (caller degrades). */
function initSmoke(canvas: HTMLCanvasElement): (() => void) | undefined {
    // WebGL (v2 preferred) with alpha so the hero shows through.
    // NOTE: premultipliedAlpha stays at its default (true) — opting out has
    // a known compositor quirk where the canvas composites as fully
    // transparent. preserveDrawingBuffer keeps the last frame available for
    // compositing/screenshots instead of racing buffer invalidation.
    const contextAttrs: WebGLContextAttributes = {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: true,
    };
    const gl = (
      (canvas.getContext('webgl2', contextAttrs) as GL | null) ??
      (canvas.getContext('webgl', contextAttrs) as GL | null) ??
      (canvas.getContext('experimental-webgl', contextAttrs) as GL | null)
    ) as GL | null;
    if (!gl) {
      window.__heroSmoke = { status: 'no-webgl' };
      return;
    }
    if (gl.isContextLost()) {
      // React StrictMode remounts effects on the same canvas in dev; a
      // previously-released context can't be reused synchronously.
      throw new Error('WebGL context is lost');
    }
    window.__heroSmoke = { status: 'starting' };
    const g: GL = gl;

    const isWebGL2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
    if (isWebGL2) {
      gl.getExtension('EXT_color_buffer_float');
    } else {
      gl.getExtension('OES_texture_half_float');
    }
    // Half-float linear filtering isn't universal — without it, LINEAR makes
    // the sim textures incomplete (black screen). Fall back to NEAREST; the
    // advection shader does its own manual bilerp, so quality barely changes.
    const linearFiltering = isWebGL2
      ? !!gl.getExtension('OES_texture_float_linear')
      : !!gl.getExtension('OES_texture_half_float_linear');
    const halfFloatExt = isWebGL2
      ? null
      : (gl.getExtension('OES_texture_half_float') as OES_texture_half_float | null);

    const internalFormat = isWebGL2
      ? (gl as WebGL2RenderingContext).RGBA16F
      : (gl as WebGLRenderingContext).RGBA;
    const texType = isWebGL2
      ? (gl as WebGL2RenderingContext).HALF_FLOAT
      : (halfFloatExt?.HALF_FLOAT_OES ?? (gl as WebGLRenderingContext).UNSIGNED_BYTE);

    gl.clearColor(0, 0, 0, 0);

    const compile = (type: number, source: string, name: string): WebGLShader => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(shader);
        console.error(`[HeroSmoke] ${name} failed to compile:`, log ?? '(empty info log)');
        throw new Error(`Smoke shader (${name}): ${log ?? 'unknown compile error'}`);
      }
      return shader;
    };

    // Alias with a non-nullable type: TS drops outer narrowing inside
    // class method bodies, so methods use `g` instead of `gl`.
    const gctx: GL = g;
    class Program {
      program: WebGLProgram;
      uniforms: Record<string, WebGLUniformLocation | null> = {};
      constructor(vertex: WebGLShader, fragment: WebGLShader) {
        this.program = gctx.createProgram()!;
        gctx.attachShader(this.program, vertex);
        gctx.attachShader(this.program, fragment);
        // Pin the quad attribute to location 0 — the blit helper sets up its
        // vertex pointer once for location 0. Without this, drivers may place
        // aPosition elsewhere and every draw silently renders nothing.
        gctx.bindAttribLocation(this.program, 0, 'aPosition');
        gctx.linkProgram(this.program);
        if (!gctx.getProgramParameter(this.program, gctx.LINK_STATUS)) {
          throw new Error(`Smoke program: ${gctx.getProgramInfoLog(this.program)}`);
        }
        const count = gctx.getProgramParameter(this.program, gctx.ACTIVE_UNIFORMS) as number;
        for (let i = 0; i < count; i++) {
          const info = gctx.getActiveUniform(this.program, i);
          if (info) this.uniforms[info.name] = gctx.getUniformLocation(this.program, info.name);
        }
      }
      bind() {
        gctx.useProgram(this.program);
      }
    }

    type FBO = [WebGLTexture, WebGLFramebuffer, number];
    type DoubleFBO = { first: FBO; second: FBO; swap: () => void };

    const createFBO = (
      texId: number,
      w: number,
      h: number,
      filter: number,
    ): FBO => {
      gl.activeTexture(gl.TEXTURE0 + texId);
      const texture = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, gl.RGBA, texType, null);
      const fbo = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.viewport(0, 0, w, h);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return [texture, fbo, texId];
    };

    const createDoubleFBO = (texId: number, w: number, h: number, filter: number): DoubleFBO => {
      let fbo1 = createFBO(texId, w, h, filter);
      let fbo2 = createFBO(texId + 1, w, h, filter);
      return {
        get first() {
          return fbo1;
        },
        get second() {
          return fbo2;
        },
        swap() {
          const t = fbo1;
          fbo1 = fbo2;
          fbo2 = t;
        },
      };
    };

    const vertexShader = compile(gl.VERTEX_SHADER, BASE_VERTEX, 'vertex');
    const clearProgram = new Program(vertexShader, compile(gl.FRAGMENT_SHADER, CLEAR_FRAG, 'clear'));
    const splatProgram = new Program(vertexShader, compile(gl.FRAGMENT_SHADER, SPLAT_FRAG, 'splat'));
    const advectionProgram = new Program(
      vertexShader,
      compile(gl.FRAGMENT_SHADER, ADVECTION_FRAG, 'advection'),
    );
    const divergenceProgram = new Program(
      vertexShader,
      compile(gl.FRAGMENT_SHADER, DIVERGENCE_FRAG, 'divergence'),
    );
    const curlProgram = new Program(vertexShader, compile(gl.FRAGMENT_SHADER, CURL_FRAG, 'curl'));
    const vorticityProgram = new Program(
      vertexShader,
      compile(gl.FRAGMENT_SHADER, VORTICITY_FRAG, 'vorticity'),
    );
    const pressureProgram = new Program(
      vertexShader,
      compile(gl.FRAGMENT_SHADER, PRESSURE_FRAG, 'pressure'),
    );
    const gradientSubtractProgram = new Program(
      vertexShader,
      compile(gl.FRAGMENT_SHADER, GRADIENT_SUBTRACT_FRAG, 'gradient-subtract'),
    );
    const displayProgram = new Program(
      vertexShader,
      compile(gl.FRAGMENT_SHADER, DISPLAY_FRAG, 'display'),
    );

    // Full-screen quad + draw-to-target helper.
    const blit = (() => {
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
        gl.STATIC_DRAW,
      );
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(0);
      return (target: WebGLFramebuffer | null) => {
        gl.bindFramebuffer(gl.FRAMEBUFFER, target);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      };
    })();

    let simW = 0;
    let simH = 0;
    let dye: DoubleFBO | null = null;
    let velocity: DoubleFBO | null = null;
    let divergence: FBO | null = null;
    let curl: FBO | null = null;
    let pressure: DoubleFBO | null = null;

    const initTargets = () => {
      simW = canvas.width >> CONFIG.TEXTURE_DOWNSAMPLE;
      simH = canvas.height >> CONFIG.TEXTURE_DOWNSAMPLE;
      const filter = linearFiltering ? gl.LINEAR : gl.NEAREST;
      dye = createDoubleFBO(0, simW, simH, filter);
      velocity = createDoubleFBO(2, simW, simH, filter);
      divergence = createFBO(4, simW, simH, gl.NEAREST);
      curl = createFBO(5, simW, simH, gl.NEAREST);
      pressure = createDoubleFBO(6, simW, simH, gl.NEAREST);
    };

    const disposeTargets = () => {
      for (const set of [dye, velocity, pressure] as Array<DoubleFBO | null>) {
        for (const fbo of set ? [set.first, set.second] : []) {
          gl.deleteFramebuffer(fbo[1]);
          gl.deleteTexture(fbo[0]);
        }
      }
      for (const fbo of [divergence, curl] as Array<FBO | null>) {
        if (fbo) {
          gl.deleteFramebuffer(fbo[1]);
          gl.deleteTexture(fbo[0]);
        }
      }
      dye = velocity = pressure = divergence = curl = null;
    };

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) return;
      // (Re)create targets when the size changed OR when they're missing
      // (React StrictMode / HMR remounts effects on the same canvas while
      //  keeping its pixel size — without this, the second init silently
      //  keeps null targets and renders nothing forever).
      if (!dye || canvas.width !== w || canvas.height !== h) {
        disposeTargets();
        canvas.width = w;
        canvas.height = h;
        initTargets();
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const splat = (x: number, y: number, dx: number, dy: number) => {
      if (!dye || !velocity) return;
      const [sr, sg, sb] = CONFIG.SMOKE_RGB;
      const s = CONFIG.DENSITY_SCALE;
      splatProgram.bind();
      gl.uniform1i(splatProgram.uniforms['uTarget'], velocity.first[2]);
      gl.uniform1f(splatProgram.uniforms['aspectRatio'], canvas.width / canvas.height);
      gl.uniform2f(splatProgram.uniforms['point'], x / canvas.width, 1 - y / canvas.height);
      gl.uniform3f(splatProgram.uniforms['color'], dx, -dy, 1);
      gl.uniform1f(splatProgram.uniforms['radius'], CONFIG.SPLAT_RADIUS);
      blit(velocity.second[1]);
      velocity.swap();

      gl.uniform1i(splatProgram.uniforms['uTarget'], dye.first[2]);
      gl.uniform3f(splatProgram.uniforms['color'], sr * s, sg * s, sb * s);
      blit(dye.second[1]);
      dye.swap();
    };

    let raf = 0;
    let visible = true;
    let lastTime = Date.now();

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);

    // Force canonical unit bindings every frame: each tuple's textures must
    // sit on their tuple units. The Jacobi ping-pong (and any future pass)
    // otherwise leaves units serving the draw target itself, which ANGLE
    // rejects as a feedback loop.
    const syncUnits = () => {
      for (const set of [dye, velocity, pressure] as Array<DoubleFBO | null>) {
        if (!set) continue;
        for (const fbo of [set.first, set.second]) {
          gl.activeTexture(gl.TEXTURE0 + fbo[2]);
          gl.bindTexture(gl.TEXTURE_2D, fbo[0]);
        }
      }
    };

    const step = () => {
      if (!dye || !velocity || !divergence || !curl || !pressure) return;
      syncUnits();
      const dt = Math.min((Date.now() - lastTime) / 1000, 0.016);
      lastTime = Date.now();
      gl.viewport(0, 0, simW, simH);

      // Velocity: dissipate + advect.
      advectionProgram.bind();
      gl.uniform2f(advectionProgram.uniforms['texelSize'], 1 / simW, 1 / simH);
      gl.uniform1i(advectionProgram.uniforms['uVelocity'], velocity.first[2]);
      gl.uniform1i(advectionProgram.uniforms['uSource'], velocity.first[2]);
      gl.uniform1f(advectionProgram.uniforms['dt'], dt);
      gl.uniform1f(advectionProgram.uniforms['dissipation'], CONFIG.VELOCITY_DISSIPATION);
      blit(velocity.second[1]);
      velocity.swap();

      // Dye: advect through the velocity field.
      gl.uniform1i(advectionProgram.uniforms['uVelocity'], velocity.first[2]);
      gl.uniform1i(advectionProgram.uniforms['uSource'], dye.first[2]);
      gl.uniform1f(advectionProgram.uniforms['dissipation'], CONFIG.DENSITY_DISSIPATION);
      blit(dye.second[1]);
      dye.swap();

      // Vorticity confinement — the curls and billows.
      curlProgram.bind();
      gl.uniform2f(curlProgram.uniforms['texelSize'], 1 / simW, 1 / simH);
      gl.uniform1i(curlProgram.uniforms['uVelocity'], velocity.first[2]);
      blit(curl[1]);

      vorticityProgram.bind();
      gl.uniform2f(vorticityProgram.uniforms['texelSize'], 1 / simW, 1 / simH);
      gl.uniform1i(vorticityProgram.uniforms['uVelocity'], velocity.first[2]);
      gl.uniform1i(vorticityProgram.uniforms['uCurl'], curl[2]);
      gl.uniform1f(vorticityProgram.uniforms['curl'], CONFIG.CURL);
      gl.uniform1f(vorticityProgram.uniforms['dt'], dt);
      blit(velocity.second[1]);
      velocity.swap();

      // Pressure solve (Jacobi) + gradient subtract (incompressibility).
      divergenceProgram.bind();
      gl.uniform2f(divergenceProgram.uniforms['texelSize'], 1 / simW, 1 / simH);
      gl.uniform1i(divergenceProgram.uniforms['uVelocity'], velocity.first[2]);
      blit(divergence[1]);

      clearProgram.bind();
      gl.uniform1i(clearProgram.uniforms['uTexture'], pressure.first[2]);
      gl.uniform1f(clearProgram.uniforms['value'], CONFIG.PRESSURE_DISSIPATION);
      blit(pressure.second[1]);
      pressure.swap();

      pressureProgram.bind();
      gl.uniform2f(pressureProgram.uniforms['texelSize'], 1 / simW, 1 / simH);
      gl.uniform1i(pressureProgram.uniforms['uDivergence'], divergence[2]);
      for (let i = 0; i < CONFIG.PRESSURE_ITERATIONS; i++) {
        // Re-resolve the unit EVERY iteration: swap() flips which texture is
        // first, and binding a stale unit serves the draw target itself —
        // a feedback loop that ANGLE rejects with INVALID_OPERATION (which
        // silently kills the whole pressure solve and, downstream, the smoke).
        const first = pressure.first;
        gl.activeTexture(gl.TEXTURE0 + first[2]);
        gl.bindTexture(gl.TEXTURE_2D, first[0]);
        gl.uniform1i(pressureProgram.uniforms['uPressure'], first[2]);
        blit(pressure.second[1]);
        pressure.swap();
      }

      gradientSubtractProgram.bind();
      gl.uniform2f(gradientSubtractProgram.uniforms['texelSize'], 1 / simW, 1 / simH);
      gl.uniform1i(gradientSubtractProgram.uniforms['uPressure'], pressure.first[2]);
      gl.uniform1i(gradientSubtractProgram.uniforms['uVelocity'], velocity.first[2]);
      blit(velocity.second[1]);
      velocity.swap();

      // Composite dye over the transparent page.
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      displayProgram.bind();
      gl.uniform1i(displayProgram.uniforms['uTexture'], dye.first[2]);
      blit(null);
      gl.disable(gl.BLEND);
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) {
        lastTime = Date.now();
        return;
      }
      // Re-fit if layout changed the canvas size, or recover if targets
      // were never created (see resize()).
      if (!dye || canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        resize();
      }
      step();
    };
    raf = requestAnimationFrame(frame);

    // Pointer splats — the one8 interaction.
    const last = { x: 0, y: 0, has: false };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        last.has = false;
        return;
      }
      if (last.has) {
        const dx = (x - last.x) * CONFIG.FORCE;
        const dy = (y - last.y) * CONFIG.FORCE;
        if (dx !== 0 || dy !== 0) splat(x, y, dx, dy);
      }
      last.x = x;
      last.y = y;
      last.has = true;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    // A breath of ambient smoke so the hero isn't empty before first touch.
    const seedAmbient = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      for (let i = 0; i < 4; i++) {
        splat(
          w * (0.25 + Math.random() * 0.5),
          h * (0.3 + Math.random() * 0.4),
          (Math.random() - 0.5) * 220,
          (Math.random() - 0.5) * 220,
        );
      }
    };
    seedAmbient();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      // NOTE: no loseContext() here — React StrictMode reuses the same canvas
      // element across effect remounts in dev, and a released context would
      // break the second init. The context is freed with the canvas by GC.
    };
}
