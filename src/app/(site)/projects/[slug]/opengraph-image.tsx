import { getProjectBySlug } from '@/lib/data';
import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';

/** Dynamic OG image for /projects/[slug]. Auto-attached to the page metadata. */
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Project';
export const dynamic = 'force-dynamic';

export default async function Image({ params }: { params: { slug: string } }) {
  const project = await getProjectBySlug(params.slug);
  return renderOg({
    tag: 'Project',
    title: project?.title ?? 'Project',
    subtitle: project?.techStack?.slice(0, 4).join(' · '),
  });
}
