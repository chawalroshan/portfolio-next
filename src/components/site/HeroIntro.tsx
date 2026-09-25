'use client';

import dynamic from 'next/dynamic';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Download, User } from 'lucide-react';
import { getSocialIcon } from '@/lib/icons';
import { safeHref } from '@/lib/safe-url';
import type { SocialLink } from '@/types';

/**
 * HeroIntro — the signature moment of the site. One orchestrated load
 * sequence (blur-rise, staggered once) over a cursor-reactive 3D field.
 * Nothing here loops: the canvas drifts with the cursor, the intro plays
 * once, the portrait and rails are static. Reduced-motion users get a
 * static gradient backdrop and instantly-rendered content.
 */

const HeroScene = dynamic(() => import('./HeroScene'), {
  ssr: false,
  loading: () => <StaticBackdrop />,
});

function StaticBackdrop() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(ellipse 60% 50% at 50% 30%, var(--accent-subtle) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}
    />
  );
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 26, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

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
  const reduce = useReducedMotion();

  const handleDownload = () => {
    window.open(
      safeHref(resumeUrl, '/images/ROSHAN-CHAWAL-SD-Resume.pdf'),
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Manrope', sans-serif",
      }}
    >
      {/* 3D field (lazy, client-only) or static gradient when reduced motion */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {reduce ? <StaticBackdrop /> : <HeroScene />}
      </div>

      <motion.div
        variants={container}
        initial={reduce ? 'show' : 'hidden'}
        animate="show"
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '72rem',
          margin: '0 auto',
          padding: '7rem 1.5rem 5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <motion.p
          variants={rise}
          style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.75rem', fontWeight: 600 }}
        >
          Hello, I&apos;m
        </motion.p>
        <motion.h1
          variants={rise}
          style={{ fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.1 }}
        >
          {name}
        </motion.h1>
        <motion.p
          variants={rise}
          style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', marginBottom: '2.25rem', fontWeight: 400 }}
        >
          {title}
        </motion.p>

        <motion.div
          variants={rise}
          style={{ display: 'flex', gap: '0.875rem', marginBottom: '3.5rem', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <button
            onClick={handleDownload}
            className="hero-cta-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '100px', border: '1px solid var(--accent-border)', background: 'var(--accent-subtle)', color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Manrope', sans-serif", transition: 'background 0.25s ease, color 0.25s ease, border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease' }}
          >
            <Download className="w-4 h-4" /> Download CV
          </button>
          <a
            href="#about"
            className="hero-cta-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '100px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', transition: 'border-color 0.25s ease, color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease' }}
          >
            <User className="w-4 h-4" /> About me
          </a>
        </motion.div>

        {/* Portrait — static, demoted. The 3D field is the visual, not the photo. */}
        <motion.div variants={rise} className="hero-portrait" style={{ position: 'relative', display: 'inline-block' }}>
          <div className="hero-socials hero-rail" style={{ position: 'absolute', left: '-60px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '0.625rem', zIndex: 20 }}>
            {socials.map((s) => (
              <a
                key={s.label}
                href={safeHref(s.url)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="hero-rail-link"
                style={{ background: RAIL_BG[s.icon.toLowerCase()] ?? 'var(--accent)', padding: '0.5625rem', borderRadius: '0.625rem', color: '#fff', display: 'flex', textDecoration: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}
              >
                {getSocialIcon(s.icon, 'w-4 h-4')}
              </a>
            ))}
          </div>

          <div className="hero-scroll" style={{ position: 'absolute', right: '-64px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 20 }}>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', writingMode: 'vertical-lr', fontWeight: 600 }}>Scroll</span>
            <div style={{ width: '1px', height: '48px', background: 'linear-gradient(to bottom, var(--accent), transparent)' }} />
          </div>

          <div style={{ position: 'relative', width: '13rem', height: '15.5rem', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: 'inset 0 0 0 1px var(--accent-border)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profileImage} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 55%, var(--bg-primary))', pointerEvents: 'none' }} />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
