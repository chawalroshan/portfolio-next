import { getSocialIcon } from '@/lib/icons';
import type { SocialLink } from '@/types';

/**
 * SiteFooter — Server Component. Copyright name + social links come from the
 * Profile row; the year is computed at render. Hover color is handled by the
 * `.footer-social` CSS class so no client JS is needed here.
 */
export default function SiteFooter({ name, socials }: { name: string; socials: SocialLink[] }) {
  const year = new Date().getFullYear();

  return (
    <footer style={{ maxWidth: '72rem', margin: '0 auto', padding: '2rem 1.5rem', borderTop: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>© {year} {name}. All rights reserved.</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {socials.map(({ url, label, icon }) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="footer-social"
              style={{ textDecoration: 'none', display: 'flex' }}
            >
              {getSocialIcon(icon, 'w-4 h-4')}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
