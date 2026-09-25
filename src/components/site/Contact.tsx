'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Mail, Copy, Check } from 'lucide-react';
import Snowfall from './Snowfall';

/**
 * Contact — client component (inputs use onFocus/onBlur styling + local state).
 * Mailto-only (no backend): the main button is a native <a href="mailto:...">
 * so the browser invokes the OS mail handler instead of a JS
 * `window.location.href` navigation (which Chrome turns into a blank tab when
 * no mail client is registered). Gmail / Outlook web-compose links + copy
 * are provided as fallbacks for visitors with no desktop mail app.
 */
export default function Contact({ email }: { email: string | null }) {
  const [name, setName] = useState('');
  const [mail, setMail] = useState('');
  const [project, setProject] = useState('');
  const [copied, setCopied] = useState(false);

  const to = (email ?? '').trim();
  const hasEmail = to.length > 0;

  const { mailtoHref, gmailHref, outlookHref } = useMemo(() => {
    const subject = `Project inquiry${name.trim() ? ` from ${name.trim()}` : ''}`;
    const body = `Name: ${name}\nEmail: ${mail}\n\n${project}`;
    const encSubject = encodeURIComponent(subject);
    const encBody = encodeURIComponent(body);
    const encTo = encodeURIComponent(to);
    return {
      mailtoHref: hasEmail ? `mailto:${encTo}?subject=${encSubject}&body=${encBody}` : '#contact',
      gmailHref: hasEmail
        ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encTo}&su=${encSubject}&body=${encBody}`
        : '#contact',
      outlookHref: hasEmail
        ? `https://outlook.live.com/owa/?path=/mail/action/compose&to=${encTo}&subject=${encSubject}&body=${encBody}`
        : '#contact',
    };
  }, [to, hasEmail, name, mail, project]);

  const handleCopy = async () => {
    if (!hasEmail) return;
    try {
      await navigator.clipboard.writeText(to);
    } catch {
      // Fallback for non-secure contexts: select via temp input.
      const el = document.createElement('input');
      el.value = to;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const labelStyle: React.CSSProperties = { position: 'absolute', top: '-9px', left: '12px', fontSize: '0.6875rem', color: 'var(--text-muted)', background: 'var(--card-bg)', padding: '0 4px', fontWeight: 600, letterSpacing: '0.05em', zIndex: 1 };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: "'Manrope', sans-serif", fontWeight: 500, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s' };

  return (
    <section id="contact" style={{ maxWidth: '72rem', margin: '0 auto', padding: '5rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
      <Snowfall />
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.5rem', fontWeight: 600 }}>Get in touch</p>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>Contact Me</h2>
      </div>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <div style={{ width: '132px', height: '132px', borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid var(--accent-border)', boxShadow: '0 0 32px rgba(63,185,80,0.25)' }}>
            <Image
              src="/images/chatbot.png"
              alt="Chatbot mascot"
              width={264}
              height={264}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        </div>
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
          <a
            href={mailtoHref}
            onClick={(e) => { if (!hasEmail) e.preventDefault(); }}
            aria-disabled={!hasEmail}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem', borderRadius: '100px', background: 'var(--accent)', border: 'none', color: '#fff', fontSize: '0.875rem', fontWeight: 700, fontFamily: "'Manrope', sans-serif", cursor: hasEmail ? 'pointer' : 'not-allowed', opacity: hasEmail ? 1 : 0.6, textDecoration: 'none', transition: 'all 0.25s ease' }}
            onMouseEnter={(e) => { if (!hasEmail) return; e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(63,185,80,0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <Mail className="w-4 h-4" /> Send Message
          </a>
        </div>
        {hasEmail ? (
          <p style={{ fontSize: '0.75rem', textAlign: 'center', color: 'var(--text-muted)', marginTop: '0.9rem', lineHeight: 1.6 }}>
            Opens your mail app addressed to {to}. No mail app installed?{' '}
            <a href={gmailHref} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>Open in Gmail</a>
            {' · '}
            <a href={outlookHref} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>Outlook</a>
            {' · '}
            <button
              type="button"
              onClick={handleCopy}
              style={{ background: 'none', border: 'none', padding: 0, color: 'var(--accent)', fontWeight: 700, fontSize: '0.75rem', fontFamily: "'Manrope', sans-serif", cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied!' : 'Copy email'}
            </button>
          </p>
        ) : (
          <p style={{ fontSize: '0.75rem', textAlign: 'center', color: 'var(--text-muted)', marginTop: '0.9rem' }}>
            Contact email isn&apos;t configured yet — set it in Admin → Profile.
          </p>
        )}
      </div>
    </section>
  );
}
