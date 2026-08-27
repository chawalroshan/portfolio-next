import { Layers, CheckCircle2, Globe } from 'lucide-react';

/**
 * About — Server Component. Bio text comes from Profile (DB).
 * Stats: "Projects Completed" is derived from the live published-project
 * count; "Years Experience" and "Client Satisfaction" are not modelled in
 * the schema, so they remain static presentational values (unchanged from
 * the original design). Hover lift moved to the `.stat-card` CSS class so
 * this stays a Server Component (no inline onMouseEnter handlers).
 */
type AboutProps = {
  bio: string;
  bioSecondary: string | null;
  projectCount: number;
};

export default function About({ bio, bioSecondary, projectCount }: AboutProps) {
  const stats = [
    { label: 'Years Experience', value: '2+', icon: <Layers className="w-5 h-5" /> },
    { label: 'Projects Completed', value: `${projectCount}+`, icon: <CheckCircle2 className="w-5 h-5" /> },
    { label: 'Client Satisfaction', value: '100%', icon: <Globe className="w-5 h-5" /> },
  ];

  return (
    <section id="about" style={{ maxWidth: '72rem', margin: '0 auto', padding: '5rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.5rem', fontWeight: 600 }}>My Intro</p>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>About Me</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="stat-card"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 1.25rem', borderRadius: '1.125rem', background: 'var(--card-bg)', border: '1px solid var(--border)', width: '148px', cursor: 'default' }}
            >
              <div style={{ color: 'var(--accent)', marginBottom: '0.75rem' }}>{stat.icon}</div>
              <span style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{stat.value}</span>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem', textAlign: 'center', fontWeight: 500 }}>{stat.label}</p>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.9375rem', maxWidth: '48ch' }}>
            {bio}
          </p>
          {bioSecondary && (
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '0.9375rem', maxWidth: '48ch' }}>
              {bioSecondary}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
