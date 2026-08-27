import 'server-only';
import type { ZodError } from 'zod';

/** First human-readable message from a Zod validation error. */
export function firstError(e: ZodError): string {
  return e.issues[0]?.message ?? 'Invalid input.';
}

/** True if the error is a Prisma unique-constraint violation (e.g. duplicate slug). */
export function isUniqueViolation(e: unknown): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    'code' in e &&
    (e as { code?: string }).code === 'P2002'
  );
}
