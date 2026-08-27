'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2 } from 'lucide-react';
import { createProject, updateProject } from '@/actions/projects';
import TagsInput from './TagsInput';
import ImageUpload from './ImageUpload';
import { card, label, input, textarea, primaryButton, ghostButton, errorText, mutedText, FONT } from './styles';

export type ProjectFormValues = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  techStack: string[];
  imageUrl: string | null;
  liveUrl: string | null;
  repoUrl: string | null;
  published: boolean;
};

const EMPTY: ProjectFormValues = {
  title: '',
  slug: '',
  description: '',
  techStack: [],
  imageUrl: null,
  liveUrl: null,
  repoUrl: null,
  published: false,
};

/**
 * Create/edit form for a Project. When `initial.id` is present it updates,
 * otherwise it creates. On success it routes back to the project list and
 * refreshes so the (uncached) admin list reflects the change.
 */
export default function ProjectForm({ initial }: { initial?: ProjectFormValues }) {
  const router = useRouter();
  const [values, setValues] = useState<ProjectFormValues>(initial ?? EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(initial?.id);

  function set<K extends keyof ProjectFormValues>(key: K, v: ProjectFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const payload = {
        title: values.title,
        slug: values.slug,
        description: values.description,
        techStack: values.techStack,
        imageUrl: values.imageUrl,
        liveUrl: values.liveUrl,
        repoUrl: values.repoUrl,
        published: values.published,
      };
      const res = isEdit ? await updateProject(initial!.id!, payload) : await createProject(payload);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push('/admin/projects');
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
        <p style={{ ...mutedText, marginTop: '0.35rem' }}>URL: /projects/{values.slug || 'auto-generated'}</p>
      </div>

      <div>
        <label style={label}>Description</label>
        <textarea value={values.description} onChange={(e) => set('description', e.target.value)} style={textarea} required />
      </div>

      <TagsInput label="Tech stack" values={values.techStack} onChange={(v) => set('techStack', v)} placeholder="React, Node.js…" />

      <ImageUpload label="Cover image" value={values.imageUrl} onChange={(v) => set('imageUrl', v)} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={label}>Live URL</label>
          <input value={values.liveUrl ?? ''} onChange={(e) => set('liveUrl', e.target.value || null)} placeholder="https://…" style={input} />
        </div>
        <div>
          <label style={label}>Repository URL</label>
          <input value={values.repoUrl ?? ''} onChange={(e) => set('repoUrl', e.target.value || null)} placeholder="https://github.com/…" style={input} />
        </div>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontFamily: FONT, fontSize: '0.875rem', fontWeight: 600 }}>
        <input type="checkbox" checked={values.published} onChange={(e) => set('published', e.target.checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }} />
        Published (visible on the public site)
      </label>

      {error && <p style={errorText}>{error}</p>}

      <div style={{ display: 'flex', gap: '0.6rem' }}>
        <button type="submit" disabled={pending} style={{ ...primaryButton, opacity: pending ? 0.7 : 1, cursor: pending ? 'not-allowed' : 'pointer' }}>
          {pending ? <Loader2 className="w-4 h-4" style={{ animation: 'spin 1s linear infinite' }} /> : <Save className="w-4 h-4" />}
          {isEdit ? 'Save changes' : 'Create project'}
        </button>
        <button type="button" onClick={() => router.push('/admin/projects')} style={ghostButton}>Cancel</button>
      </div>
    </form>
  );
}
