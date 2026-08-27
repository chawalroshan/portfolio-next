import Link from 'next/link';
import { FolderKanban, FileText, Wrench, User, ArrowUpRight } from 'lucide-react';
import { getAdminCounts } from '@/lib/admin-data';
import { card, mutedText, FONT } from '@/components/admin/styles';

export const dynamic = 'force-dynamic';

/**
 * Admin dashboard — quick counts and shortcuts into each content type.
 */
export default async function AdminDashboardPage() {
  const counts = await getAdminCounts();

  const cards = [
    { href: '/admin/projects', label: 'Projects', count: counts.projects, icon: FolderKanban, hint: 'Manage & reorder your work' },
    { href: '/admin/blogs', label: 'Blog posts', count: counts.blogs, icon: FileText, hint: 'Write and publish articles' },
    { href: '/admin/skills', label: 'Skills', count: counts.skills, icon: Wrench, hint: 'Grouped into home-page tabs' },
    { href: '/admin/profile', label: 'Profile', count: null, icon: User, hint: 'Bio, contact & social links' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>Dashboard</h1>
        <p style={{ ...mutedText, marginTop: '0.3rem' }}>Manage everything that appears on your portfolio.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {cards.map(({ href, label, count, icon: Icon, hint }) => (
          <Link key={href} href={href} style={{ ...card, textDecoration: 'none', color: 'var(--text-primary)', display: 'block', transition: 'transform 0.2s ease' }} className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ display: 'inline-flex', padding: '0.6rem', borderRadius: '0.7rem', background: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)' }}>
                <Icon className="w-5 h-5" />
              </span>
              <ArrowUpRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 800, margin: '0.9rem 0 0', fontFamily: FONT, letterSpacing: '-0.03em' }}>
              {count === null ? '—' : count}
            </p>
            <p style={{ fontWeight: 700, margin: '0.1rem 0 0' }}>{label}</p>
            <p style={{ ...mutedText, margin: '0.15rem 0 0' }}>{hint}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
