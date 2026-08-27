'use server';

import { revalidateTag, revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helpers';
import { CACHE_TAGS } from '@/lib/data';
import { projectInputSchema } from '@/lib/validation';
import { slugify } from '@/lib/slugify';
import { firstError, isUniqueViolation } from './_helpers';
import type { ActionResult } from './types';

/**
 * Project Server Actions. Every mutation re-checks the admin session
 * (requireAdmin) — middleware guards the /admin *pages*, but actions are
 * independently callable — then revalidates the cache tag + affected paths
 * so the public site (home + /projects/[slug] + sitemap) updates immediately.
 */
function revalidateProjects(slug?: string) {
  revalidateTag(CACHE_TAGS.projects);
  revalidatePath('/');
  revalidatePath('/sitemap.xml');
  if (slug) revalidatePath(`/projects/${slug}`);
}

export async function createProject(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = projectInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const d = parsed.data;

  const slug = slugify(d.slug || d.title);
  if (!slug) return { ok: false, error: 'Could not derive a slug from the title.' };

  const agg = await prisma.project.aggregate({ _max: { order: true } });
  const order = (agg._max.order ?? -1) + 1;

  try {
    const created = await prisma.project.create({
      data: {
        title: d.title,
        slug,
        description: d.description,
        techStack: d.techStack,
        imageUrl: d.imageUrl,
        liveUrl: d.liveUrl,
        repoUrl: d.repoUrl,
        published: d.published,
        order,
      },
    });
    revalidateProjects(created.slug);
    return { ok: true, id: created.id, slug: created.slug };
  } catch (e) {
    if (isUniqueViolation(e)) return { ok: false, error: 'A project with this slug already exists.' };
    return { ok: false, error: 'Failed to create project.' };
  }
}

export async function updateProject(id: string, input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = projectInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const d = parsed.data;

  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: 'Project not found.' };

  const slug = slugify(d.slug || d.title);
  if (!slug) return { ok: false, error: 'Could not derive a slug from the title.' };

  try {
    const updated = await prisma.project.update({
      where: { id },
      data: {
        title: d.title,
        slug,
        description: d.description,
        techStack: d.techStack,
        imageUrl: d.imageUrl,
        liveUrl: d.liveUrl,
        repoUrl: d.repoUrl,
        published: d.published,
      },
    });
    revalidateProjects(updated.slug);
    if (existing.slug !== updated.slug) revalidatePath(`/projects/${existing.slug}`);
    return { ok: true, id: updated.id, slug: updated.slug };
  } catch (e) {
    if (isUniqueViolation(e)) return { ok: false, error: 'A project with this slug already exists.' };
    return { ok: false, error: 'Failed to update project.' };
  }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    const deleted = await prisma.project.delete({ where: { id } });
    revalidateProjects(deleted.slug);
    return { ok: true };
  } catch {
    return { ok: false, error: 'Failed to delete project.' };
  }
}

export async function toggleProjectPublished(id: string, published: boolean): Promise<ActionResult> {
  await requireAdmin();
  try {
    const updated = await prisma.project.update({ where: { id }, data: { published } });
    revalidateProjects(updated.slug);
    return { ok: true };
  } catch {
    return { ok: false, error: 'Failed to update publish state.' };
  }
}

export async function reorderProjects(orderedIds: string[]): Promise<ActionResult> {
  await requireAdmin();
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return { ok: false, error: 'Invalid order payload.' };
  }
  try {
    await prisma.$transaction(
      orderedIds.map((id, index) => prisma.project.update({ where: { id }, data: { order: index } })),
    );
    revalidateProjects();
    return { ok: true };
  } catch {
    return { ok: false, error: 'Failed to reorder projects.' };
  }
}
