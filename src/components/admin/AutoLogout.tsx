'use client';

import { useEffect, useRef, useState } from 'react';
import { signOut } from 'next-auth/react';
import {
  ABSOLUTE_TIMEOUT_MS,
  IDLE_TIMEOUT_MS,
  IDLE_WARNING_MS,
} from '@/lib/auth-timeouts';

const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keydown',
  'touchstart',
  'scroll',
  'click',
] as const;

/**
 * AutoLogout — invisible session guard, mounted only inside the admin panel
 * layout. No visual footprint except a small non-blocking warning toast in
 * the last 2 minutes of idle time (dismissed by any activity).
 *
 * - Idle: resets on user activity; signs out after IDLE_TIMEOUT_MS.
 * - Absolute: signs out ABSOLUTE_TIMEOUT_MS after mount regardless of activity
 *   (backs up the server-side JWT maxAge so a stale tab can't linger).
 * - Tab-hidden time still counts (uses timestamps, not just timers).
 */
export default function AutoLogout() {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const lastActivity = useRef<number>(Date.now());
  const mountTime = useRef<number>(Date.now());
  const signingOut = useRef(false);

  useEffect(() => {
    mountTime.current = Date.now();
    lastActivity.current = Date.now();

    const doSignOut = (reason: 'idle' | 'expired') => {
      if (signingOut.current) return;
      signingOut.current = true;
      void signOut({ callbackUrl: `/admin/login?reason=${reason}` });
    };

    const touch = () => {
      lastActivity.current = Date.now();
      setSecondsLeft(null);
    };

    for (const evt of ACTIVITY_EVENTS) {
      window.addEventListener(evt, touch, { passive: true });
    }
    document.addEventListener('visibilitychange', touch);

    const tick = window.setInterval(() => {
      const now = Date.now();
      const idleFor = now - lastActivity.current;
      const aliveFor = now - mountTime.current;

      if (aliveFor >= ABSOLUTE_TIMEOUT_MS) {
        doSignOut('expired');
        return;
      }
      const idleLeft = IDLE_TIMEOUT_MS - idleFor;
      if (idleLeft <= 0) {
        doSignOut('idle');
        return;
      }
      setSecondsLeft(idleLeft <= IDLE_WARNING_MS ? Math.ceil(idleLeft / 1000) : null);
    }, 1000);

    return () => {
      window.clearInterval(tick);
      for (const evt of ACTIVITY_EVENTS) {
        window.removeEventListener(evt, touch);
      }
      document.removeEventListener('visibilitychange', touch);
    };
  }, []);

  if (secondsLeft === null) return null;

  const mins = Math.floor(secondsLeft / 60);
  const secs = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        zIndex: 50,
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '0.75rem',
        padding: '0.6rem 0.9rem',
        fontSize: '0.75rem',
        fontFamily: "'Manrope', sans-serif",
        color: 'var(--text-primary)',
        boxShadow: 'var(--shadow)',
      }}
    >
      Signing out for inactivity in {mins}:{secs} — move the mouse to stay in.
    </div>
  );
}
