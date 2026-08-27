import { getProfile } from '@/lib/data';
import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';
import { SITE_NAME, SITE_TITLE_FALLBACK } from '@/lib/site-config';

/** Default site-wide OG image (used for the home page and anywhere without its own). */
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = SITE_NAME;

export default async function Image() {
  const profile = await getProfile();
  return renderOg({
    title: profile?.name ?? SITE_NAME,
    subtitle: profile?.title ?? SITE_TITLE_FALLBACK,
  });
}
