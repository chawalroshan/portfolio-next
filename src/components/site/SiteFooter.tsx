import { getSocialIcon } from '@/lib/icons';
import type { SocialLink } from '@/types';

/**
 * SiteFooter — the underworld. The deeper you scroll, the hotter it gets:
 * char-black base, slow-drifting magma glow, a glowing crack seam on top,
 * and embers rising past the copyright. Pure CSS (no client JS), static
 * gradients when the user prefers reduced motion. Stays hell-dark in
 * both color modes — it's a place, not a theme.
 */

// Deterministic ember scatter: left %, size px, duration s, delay s.
const EMBERS: Array<[number, number, number, number]> = [
  [4, 4, 7, 0], [11, 3, 6, 1.2], [18, 5, 8, 0.4], [27, 3, 6.5, 2.1],
  [36, 4, 7.5, 0.8], [47, 3, 6, 1.6], [55, 5, 8.5, 0.2], [64, 3, 7, 2.4],
  [72, 4, 6.8, 1.0], [81, 3, 7.8, 0.6], [89, 4, 6.2, 1.9], [95, 3, 7.2, 0.1],
];

export default function SiteFooter({ name, socials }: { name: string; socials: SocialLink[] }) {
  const year = new Date().getFullYear();

  return (
    <footer className="lava-footer">
      {/* Magma glow field */}
      <div className="lava-glow" aria-hidden="true" />
      {/* Crack seam along the top edge */}
      <div className="lava-seam" aria-hidden="true" />
      {/* Rising embers */}
      <div className="lava-embers" aria-hidden="true">
        {EMBERS.map(([left, size, duration, delay], i) => (
          <span
            key={i}
            className="lava-ember"
            style={{
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
            }}
          />
        ))}
      </div>

      <div className="lava-inner">
        <p className="lava-line">{`> you scrolled all the way to hell — thanks for visiting`}</p>
        <div className="lava-row">
          <span className="lava-copy">
            © {year} <span className="lava-name">{name}</span>. All rights reserved.
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {socials.map(({ url, label, icon }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="footer-social lava-social"
                style={{ textDecoration: 'none', display: 'flex' }}
              >
                {getSocialIcon(icon, 'w-4 h-4')}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
