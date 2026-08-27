// Deterministic slug generator for projects/blogs.
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // strip non-word chars
    .replace(/[\s_-]+/g, '-') // collapse whitespace/underscores to a single dash
    .replace(/^-+|-+$/g, ''); // trim leading/trailing dashes
}
