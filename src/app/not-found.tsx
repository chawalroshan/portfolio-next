import Link from 'next/link';

/**
 * Global 404. Rendered inside the root layout (no navbar). CSS variables
 * resolve from :root (dark theme) so it stays on-brand.
 */
export default function NotFound() {
  return (
    <main
      style={{
        fontFamily: "'Manrope', sans-serif",
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600 }}>404</p>
      <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>Page not found</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '40ch' }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', padding: '0.75rem 1.5rem', borderRadius: '100px', background: 'var(--accent)', color: '#fff', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}
      >
        Back home
      </Link>
    </main>
  );
}
