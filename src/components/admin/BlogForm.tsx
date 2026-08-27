'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2 } from 'lucide-react';
import { createBlog, updateBlog } from '@/actions/blogs';
import TiptapEditor from './TiptapEditor';
import TagsInput from './TagsInput';
import ImageUpload from './ImageUpload';
import { card, label, input, textarea, primaryButton, ghostButton, errorText, mutedText, FONT } from './styles';

export type BlogFormValues = {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  tags: string[];
  published: boolean;
};

const EMPTY: BlogFormValues = {
  title: '',
  slug: '',
  content: '',
  excerpt: null,
  coverImage: null,
  tags: [],
  published: false,
};

/**
 * Create/edit form for a Blog post. Rich content is authored with Tiptap and
 * stored as HTML. On success routes back to the blog list and refreshes.
 */
export default function BlogForm({ initial }: { initial?: BlogFormValues }) {
  const router = useRouter();
  const [values, setValues] = useState<BlogFormValues>(initial ?? EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(initial?.id);

  function set<K extends keyof BlogFormValues>(key: K, v: BlogFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const payload = {
        title: values.title,
        slug: values.slug,
        content: values.content,
        excerpt: values.excerpt,
        coverImage: values.coverImage,
        tags: values.tags,
        published: values.published,
      };
      const res = isEdit ? await updateBlog(initial!.id!, payload) : await createBlog(payload);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push('/admin/blogs');
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ ...card, display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
      <div>
        <label style={label}>Title</label>
        <input value={values.title} onChange={(e) => set('title', e.target.value)} style={input} required />
      </div>

      <div>
        <label style={label}>Slug</label>
        <input
          value={values.slug}
          onChange={(e) => set('slug', e.target.value)}
          placeholder="Leave blank to generate from the title"
          style={input}
        />
        <p style={{ ...mutedText, marginTop: '0.35rem' }}>URL: /blog/{values.slug || 'auto-generated'}</p>
      </div>

      <div>
        <label style={label}>Excerpt</label>
        <textarea
          value={values.excerpt ?? ''}
          onChange={(e) => set('excerpt', e.target.value || null)}
          placeholder="Short summary shown on cards and in search results."
          style={{ ...textarea, minHeight: '70px' }}
        />
      </div>

      <ImageUpload label="Cover image" value={values.coverImage} onChange={(v) => set('coverImage', v)} />

      <TiptapEditor label="Content" value={values.content} onChange={(v) => set('content', v)} />

      <TagsInput label="Tags" values={values.tags} onChange={(v) => set('tags', v)} placeholder="nextjs, career…" />

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontFamily: FONT, fontSize: '0.875rem', fontWeight: 600 }}>
        <input type="checkbox" checked={values.published} onChange={(e) => set('published', e.target.checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }} />
        Published (visible on the public site)
      </label>

      {error && <p style={errorText}>{error}</p>}

      <div style={{ display: 'flex', gap: '0.6rem' }}>
        <button type="submit" disabled={pending} style={{ ...primaryButton, opacity: pending ? 0.7 : 1, cursor: pending ? 'not-allowed' : 'pointer' }}>
          {pending ? <Loader2 className="w-4 h-4" style={{ animation: 'spin 1s linear infinite' }} /> : <Save className="w-4 h-4" />}
          {isEdit ? 'Save changes' : 'Create post'}
        </button>
        <button type="button" onClick={() => router.push('/admin/blogs')} style={ghostButton}>Cancel</button>
      </div>
    </form>
  );
}
