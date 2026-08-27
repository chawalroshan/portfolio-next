'use client';

import { Plus, Trash2 } from 'lucide-react';
import { SOCIAL_ICON_KEYS, getSocialIcon } from '@/lib/icons';
import { label as labelStyle, input, ghostButton, dangerButton, mutedText } from './styles';

export type SocialLink = { label: string; url: string; icon: string };

/**
 * Editor for Profile.socialLinks (stored as JSON). Each row is a label + URL +
 * an icon key chosen from the registry in src/lib/icons.tsx so the public site
 * can resolve it back to the correct icon component. Controlled by the parent.
 */
export default function SocialLinksEditor({
  values,
  onChange,
}: {
  values: SocialLink[];
  onChange: (next: SocialLink[]) => void;
}) {
  function update(i: number, patch: Partial<SocialLink>) {
    onChange(values.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  }
  function remove(i: number) {
    onChange(values.filter((_, idx) => idx !== i));
  }
  function add() {
    onChange([...values, { label: '', url: '', icon: SOCIAL_ICON_KEYS[0] ?? 'website' }]);
  }

  return (
    <div>
      <label style={labelStyle}>Social links</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {values.length === 0 && <p style={mutedText}>No links yet — add your GitHub, LinkedIn, etc.</p>}

        {values.map((link, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '150px 1fr 1fr auto',
              gap: '0.5rem',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ color: 'var(--accent)', display: 'inline-flex' }}>{getSocialIcon(link.icon)}</span>
              <select
                value={link.icon}
                onChange={(e) => update(i, { icon: e.target.value })}
                style={{ ...input, padding: '0.5rem 0.5rem' }}
                aria-label="Icon"
              >
                {SOCIAL_ICON_KEYS.map((key) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>
            <input
              value={link.label}
              onChange={(e) => update(i, { label: e.target.value })}
              placeholder="Label (e.g. GitHub)"
              style={input}
            />
            <input
              value={link.url}
              onChange={(e) => update(i, { url: e.target.value })}
              placeholder="https://…"
              style={input}
            />
            <button type="button" onClick={() => remove(i)} style={dangerButton} aria-label="Remove link">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      <button type="button" onClick={add} style={{ ...ghostButton, marginTop: '0.7rem' }}>
        <Plus size={15} /> Add link
      </button>
    </div>
  );
}
