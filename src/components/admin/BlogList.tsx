'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { deleteBlog, toggleBlogPublished } from '@/actions/blogs';
import PublishToggle from './PublishToggle';
import { card, primaryButton, dangerButton, ghostButton, mutedText, FONT } from './styles';

export type BlogRow = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  updatedAt: string; // pre-formatted on the server
};

/**
 * Admin blog list. No reordering (posts are ordered by date on the public
 * site), just publish toggle, edit and delete.
 */
export default function BlogList({ initial }: { initial: BlogRow[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [, startTransition] = useTransition();

  function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await deleteBlog(id);
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        router.refresh();
      }
    });
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>Blog</h1>
          <p style={{ ...mutedText, marginTop: '0.25rem' }}>Write posts with rich text and images.</p>
        </div>
        <Link href="/admin/blogs/new" style={{ ...primaryButton, textDecoration: 'none' }}>
          <Plus className="w-4 h-4" /> New post
        </Link>
      </div>

      {items.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', color: 'var(--text-muted)' }}>No posts yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{ ...card, padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0, fontFamily: FONT }}>{item.title}</p>
                <p style={{ ...mutedText, margin: '0.15rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  /{item.slug} · edited {item.updatedAt}
                </p>
              </div>

              <PublishToggle published={item.published} action={(next) => toggleBlogPublished(item.id, next)} />

              <Link href={`/admin/blogs/${item.id}/edit`} style={{ ...ghostButton, textDecoration: 'none' }} aria-label="Edit">
                <Pencil size={15} />
              </Link>
              <button type="button" onClick={() => handleDelete(item.id, item.title)} style={dangerButton} aria-label="Delete">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
