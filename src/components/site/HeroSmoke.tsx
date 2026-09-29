'use client';

import { useEffect, useRef } from 'react';

/**
 * HeroSmoke — cursor-trailed smoke for the hero, in the site's own language:
 * accent-green exhaust wisps that curl off the pointer and dissipate, like
 * the astronaut's zero-g drift made visible. A 2D canvas layer (not WebGL)
 * so it costs almost nothing on top of HeroScene and works even if WebGL
 * fails.
 *
 * Contract:
 * - Absolute-fill canvas, pointer-events: none, aria-hidden. Sits above the
 *   3D scene, below the copy (parent stacks it at z-index 0 vs content 1),
 *   so text never hazes.
 * - Tint is read live from `--accent`, so light/dark themes match.
 * - Capped particles (~140), DPR ≤ 1.5, pauses off-screen / when tab hidden.
 * - Never mounted when prefers-reduced-motion (parent renders StaticBackdrop
 *   instead) — same rule as HeroScene.
 */

const FALLBACK_RGB: [number, number, number] = [63, 185, 80];
const MAX_PARTICLES = 140;
const DPR_CAP = 1.5;

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  grow: number;
  alpha: number;
};

function accentRGB(): [number, number, number] {
  if (typeof window === 'undefined') return FALLBACK_RGB;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--accent')
    .trim();
  const hex6 = raw.match(/^#([0-9a-f]{6})$/i);
  if (hex6) {
    const n = parseInt(hex6[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const hex3 = raw.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
  if (hex3) {
    return [
      parseInt(hex3[1] + hex3[1], 16),
      parseInt(hex3[2] + hex3[2], 16),
      parseInt(hex3[3] + hex3[3], 16),
    ];
  }
  return FALLBACK_RGB;
}

/** Pre-baked soft smoke puff in the accent color (rebuilt on theme change). */
function makeSprite([r, g, b]: [number, number, number]): HTMLCanvasElement {
  const s = 128;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d')!;
  const grad = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grad.addColorStop(0, `rgba(${r},${g},${b},0.5)`);
  grad.addColorStop(0.45, `rgba(${r},${g},${b},0.22)`);
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, s, s);
  return c;
}

export default function HeroSmoke() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let visible = true;
    let accentKey = '';
    let sprite = makeSprite(accentRGB());
    const particles: Particle[] = [];
    const last = { x: 0, y: 0, t: 0, has: false };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Only smoke while the pointer is actually over the hero.
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        last.has = false;
        return;
      }
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      const now = performance.now();
      let pvx = 0;
      let pvy = 0;
      if (last.has) {
        const dt = Math.max(now - last.t, 8);
        pvx = ((x - last.x) / dt) * 16;
        pvy = ((y - last.y) / dt) * 16;
        const m = Math.hypot(pvx, pvy);
        if (m > 14) {
          pvx = (pvx / m) * 14;
          pvy = (pvy / m) * 14;
        }
      }
      last.x = x;
      last.y = y;
      last.t = now;
      last.has = true;

      // Two puffs per move event: a tight core + a loose curl.
      for (let i = 0; i < 2; i++) {
        if (particles.length >= MAX_PARTICLES) particles.shift();
        const spread = i === 0 ? 6 : 18;
        particles.push({
          x: (x + (Math.random() - 0.5) * spread) * dpr,
          y: (y + (Math.random() - 0.5) * spread) * dpr,
          vx: (pvx * 0.12 + (Math.random() - 0.5) * 0.6) * dpr,
          vy: (pvy * 0.12 - 0.35 - Math.random() * 0.4) * dpr,
          life: 0,
          maxLife: 80 + Math.random() * 70,
          size: (i === 0 ? 26 + Math.random() * 22 : 44 + Math.random() * 40) * dpr,
          grow: (0.35 + Math.random() * 0.4) * dpr,
          alpha: i === 0 ? 0.5 : 0.32,
        });
      }
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    let frame = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden) return;
      // Re-tint cheaply when the theme flips --accent underneath us.
      if (++frame % 45 === 0) {
        const [r, g, b] = accentRGB();
        const key = `${r},${g},${b}`;
        if (key !== accentKey) {
          accentKey = key;
          sprite = makeSprite([r, g, b]);
        }
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += 1;
        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy = p.vy * 0.985 - 0.008;
        p.size += p.grow;
        // Ease in fast, breathe out slow: sin curve over life.
        const t = p.life / p.maxLife;
        ctx.globalAlpha = p.alpha * Math.sin(Math.PI * Math.min(t * 1.15, 1));
        const s = p.size;
        ctx.drawImage(sprite, p.x - s / 2, p.y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  );
}
