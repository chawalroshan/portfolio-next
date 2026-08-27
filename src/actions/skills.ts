'use server';

import { revalidateTag, revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helpers';
import { CACHE_TAGS } from '@/lib/data';
import { skillInputSchema } from '@/lib/validation';
import { firstError } from './_helpers';
import type { ActionResult } from './types';

/**
 * Skill Server Actions. Skills feed the grouped tabbed UI on the home page,
 * so every mutation revalidates the skills tag + home path. New skills are
 * appended at the end (max order + 1); reordering rewrites the order field.
 */
function revalidateSkills() {
  revalidateTag(CACHE_TAGS.skills);
  revalidatePath('/');
}

export async function createSkill(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = skillInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const d = parsed.data;

  const agg = await prisma.skill.aggregate({ _max: { order: true } });
  const order = (agg._max.order ?? -1) + 1;

  try {
    const created = await prisma.skill.create({
      data: {
        name: d.name,
        category: d.category,
        icon: d.icon,
        level: d.level,
        url: d.url,
        published: d.published,
        order,
      },
    });
    revalidateSkills();
    return { ok: true, id: created.id };
  } catch {
    return { ok: false, error: 'Failed to create skill.' };
  }
}

export async function updateSkill(id: string, input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = skillInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const d = parsed.data;

  try {
    const updated = await prisma.skill.update({
      where: { id },
      data: {
        name: d.name,
        category: d.category,
        icon: d.icon,
        level: d.level,
        url: d.url,
        published: d.published,
      },
    });
    revalidateSkills();
    return { ok: true, id: updated.id };
  } catch {
    return { ok: false, error: 'Failed to update skill.' };
  }
}

export async function deleteSkill(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await prisma.skill.delete({ where: { id } });
    revalidateSkills();
    return { ok: true };
  } catch {
    return { ok: false, error: 'Failed to delete skill.' };
  }
}

export async function toggleSkillPublished(id: string, published: boolean): Promise<ActionResult> {
  await requireAdmin();
  try {
    await prisma.skill.update({ where: { id }, data: { published } });
    revalidateSkills();
    return { ok: true };
  } catch {
    return { ok: false, error: 'Failed to update publish state.' };
  }
}

export async function reorderSkills(orderedIds: string[]): Promise<ActionResult> {
  await requireAdmin();
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return { ok: false, error: 'Invalid order payload.' };
  }
  try {
    await prisma.$transaction(
      orderedIds.map((id, index) => prisma.skill.update({ where: { id }, data: { order: index } })),
    );
    revalidateSkills();
    return { ok: true };
  } catch {
    return { ok: false, error: 'Failed to reorder skills.' };
  }
}
