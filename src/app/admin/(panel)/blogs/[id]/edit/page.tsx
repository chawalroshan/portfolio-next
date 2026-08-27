import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getBlogById } from '@/lib/admin-data';
import BlogForm from '@/components/admin/BlogForm';
import { ghostButton } from '@/components/admin/styles';

export const dynamic = 'force-dynamic';

export default async function EditBlogPage({ params }: { params: { id: string } }) {
  const post = await getBlogById(params.id);
  if (!post) notFound();

  return (
    <div>
      <Link href="/admin/blogs" style={{ ...ghostButton, textDecoration: 'none', marginBottom: '1.25rem' }}>
        <ArrowLeft size={15} /> Back to blog
      </Link>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 1.25rem' }}>Edit post</h1>
      <BlogForm
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt,
          coverImage: post.coverImage,
          tags: post.tags,
          published: post.published,
        }}
      />
    </div>
  );
}
