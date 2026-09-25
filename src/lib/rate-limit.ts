/**
 * Minimal in-memory sliding-window rate limiter (no new dependencies).
 *
 * NOTE: buckets live per server instance and reset on cold start / redeploy,
 * so a distributed attacker gets a fresh budget per instance. For a
 * single-admin portfolio this still raises brute-force cost substantially at
 * zero infra cost. If abuse ever becomes real, swap this for a Redis counter
 * (Upstash) behind the same `checkRateLimit` signature.
 *
 * NEVER import this from edge middleware (`src/middleware.ts` /
 * `src/auth.config.ts`) — Map-based state is per-request there. It is used
 * from Node-only code: `src/auth.ts`, `src/app/api/upload/route.ts`, and
 * `src/lib/auth-helpers.ts` (all `runtime: nodejs`).
 */

export type RateLimitOptions = {
  /** Rolling window for counting attempts. */
  windowMs: number;
  /** Max attempts per window before a block starts. */
  max: number;
  /** How long the key stays blocked once the max is exceeded. */
  blockMs: number;
};

type Bucket = { count: number; windowStart: number; blockedUntil: number };

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 5000;

/** Login: 5 bad attempts / 15 min → 15-min lockout (per email). */
export const LOGIN_LIMIT: RateLimitOptions = {
  windowMs: 15 * 60 * 1000,
  max: 5,
  blockMs: 15 * 60 * 1000,
};

/** Uploads: 20 / 10 min per IP → 10-min block. */
export const UPLOAD_LIMIT: RateLimitOptions = {
  windowMs: 10 * 60 * 1000,
  max: 20,
  blockMs: 10 * 60 * 1000,
};

/**
 * Admin mutations: 120 / min per admin. Normal use (incl. bulk reorders,
 * which are a single action call) sits far below this — it only trips on
 * runaway scripts / abuse. Applied centrally in requireAdmin(), so every
 * Server Action is covered without touching each file.
 */
export const ADMIN_ACTION_LIMIT: RateLimitOptions = {
  windowMs: 60 * 1000,
  max: 120,
  blockMs: 60 * 1000,
};

function sweep(now: number, windowMs: number) {
  if (buckets.size < MAX_KEYS) return;
  for (const [key, b] of buckets) {
    if (now >= b.blockedUntil && now - b.windowStart > windowMs) {
      buckets.delete(key);
    }
  }
}

export function checkRateLimit(
  key: string,
  opts: RateLimitOptions,
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  sweep(now, opts.windowMs);

  const b = buckets.get(key);
  if (b) {
    if (now < b.blockedUntil) {
      return { allowed: false, retryAfterSec: Math.ceil((b.blockedUntil - now) / 1000) };
    }
    if (now - b.windowStart > opts.windowMs) {
      b.count = 1;
      b.windowStart = now;
      b.blockedUntil = 0;
      return { allowed: true, retryAfterSec: 0 };
    }
    b.count += 1;
    if (b.count > opts.max) {
      b.blockedUntil = now + opts.blockMs;
      return { allowed: false, retryAfterSec: Math.ceil(opts.blockMs / 1000) };
    }
    return { allowed: true, retryAfterSec: 0 };
  }

  buckets.set(key, { count: 1, windowStart: now, blockedUntil: 0 });
  return { allowed: true, retryAfterSec: 0 };
}

export function resetRateLimit(key: string): void {
  buckets.delete(key);
}
