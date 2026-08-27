'use client';

import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { input, chip, label as labelStyle } from './styles';

/**
 * Chip-style input for string-array fields (Project.techStack, Blog.tags).
 * Enter or comma commits the current token; Backspace on an empty field
 * removes the last chip. Controlled — parent owns the array.
 */
export default function TagsInput({
  label,
  values,
  onChange,
  placeholder = 'Type and press Enter',
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');

  function commit(raw: string) {
    const v = raw.trim();
    if (!v) return;
    if (!values.includes(v)) onChange([...values, v]);
    setDraft('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit(draft);
    } else if (e.key === 'Backspace' && draft === '' && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  }

  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.4rem',
          padding: '0.5rem',
          borderRadius: '0.6rem',
          background: 'var(--input-bg)',
          border: '1px solid var(--border)',
        }}
      >
        {values.map((v) => (
          <span key={v} style={chip}>
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter((x) => x !== v))}
              aria-label={`Remove ${v}`}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'inline-flex', padding: 0 }}
            >
              <X size={13} />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => commit(draft)}
          placeholder={placeholder}
          style={{ ...input, border: 'none', background: 'transparent', flex: 1, minWidth: '140px', padding: '0.2rem 0.3rem' }}
        />
      </div>
    </div>
  );
}
