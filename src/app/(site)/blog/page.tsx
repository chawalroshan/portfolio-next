import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { getPublishedBlogs } from '@/lib/data';

/**
 * Blog index — /blog. Server Component listing published posts (newest first).
 * Revalidated by the "blogs" cache tag when an admin publishes/edits a post.
 */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Articles, notes and write-ups.',
};

function formatDate(date: Date | null) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default async function BlogIndexPage() {
  const posts = await getPublishedBlogs();

  return (
    <main style={{ fontFamily: "'Manrope', sans-serif", maxWidth: '60rem', margin: '0 auto', padding: '7rem 1.5rem 5rem', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.5rem', fontWeight: 600 }}>Writing</p>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>Blog</h1>
      </div>

      {posts.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9375rem' }}>No posts yet. Check back soon.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="project-card"
              style={{ display: 'flex', gap: '1.25rem', borderRadius: '1.125rem', background: 'var(--card-bg)', border: '1px solid var(--border)', overflow: 'hidden', textDecoration: 'none', padding: '1.5rem' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <h2 style={{ fontSize: '1.1875rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{post.title}</h2>
                  <ArrowUpRight className="project-arrow" style={{ width: '1.125rem', height: '1.125rem', color: 'var(--accent)', flexShrink: 0, opacity: 0.6, transition: 'transform 0.2s ease, opacity 0.2s ease' }} />
                </div>
                {post.publishedAt && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{formatDate(post.publishedAt)}</span>
                )}
                {post.excerpt && (
                  <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.7, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {post.excerpt}
                  </p>
                )}
                {post.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.15rem' }}>
                    {post.tags.map((tag) => (
                      <span key={tag} style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--accent)', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', borderRadius: '100px', padding: '0.2rem 0.6rem' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
