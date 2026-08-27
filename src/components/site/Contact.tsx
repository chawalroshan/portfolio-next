'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';

/**
 * Contact — client component (inputs use onFocus/onBlur styling + local state).
 * The original form was inert (the Send button had no handler). Since the
 * brief is "no separate backend", the button now composes a mailto: to the
 * profile email with the entered values — functional with zero server code.
 * If no email is configured, it falls back to inert (matches old behavior).
 * All styling is unchanged from the original design.
 */
export default function Contact({ email }: { email: string | null }) {
  const [name, setName] = useState('');
  const [mail, setMail] = useState('');
  const [project, setProject] = useState('');

  const handleSend = () => {
    if (!email) return;
    const subject = encodeURIComponent(`Project inquiry${name ? ` from ${name}` : ''}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${mail}\n\n${project}`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const labelStyle: React.CSSProperties = { position: 'absolute', top: '-9px', left: '12px', fontSize: '0.6875rem', color: 'var(--text-muted)', background: 'var(--card-bg)', padding: '0 4px', fontWeight: 600, letterSpacing: '0.05em', zIndex: 1 };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: "'Manrope', sans-serif", fontWeight: 500, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s' };

  return (
    <section id="contact" style={{ maxWidth: '72rem', margin: '0 auto', padding: '5rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.5rem', fontWeight: 600 }}>Get in touch</p>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>Contact Me</h2>
      </div>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Write me your project</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <label style={labelStyle}>Name</label>
            <input
              type="text"
              placeholder="Insert your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = 'var(--accent-border)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-subtle)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <label style={labelStyle}>Mail</label>
            <input
              type="email"
              placeholder="Insert your email"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = 'var(--accent-border)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-subtle)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <label style={labelStyle}>Project</label>
            <textarea
              placeholder="Write your project"
              rows={4}
              value={project}
              onChange={(e) => setProject(e.target.value)}
              style={{ ...inputStyle, resize: 'none' }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--accent-border)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-subtle)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
          <button
            onClick={handleSend}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem', borderRadius: '100px', background: 'var(--accent)', border: 'none', color: '#fff', fontSize: '0.875rem', fontWeight: 700, fontFamily: "'Manrope', sans-serif", cursor: 'pointer', transition: 'all 0.25s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(168,85,247,0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <Mail className="w-4 h-4" /> Send Message
          </button>
        </div>
      </div>
    </section>
  );
}
