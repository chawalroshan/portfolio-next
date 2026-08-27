import 'server-only';
import { prisma } from '@/lib/prisma';

/**
 * Admin-side reads. Unlike src/lib/data.ts (cached, published-only, for the
 * public site), these return ALL rows (incl. unpublished) and are NOT cached,
 * so the admin UI always shows the latest state right after a mutation.
 * Access is gated by middleware (/admin/*) and the (panel) layout guard.
 */

export function getAllProjects() {
  return prisma.project.findMany({ orderBy: { order: 'asc' } });
}

export function getProjectById(id: string) {
  return prisma.project.findUnique({ where: { id } });
}

export function getAllBlogs() {
  return prisma.blog.findMany({ orderBy: { updatedAt: 'desc' } });
}

export function getBlogById(id: string) {
  return prisma.blog.findUnique({ where: { id } });
}

export function getAllSkills() {
  return prisma.skill.findMany({ orderBy: { order: 'asc' } });
}

export function getProfileRow() {
  return prisma.profile.findUnique({ where: { id: 'profile' } });
}

export async function getAdminCounts() {
  const [projects, blogs, skills] = await Promise.all([
    prisma.project.count(),
    prisma.blog.count(),
    prisma.skill.count(),
  ]);
  return { projects, blogs, skills };
}
