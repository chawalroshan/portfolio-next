'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Check } from 'lucide-react';
import { updateProfile } from '@/actions/profile';
import SocialLinksEditor, { type SocialLink } from './SocialLinksEditor';
import { card, label, input, textarea, primaryButton, errorText, mutedText } from './styles';

export type ProfileFormValues = {
  name: string;
  title: string;
  bio: string;
  bioSecondary: string | null;
  resumeUrl: string | null;
  email: string | null;
  socialLinks: SocialLink[];
};

/**
 * Profile editor (single row). Feeds the hero, about, contact and footer of the
 * public site. Saves via updateProfile (upsert) and shows a transient success
 * state instead of navigating away.
 */
export default function ProfileForm({ initial }: { initial: ProfileFormValues }) {
  const router = useRouter();
  const [values, setValues] = useState<ProfileFormValues>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof ProfileFormValues>(key: K, v: ProfileFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: v }));
    setSaved(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await updateProfile(values);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>Profile</h1>
        <p style={{ ...mutedText, marginTop: '0.25rem' }}>Your name, bio and links — shown across the public site.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ ...card, display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={label}>Name</label>
            <input value={values.name} onChange={(e) => set('name', e.target.value)} style={input} required />
          </div>
          <div>
            <label style={label}>Title / role</label>
            <input value={values.title} onChange={(e) => set('title', e.target.value)} placeholder="Software Engineer" style={input} required />
          </div>
        </div>

        <div>
          <label style={label}>Bio</label>
          <textarea value={values.bio} onChange={(e) => set('bio', e.target.value)} style={textarea} required />
        </div>

        <div>
          <label style={label}>Secondary bio (optional)</label>
          <textarea value={values.bioSecondary ?? ''} onChange={(e) => set('bioSecondary', e.target.value || null)} style={{ ...textarea, minHeight: '80px' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={label}>Email</label>
            <input value={values.email ?? ''} onChange={(e) => set('email', e.target.value || null)} placeholder="you@example.com" style={input} />
          </div>
          <div>
            <label style={label}>Résumé URL</label>
            <input value={values.resumeUrl ?? ''} onChange={(e) => set('resumeUrl', e.target.value || null)} placeholder="/resume.pdf or https://…" style={input} />
          </div>
        </div>

        <SocialLinksEditor values={values.socialLinks} onChange={(v) => set('socialLinks', v)} />

        {error && <p style={errorText}>{error}</p>}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <button type="submit" disabled={pending} style={{ ...primaryButton, opacity: pending ? 0.7 : 1, cursor: pending ? 'not-allowed' : 'pointer' }}>
            {pending ? <Loader2 className="w-4 h-4" style={{ animation: 'spin 1s linear infinite' }} /> : <Save className="w-4 h-4" />}
            Save profile
          </button>
          {saved && !pending && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#22c55e', fontSize: '0.8125rem', fontWeight: 600 }}>
              <Check size={15} /> Saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
