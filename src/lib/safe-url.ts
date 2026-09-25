/**
 * Defense-in-depth for admin-entered URLs rendered as <a href> on the public
 * site (social links, skill URLs, project live/repo links).
 *
 * Server-side Zod schemas (`src/lib/validation.ts`) reject dangerous schemes
 * at write time; this runtime guard covers rows written before that check
 * existed. Legitimate values (https://, mailto:, site-relative /, #) pass
 * through untouched — only `javascript:`, `data:`, `vbscript:` and
 * protocol-relative `//` URLs fall back to '#'; no visual change otherwise.
 */
export function safeHref(url: string | null | undefined, fallback = '#'): string {
  const u = (url ?? '').trim();
  if (!u) return fallback;
  if (u.startsWith('#')) return u;
  if (u.startsWith('/') && !u.startsWith('//')) return u;
  if (/^(https?:\/\/|mailto:)/i.test(u)) return u;
  return fallback;
}

/** Shared by the Zod schemas — same allow-list, single definition. */
export function isSafeUrl(u: string): boolean {
  return safeHref(u, '') !== '';
}
