import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-config';

/** robots.txt — allow everything except the admin panel; point at the sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
