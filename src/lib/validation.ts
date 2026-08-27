import { z } from 'zod';

/**
 * Zod schemas shared by the Server Actions. Client forms send typed objects
 * (not FormData) because content includes rich HTML and array fields; every
 * action re-validates here before touching the DB.
 */

// Optional string that treats "" as null and trims whitespace.
const optionalString = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    const s = (v ?? '').toString().trim();
    return s === '' ? null : s;
  });

export const socialLinkSchema = z.object({
  label: z.string().trim().min(1, 'Social label is required'),
  url: z.string().trim().min(1, 'Social URL is required'),
  icon: z.string().trim().min(1, 'Social icon key is required'),
});

export const projectInputSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  slug: z.string().trim().optional().default(''),
  description: z.string().trim().min(1, 'Description is required'),
  techStack: z.array(z.string().trim().min(1)).default([]),
  imageUrl: optionalString,
  liveUrl: optionalString,
  repoUrl: optionalString,
  published: z.boolean().default(false),
});
export type ProjectInput = z.input<typeof projectInputSchema>;

export const blogInputSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  slug: z.string().trim().optional().default(''),
  content: z.string().min(1, 'Content is required'),
  excerpt: optionalString,
  coverImage: optionalString,
  tags: z.array(z.string().trim().min(1)).default([]),
  published: z.boolean().default(false),
});
export type BlogInput = z.input<typeof blogInputSchema>;

export const skillInputSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  category: z.string().trim().min(1, 'Category is required'),
  icon: z.string().trim().min(1, 'Icon is required'),
  level: z.string().trim().min(1).default('Intermediate'),
  url: optionalString,
  published: z.boolean().default(true),
});
export type SkillInput = z.input<typeof skillInputSchema>;

export const profileInputSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  title: z.string().trim().min(1, 'Title is required'),
  bio: z.string().trim().min(1, 'Bio is required'),
  bioSecondary: optionalString,
  resumeUrl: optionalString,
  email: optionalString,
  socialLinks: z.array(socialLinkSchema).default([]),
});
export type ProfileInput = z.input<typeof profileInputSchema>;
