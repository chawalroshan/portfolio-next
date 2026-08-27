import { getAllBlogs } from '@/lib/admin-data';
import BlogList from '@/components/admin/BlogList';

export const dynamic = 'force-dynamic';

const fmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default async function AdminBlogsPage() {
  const blogs = await getAllBlogs();
  return (
    <BlogList
      initial={blogs.map((b) => ({
        id: b.id,
        title: b.title,
        slug: b.slug,
        published: b.published,
        updatedAt: fmt.format(b.updatedAt),
      }))}
    />
  );
}
