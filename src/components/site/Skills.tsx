'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { getCategoryIcon, getSkillIcon } from '@/lib/icons';
import Snowfall from './Snowfall';
import type { SkillGroup } from '@/types';

/**
 * Skills — the second (and last) place motion lives on this site.
 * Level bars fill ONCE when scrolled into view (viewport once:true).
 * Tab switches are instant; a previously-seen tab renders its final
 * widths immediately instead of replaying. Reduced-motion renders
 * final widths with no animation.
 *
 * Skill levels are free-form strings in the DB ('Intermediate' default),
 * so levelToPercent maps known labels and parses trailing numbers.
 */
function levelToPercent(level: string): number {
  const numeric = level.match(/(\d+)\s*%?/);
  if (numeric) return Math.min(100, Math.max(20, parseInt(numeric[1], 10)));
  const map: Record<string, number> = {
    beginner: 35,
    junior: 45,
    intermediate: 60,
    advanced: 80,
    senior: 88,
    expert: 92,
    master: 96,
  };
  return map[level.trim().toLowerCase()] ?? 60;
}

export default function Skills({ groups }: { groups: SkillGroup[] }) {
  const [activeTab, setActiveTab] = useState(groups[0]?.label ?? '');
  const [seenTabs, setSeenTabs] = useState<string[]>([]);
  const reduce = useReducedMotion();

  if (groups.length === 0) return null;

  const activeCategory = groups.find((g) => g.label === activeTab) ?? groups[0];
  const seen = seenTabs.includes(activeCategory.label) || reduce === true;

  const markSeen = () =>
    setSeenTabs((prev) => (prev.includes(activeCategory.label) ? prev : [...prev, activeCategory.label]));

  return (
    <section id="skills" style={{ maxWidth: '72rem', margin: '0 auto', padding: '5rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
      <Snowfall />
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.5rem', fontWeight: 600 }}>My Abilities</p>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>My Experience</h2>
      </div>

      {/* Category tabs — instant switch, no motion */}
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
          <div key={activeCategory.label} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem 2rem' }}>
            {activeCategory.skills.map((skill) => {
              const pct = levelToPercent(skill.level);
              return (
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
                    <span style={{ display: 'block', height: '3px', borderRadius: '100px', background: 'var(--border)', marginTop: '0.375rem', overflow: 'hidden' }}>
                      <motion.span
                        style={{ display: 'block', height: '100%', borderRadius: '100px', background: 'var(--accent)' }}
                        initial={{ width: seen ? `${pct}%` : 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                        onAnimationComplete={markSeen}
                      />
                    </span>
                  </div>
                  <ExternalLink style={{ width: '0.75rem', height: '0.75rem', color: 'var(--text-muted)', opacity: 0, flexShrink: 0, transition: 'opacity 0.2s' }} className="skill-ext" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
