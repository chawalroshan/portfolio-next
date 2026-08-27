import { getBlogBySlug } from '@/lib/data';
import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';

/** Dynamic OG image for /blog/[slug]. Auto-attached to the page metadata. */
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Blog post';
export const dynamic = 'force-dynamic';

export default async function Image({ params }: { params: { slug: string } }) {
  const post = await getBlogBySlug(params.slug);
  return renderOg({
    tag: 'Blog',
    title: post?.title ?? 'Blog',
    subtitle: post?.excerpt ?? undefined,
  });
}
