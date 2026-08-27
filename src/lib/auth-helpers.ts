import 'server-only';
import { auth } from '@/auth';

/**
 * Enforce an authenticated admin inside Server Actions and server components.
 * Middleware guards the /admin routes, but Server Actions are independently
 * invocable, so every mutation must re-check the session server-side.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized: admin session required.');
  }
  return session;
}
