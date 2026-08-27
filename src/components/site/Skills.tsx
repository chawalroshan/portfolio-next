'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { getCategoryIcon, getSkillIcon } from '@/lib/icons';
import type { SkillGroup } from '@/types';

/**
 * Skills — client component (the category tabs need `activeTab` state).
 * Data (grouped skills) is fetched on the server and passed in as props,
 * so there is no client-side fetch. Icons resolve from the registry via
 * the string key stored on each Skill row.
 */
export default function Skills({ groups }: { groups: SkillGroup[] }) {
  const [activeTab, setActiveTab] = useState(groups[0]?.label ?? '');

  if (groups.length === 0) return null;

  const activeCategory = groups.find((g) => g.label === activeTab) ?? groups[0];

  return (
    <section id="skills" style={{ maxWidth: '72rem', margin: '0 auto', padding: '5rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.5rem', fontWeight: 600 }}>My Abilities</p>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>My Experience</h2>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.625rem', marginBottom: '2rem' }}>
        {groups.map((cat) => (
          <button
            key={cat.label}
            onClick={() => setActiveTab(cat.label)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.4rem 1.1rem', borderRadius: '100px', fontSize: '0.825rem', fontWeight: 600,
              fontFamily: "'Manrope', sans-serif", cursor: 'pointer', transition: 'all 0.2s ease',
              background: activeTab === cat.label ? 'var(--accent)' : 'transparent',
              color: activeTab === cat.label ? '#fff' : 'var(--text-secondary)',
              border: activeTab === cat.label ? '1px solid var(--accent)' : '1px solid var(--border)',
            }}
          >
            {getCategoryIcon(cat.label)} {cat.label}
          </button>
        ))}
      </div>

      {/* Skills grid */}
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ borderRadius: '1.25rem', background: 'var(--card-bg)', border: '1px solid var(--border)', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <span style={{ color: 'var(--accent)', display: 'flex' }}>{getCategoryIcon(activeCategory.label)}</span>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{activeCategory.label}</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem 2rem' }}>
            {activeCategory.skills.map((skill) => (
              <a
                key={skill.id}
                href={skill.url ?? '#'}
                target={skill.url ? '_blank' : undefined}
                rel={skill.url ? 'noopener noreferrer' : undefined}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.75rem', borderRadius: '0.625rem', textDecoration: 'none', transition: 'background 0.2s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--border)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ color: 'var(--accent)', fontSize: '1.1rem', display: 'flex', flexShrink: 0 }}>{getSkillIcon(skill.icon)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block' }}>{skill.name}</span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{skill.level}</span>
                </div>
                <ExternalLink style={{ width: '0.75rem', height: '0.75rem', color: 'var(--text-muted)', opacity: 0, flexShrink: 0, transition: 'opacity 0.2s' }} className="skill-ext" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
