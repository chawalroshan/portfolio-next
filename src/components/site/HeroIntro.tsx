'use client';

import { useEffect, useState } from 'react';
import { Download, User } from 'lucide-react';
import { getSocialIcon } from '@/lib/icons';
import type { SocialLink } from '@/types';

const RAIL_BG: Record<string, string> = {
  linkedin: '#0077b5',
  github: '#24292e',
  mail: 'var(--accent)',
  email: 'var(--accent)',
};

type HeroIntroProps = {
  name: string;
  title: string;
  resumeUrl: string | null;
  socials: SocialLink[];
  profileImage: string;
};

export default function HeroIntro({ name, title, resumeUrl, socials, profileImage }: HeroIntroProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const fadeStyle = (delay = 0): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
  });

  const handleDownload = () => {
    window.open(resumeUrl || '/images/ROSHAN-CHAWAL-SD-Resume.pdf', '_blank');
  };

  return (
    <section style={{ maxWidth: '72rem', margin: '0 auto', padding: '7rem 1.5rem 5rem', position: 'relative', fontFamily: "'Manrope', sans-serif" }}>
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          height: '400px',
          background: 'radial-gradient(ellipse, var(--accent-subtle) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'pulseGlow 4s ease-in-out infinite',
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <p style={{ ...fadeStyle(0.1), fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.75rem', fontWeight: 600 }}>
          Hello, I&apos;m
        </p>
        <h1 style={{ ...fadeStyle(0.2), fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.1 }}>
          {name}
        </h1>
        <p style={{ ...fadeStyle(0.3), fontSize: '1.0625rem', color: 'var(--text-secondary)', marginBottom: '2.25rem', fontWeight: 400 }}>
          {title}
        </p>

        <div style={{ ...fadeStyle(0.4), display: 'flex', gap: '0.875rem', marginBottom: '4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={handleDownload}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '100px', border: '1px solid var(--accent-border)', background: 'var(--accent-subtle)', color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Manrope', sans-serif", transition: 'all 0.25s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(168,85,247,0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent-subtle)'; e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <Download className="w-4 h-4" /> Download CV
          </button>
          <a
            href="#about"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '100px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', transition: 'all 0.25s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <User className="w-4 h-4" /> About me
          </a>
        </div>

        {/* Profile image block */}
        <div style={{ ...fadeStyle(0.5), position: 'relative', display: 'inline-block' }}>
          {/* Socials left */}
          <div className="hero-socials" style={{ position: 'absolute', left: '-60px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '0.625rem', zIndex: 20 }}>
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                style={{ background: RAIL_BG[s.icon.toLowerCase()] ?? 'var(--accent)', padding: '0.5625rem', borderRadius: '0.625rem', color: '#fff', display: 'flex', textDecoration: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.25)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.12)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.3)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)'; }}
              >
                {getSocialIcon(s.icon, 'w-4 h-4')}
              </a>
            ))}
          </div>

          {/* Scroll right */}
          <div className="hero-scroll" style={{ position: 'absolute', right: '-64px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 20 }}>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', writingMode: 'vertical-lr', fontWeight: 600 }}>Scroll</span>
            <div style={{ width: '1px', height: '48px', background: 'linear-gradient(to bottom, var(--accent), transparent)', animation: 'scrollPulse 2s ease-in-out infinite' }} />
          </div>

          {/* Image */}
          <div style={{ position: 'relative', width: '17rem', height: '20rem', borderRadius: '1.5rem', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: '-1rem', background: 'radial-gradient(ellipse, var(--accent-border) 0%, transparent 70%)', borderRadius: '2rem', zIndex: -1, animation: 'pulseGlow 3s ease-in-out infinite' }} />
            {/* Plain <img> (not next/image) to preserve the exact object-fit/gradient overlay markup. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profileImage} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, var(--bg-primary))', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: '1.5rem', boxShadow: 'inset 0 0 0 1px var(--accent-border)', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>
    </section>
  );
}
