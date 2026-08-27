/**
 * Static site config for metadata / absolute URLs. Values that must be
 * available synchronously (metadataBase, sitemap host) live here; richer,
 * editable values (name, title, bio) come from the Profile row in the DB.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

// Fallback name/title used only if the Profile row hasn't been seeded yet.
export const SITE_NAME = 'Roshan Chawal';
export const SITE_TITLE_FALLBACK = 'Software Engineer';
