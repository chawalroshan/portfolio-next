import 'server-only';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import type { SkillGroup, SocialLink } from '@/types';

/**
 * Server-side data access. All reads happen here (in Server Components),
 * never on the client — so there are no client fetch waterfalls.
 * Results are cached and tagged; Server Actions call revalidateTag() on write.
 */

export const CACHE_TAGS = {
  profile: 'profile',
  skills: 'skills',
  projects: 'projects',
  blogs: 'blogs',
} as const;

export type ProfileData = {
  name: string;
  title: string;
  bio: string;
  bioSecondary: string | null;
  resumeUrl: string | null;
  email: string | null;
  socialLinks: SocialLink[];
};

export const getProfile = unstable_cache(
  async (): Promise<ProfileData | null> => {
    const p = await prisma.profile.findUnique({ where: { id: 'profile' } });
    if (!p) return null;
    return {
      name: p.name,
      title: p.title,
      bio: p.bio,
      bioSecondary: p.bioSecondary,
      resumeUrl: p.resumeUrl,
      email: p.email,
      socialLinks: (p.socialLinks as unknown as SocialLink[]) ?? [],
    };
  },
  ['profile'],
  { tags: [CACHE_TAGS.profile] },
);

export const getSkillsGrouped = unstable_cache(
  async (): Promise<SkillGroup[]> => {
    const skills = await prisma.skill.findMany({
      where: { published: true },
      orderBy: { order: 'asc' },
    });
    const groups: SkillGroup[] = [];
    const byCategory = new Map<string, SkillGroup>();
    for (const s of skills) {
      let g = byCategory.get(s.category);
      if (!g) {
        g = { label: s.category, skills: [] };
        byCategory.set(s.category, g);
        groups.push(g);
      }
      g.skills.push({ id: s.id, name: s.name, icon: s.icon, level: s.level, url: s.url });
    }
    return groups;
  },
  ['skills-grouped'],
  { tags: [CACHE_TAGS.skills] },
);

export const getPublishedProjects = unstable_cache(
  async () => {
    return prisma.project.findMany({
      where: { published: true },
      orderBy: { order: 'asc' },
    });
  },
  ['projects-published'],
  { tags: [CACHE_TAGS.projects] },
);

export const getPublishedProjectCount = unstable_cache(
  async () => prisma.project.count({ where: { published: true } }),
  ['projects-count'],
  { tags: [CACHE_TAGS.projects] },
);

export const getProjectBySlug = unstable_cache(
  async (slug: string) => {
    return prisma.project.findFirst({ where: { slug, published: true } });
  },
  ['project-by-slug'],
  { tags: [CACHE_TAGS.projects] },
);

export const getPublishedProjectSlugs = unstable_cache(
  async () => {
    const rows = await prisma.project.findMany({
      where: { published: true },
      select: { slug: true },
    });
    return rows.map((r) => r.slug);
  },
  ['project-slugs'],
  { tags: [CACHE_TAGS.projects] },
);

export const getPublishedBlogs = unstable_cache(
  async () => {
    return prisma.blog.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
    });
  },
  ['blogs-published'],
  { tags: [CACHE_TAGS.blogs] },
);

export const getBlogBySlug = unstable_cache(
  async (slug: string) => {
    return prisma.blog.findFirst({ where: { slug, published: true } });
  },
  ['blog-by-slug'],
  { tags: [CACHE_TAGS.blogs] },
);

export const getPublishedBlogSlugs = unstable_cache(
  async () => {
    const rows = await prisma.blog.findMany({
      where: { published: true },
      select: { slug: true },
    });
    return rows.map((r) => r.slug);
  },
  ['blog-slugs'],
  { tags: [CACHE_TAGS.blogs] },
);
