'use server';

import { revalidateTag, revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helpers';
import { CACHE_TAGS } from '@/lib/data';
import { blogInputSchema } from '@/lib/validation';
import { slugify } from '@/lib/slugify';
import { firstError, isUniqueViolation } from './_helpers';
import type { ActionResult } from './types';

/**
 * Blog Server Actions. `publishedAt` is stamped the first time a post becomes
 * published and preserved thereafter (so re-publishing keeps the original
 * date). Revalidates the blogs tag + /blog, /blog/[slug] and the sitemap.
 */
function revalidateBlogs(slug?: string) {
  revalidateTag(CACHE_TAGS.blogs);
  revalidatePath('/blog');
  revalidatePath('/sitemap.xml');
  if (slug) revalidatePath(`/blog/${slug}`);
}

export async function createBlog(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = blogInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const d = parsed.data;

  const slug = slugify(d.slug || d.title);
  if (!slug) return { ok: false, error: 'Could not derive a slug from the title.' };

  try {
    const created = await prisma.blog.create({
      data: {
        title: d.title,
        slug,
        content: d.content,
        excerpt: d.excerpt,
        coverImage: d.coverImage,
        tags: d.tags,
        published: d.published,
        publishedAt: d.published ? new Date() : null,
      },
    });
    revalidateBlogs(created.slug);
    return { ok: true, id: created.id, slug: created.slug };
  } catch (e) {
    if (isUniqueViolation(e)) return { ok: false, error: 'A post with this slug already exists.' };
    return { ok: false, error: 'Failed to create post.' };
  }
}

export async function updateBlog(id: string, input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = blogInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const d = parsed.data;

  const existing = await prisma.blog.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: 'Post not found.' };

  const slug = slugify(d.slug || d.title);
  if (!slug) return { ok: false, error: 'Could not derive a slug from the title.' };

  // Stamp publishedAt on first publish; keep the original date afterwards.
  const publishedAt = d.published ? existing.publishedAt ?? new Date() : existing.publishedAt;

  try {
    const updated = await prisma.blog.update({
      where: { id },
      data: {
        title: d.title,
        slug,
        content: d.content,
        excerpt: d.excerpt,
        coverImage: d.coverImage,
        tags: d.tags,
        published: d.published,
        publishedAt,
      },
    });
    revalidateBlogs(updated.slug);
    if (existing.slug !== updated.slug) revalidatePath(`/blog/${existing.slug}`);
    return { ok: true, id: updated.id, slug: updated.slug };
  } catch (e) {
    if (isUniqueViolation(e)) return { ok: false, error: 'A post with this slug already exists.' };
    return { ok: false, error: 'Failed to update post.' };
  }
}

export async function deleteBlog(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    const deleted = await prisma.blog.delete({ where: { id } });
    revalidateBlogs(deleted.slug);
    return { ok: true };
  } catch {
    return { ok: false, error: 'Failed to delete post.' };
  }
}

export async function toggleBlogPublished(id: string, published: boolean): Promise<ActionResult> {
  await requireAdmin();
  const existing = await prisma.blog.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: 'Post not found.' };

  const publishedAt = published ? existing.publishedAt ?? new Date() : existing.publishedAt;

  try {
    const updated = await prisma.blog.update({ where: { id }, data: { published, publishedAt } });
    revalidateBlogs(updated.slug);
    return { ok: true };
  } catch {
    return { ok: false, error: 'Failed to update publish state.' };
  }
}
