import type { CSSProperties } from 'react';

/**
 * Shared inline-style constants for the admin panel. Mirrors the aesthetic of
 * the login page (src/app/admin/login/page.tsx) and reuses the theme CSS
 * variables from globals.css. Kept as a plain module (no JSX) so it can be
 * imported by both server and client components without a bundler boundary.
 *
 * The admin routes render outside the .app theme wrapper, so :root (dark) is
 * in effect — matching the login screen.
 */

export const FONT = "'Manrope', sans-serif";

export const page: CSSProperties = {
  fontFamily: FONT,
  minHeight: '100vh',
  background: 'var(--bg-primary)',
  color: 'var(--text-primary)',
};

export const container: CSSProperties = {
  maxWidth: '960px',
  margin: '0 auto',
  padding: '2rem 1.5rem 4rem',
};

export const card: CSSProperties = {
  background: 'var(--card-bg)',
  border: '1px solid var(--border)',
  borderRadius: '1rem',
  padding: '1.5rem',
  boxShadow: 'var(--shadow)',
};

export const label: CSSProperties = {
  display: 'block',
  fontSize: '0.6875rem',
  color: 'var(--text-muted)',
  fontWeight: 600,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  marginBottom: '0.4rem',
};

export const input: CSSProperties = {
  width: '100%',
  padding: '0.7rem 0.9rem',
  borderRadius: '0.6rem',
  background: 'var(--input-bg)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  fontSize: '0.875rem',
  fontFamily: FONT,
  fontWeight: 500,
  outline: 'none',
  boxSizing: 'border-box',
};

export const textarea: CSSProperties = {
  ...input,
  minHeight: '110px',
  resize: 'vertical',
  lineHeight: 1.6,
};

export const primaryButton: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  padding: '0.7rem 1.4rem',
  borderRadius: '100px',
  background: 'var(--accent)',
  border: 'none',
  color: '#fff',
  fontSize: '0.875rem',
  fontWeight: 700,
  fontFamily: FONT,
  cursor: 'pointer',
  transition: 'opacity 0.2s ease',
};

export const ghostButton: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.45rem',
  padding: '0.6rem 1.1rem',
  borderRadius: '100px',
  background: 'transparent',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  fontSize: '0.8125rem',
  fontWeight: 600,
  fontFamily: FONT,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

export const dangerButton: CSSProperties = {
  ...ghostButton,
  color: '#f87171',
  borderColor: 'rgba(248,113,113,0.4)',
};

export const chip: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.35rem',
  padding: '0.25rem 0.6rem',
  borderRadius: '100px',
  background: 'var(--input-bg)',
  border: '1px solid var(--border)',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--text-primary)',
};

export const errorText: CSSProperties = {
  color: '#f87171',
  fontSize: '0.8125rem',
  margin: 0,
};

export const mutedText: CSSProperties = {
  color: 'var(--text-muted)',
  fontSize: '0.8125rem',
};
