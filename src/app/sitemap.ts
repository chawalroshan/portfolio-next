import type { MetadataRoute } from 'next';
import { getPublishedProjectSlugs, getPublishedBlogSlugs } from '@/lib/data';
import { SITE_URL } from '@/lib/site-config';

/**
 * sitemap.xml — includes the home + blog index (static) plus one entry per
 * published project and blog post. Regenerated on the same ISR/tag cycle as
 * the pages themselves.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projectSlugs, blogSlugs] = await Promise.all([
    getPublishedProjectSlugs(),
    getPublishedBlogSlugs(),
  ]);
  const now = new Date();

  return [
    { url: SITE_URL, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    ...projectSlugs.map((slug) => ({
      url: `${SITE_URL}/projects/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...blogSlugs.map((slug) => ({
      url: `${SITE_URL}/blog/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
