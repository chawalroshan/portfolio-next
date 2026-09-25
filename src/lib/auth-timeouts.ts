/**
 * Single source of truth for admin session lifetimes.
 * Change the minutes here — client idle timer and server JWT expiry stay in sync.
 */
export const IDLE_TIMEOUT_MINUTES = 30;
export const ABSOLUTE_TIMEOUT_MINUTES = 120;

export const IDLE_TIMEOUT_MS = IDLE_TIMEOUT_MINUTES * 60 * 1000;
export const ABSOLUTE_TIMEOUT_MS = ABSOLUTE_TIMEOUT_MINUTES * 60 * 1000;

/** Server-side JWT/session lifetime (seconds). Matches absolute timeout. */
export const SESSION_MAX_AGE_SECONDS = ABSOLUTE_TIMEOUT_MINUTES * 60;

/** Warn this long before idle logout so an active admin can stay signed in. */
export const IDLE_WARNING_MS = 2 * 60 * 1000;
