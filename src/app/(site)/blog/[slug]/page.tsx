import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { getBlogBySlug, getPublishedBlogSlugs } from '@/lib/data';

/**
 * Blog post — /blog/[slug]. Statically generated per published slug and
 * revalidated by the "blogs" tag on edit/publish. The post body is HTML
 * produced by the admin Tiptap editor and stored in Blog.content; it is
 * rendered with dangerouslySetInnerHTML. This is safe here because the sole
 * author is the authenticated admin (their own trusted content).
 */
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const slugs = await getPublishedBlogSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getBlogBySlug(params.slug);
  if (!post) return { title: 'Post not found' };
  const description = post.excerpt ?? undefined;
  const publishedAt = post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined;
  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime: publishedAt,
      tags: post.tags,
    },
  };
}

function formatDate(date: Date | null) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogBySlug(params.slug);
  if (!post) notFound();

  return (
    <main style={{ fontFamily: "'Manrope', sans-serif", maxWidth: '44rem', margin: '0 auto', padding: '7rem 1.5rem 5rem' }}>
      <Link
        href="/blog"
        className="nav-link"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '2rem' }}
      >
        <ArrowLeft className="w-4 h-4" /> Back to blog
      </Link>

      {post.publishedAt && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.75rem' }}>{formatDate(post.publishedAt)}</p>
      )}

      <h1 style={{ fontSize: 'clamp(1.875rem, 5vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: '1rem' }}>
        {post.title}
      </h1>

      {post.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '2rem' }}>
          {post.tags.map((tag) => (
            <span key={tag} style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--accent)', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', borderRadius: '100px', padding: '0.2rem 0.6rem' }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {post.coverImage && (
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', borderRadius: '1.125rem', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '2.5rem', background: 'var(--bg-tertiary)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}

      {/* Admin-authored Tiptap HTML. Styled by the .prose-content rules in globals.css. */}
      <div className="prose-content" dangerouslySetInnerHTML={{ __html: post.content }} />
    </main>
  );
}
