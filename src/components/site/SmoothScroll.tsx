'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * SmoothScroll — mounts a single Lenis instance for the public site.
 * Skipped entirely when the user prefers reduced motion (native scroll).
 * Rendered once in the (site) layout; renders nothing itself.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
