'use client';

import { useState, useRef } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { label as labelStyle, ghostButton, input, mutedText, errorText } from './styles';

/**
 * Image picker that uploads to /api/upload (Vercel Blob) and returns the public
 * URL to the parent. Used for project images and blog cover images. Shows a
 * live preview; the URL can also be pasted manually. Controlled by the parent.
 */
export default function ImageUpload({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? 'Upload failed.');
        return;
      }
      onChange(data.url);
    } catch {
      setError('Upload failed. Check your connection.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div>
      <label style={labelStyle}>{label}</label>

      {value && (
        <div style={{ position: 'relative', marginBottom: '0.6rem', width: 'fit-content' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            style={{ maxWidth: '220px', maxHeight: '140px', borderRadius: '0.6rem', border: '1px solid var(--border)', display: 'block' }}
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove image"
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              color: '#f87171',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{ ...ghostButton, opacity: uploading ? 0.7 : 1, cursor: uploading ? 'not-allowed' : 'pointer' }}
        >
          {uploading ? <Loader2 className="w-4 h-4" style={{ animation: 'spin 1s linear infinite' }} /> : <UploadCloud className="w-4 h-4" />}
          {uploading ? 'Uploading…' : 'Upload image'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
          }}
          style={{ display: 'none' }}
        />
      </div>

      <input
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        placeholder="…or paste an image URL"
        style={{ ...input, marginTop: '0.5rem' }}
      />
      {error ? <p style={{ ...errorText, marginTop: '0.4rem' }}>{error}</p> : <p style={{ ...mutedText, marginTop: '0.4rem' }}>PNG, JPG, WebP, GIF or SVG · up to 8&nbsp;MB.</p>}
    </div>
  );
}
