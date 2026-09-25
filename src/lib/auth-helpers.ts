import 'server-only';
import { auth } from '@/auth';
import { ADMIN_ACTION_LIMIT, checkRateLimit } from '@/lib/rate-limit';

/**
 * Enforce an authenticated admin inside Server Actions and server components.
 * Middleware guards the /admin routes, but Server Actions are independently
 * invocable, so every mutation must re-check the session server-side.
 * Also enforces the role (single-admin app — no non-admin users exist, but
 * the check must not silently disappear if one is ever added) and a generous
 * per-minute throttle that only trips on runaway scripts / abuse.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized: admin session required.');
  }
  if ((session.user as { role?: string }).role !== 'admin') {
    console.warn(`[audit] non-admin blocked from admin action (${session.user.email ?? 'unknown'})`);
    throw new Error('Unauthorized: admin role required.');
  }
  const key = `admin:${(session.user as { id?: string }).id ?? session.user.email ?? 'unknown'}`;
  const limit = checkRateLimit(key, ADMIN_ACTION_LIMIT);
  if (!limit.allowed) {
    console.warn(`[audit] admin action throttled (${key})`);
    throw new Error('Too many requests. Slow down and retry shortly.');
  }
  return session;
}
