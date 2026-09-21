'use client';

import { useEffect, useRef } from 'react';

/**
 * Snowfall — lightweight 2D canvas snow overlay. Soft white flakes drift
 * down with a sideways sway and a gentle twinkle. Renders nothing when the
 * user prefers reduced motion. Pauses itself offscreen (IntersectionObserver)
 * so it costs nothing when scrolled past. Falls IN FRONT of content
 * (pointer-events: none) — snow lands on everything.
 */
export default function Snowfall() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = ref.current;
    if (!canvas || !canvas.parentElement) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;
    type Flake = { x: number; y: number; r: number; s: number; ph: number };
    let flakes: Flake[] = [];

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      w = canvas.width = Math.max(1, Math.floor(rect.width));
      h = canvas.height = Math.max(1, Math.floor(rect.height));
      const n = Math.min(130, Math.floor(w / 9));
      flakes = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.8 + Math.random() * 2.2,
        s: 0.3 + Math.random() * 0.9,
        ph: Math.random() * Math.PI * 2,
      }));
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#e6edf3';
      const t = performance.now() / 1000;
      for (const f of flakes) {
        f.y += f.s;
        f.x += Math.sin(t + f.ph) * 0.2;
        if (f.y > h + 4) {
          f.y = -4;
          f.x = Math.random() * w;
        }
        ctx.globalAlpha = 0.35 + 0.55 * (0.5 + 0.5 * Math.sin(t * 2 + f.ph));
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting;
      if (visible && !running) {
        running = true;
        loop();
      } else if (!visible) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}
    />
  );
}
