'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, FolderKanban, FileText, Wrench, User, LogOut, ExternalLink } from 'lucide-react';
import { FONT } from './styles';

/**
 * Admin top navigation. Client component because it reads the active pathname
 * and calls signOut(). Rendered by the (panel) layout above every admin page.
 */

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { href: '/admin/blogs', label: 'Blog', icon: FileText },
  { href: '/admin/skills', label: 'Skills', icon: Wrench },
  { href: '/admin/profile', label: 'Profile', icon: User },
];

export default function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        background: 'color-mix(in srgb, var(--bg-primary) 88%, transparent)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <nav
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: '0.85rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          fontFamily: FONT,
        }}
      >
        <Link
          href="/admin"
          style={{ fontWeight: 800, letterSpacing: '-0.03em', fontSize: '1rem', color: 'var(--text-primary)', textDecoration: 'none' }}
        >
          Roshan<span style={{ color: 'var(--accent)' }}>.</span>
        </Link>

        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', flex: 1 }}>
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.8rem',
                  borderRadius: '100px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: active ? '#fff' : 'var(--text-muted)',
                  background: active ? 'var(--accent)' : 'transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon className="w-4 h-4" /> {label}
              </Link>
            );
          })}
        </div>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'none' }}
        >
          <ExternalLink className="w-4 h-4" /> View site
        </a>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.9rem',
            borderRadius: '100px',
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            fontFamily: FONT,
            cursor: 'pointer',
          }}
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </nav>
    </header>
  );
}
