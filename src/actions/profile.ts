'use server';

import { revalidateTag, revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helpers';
import { CACHE_TAGS } from '@/lib/data';
import { profileInputSchema } from '@/lib/validation';
import { firstError } from './_helpers';
import type { ActionResult } from './types';

/**
 * Profile Server Action. Profile is a singleton row keyed on id="profile";
 * updateProfile upserts it so the admin never has to worry about whether the
 * row exists yet. socialLinks is stored as JSON. Revalidates the profile tag
 * plus the home path (hero, contact, footer all read from profile).
 */
export async function updateProfile(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = profileInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const d = parsed.data;

  // socialLinks is a plain object array — safe to store as Prisma JSON.
  const socialLinks = d.socialLinks as unknown as Prisma.InputJsonValue;

  try {
    await prisma.profile.upsert({
      where: { id: 'profile' },
      create: {
        id: 'profile',
        name: d.name,
        title: d.title,
        bio: d.bio,
        bioSecondary: d.bioSecondary,
        resumeUrl: d.resumeUrl,
        email: d.email,
        socialLinks,
      },
      update: {
        name: d.name,
        title: d.title,
        bio: d.bio,
        bioSecondary: d.bioSecondary,
        resumeUrl: d.resumeUrl,
        email: d.email,
        socialLinks,
      },
    });
    revalidateTag(CACHE_TAGS.profile);
    revalidatePath('/');
    return { ok: true, id: 'profile' };
  } catch {
    return { ok: false, error: 'Failed to save profile.' };
  }
}
