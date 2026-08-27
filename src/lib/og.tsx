import { ImageResponse } from 'next/og';
import { SITE_NAME } from '@/lib/site-config';

/**
 * Shared Open Graph image renderer used by the root, project and blog
 * opengraph-image routes. Uses ImageResponse (next/og) with the default
 * font — no external font fetch, so it works offline and at build time.
 * Runs on the Node runtime (these routes read from Prisma).
 */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

export function renderOg({ title, subtitle, tag }: { title: string; subtitle?: string; tag?: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          background: '#0b0b1a',
          backgroundImage: 'radial-gradient(ellipse at 30% 20%, rgba(168,85,247,0.35), transparent 55%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex' }}>
          {tag ? (
            <div
              style={{
                display: 'flex',
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: 4,
                textTransform: 'uppercase',
                color: '#c084fc',
                border: '1px solid rgba(168,85,247,0.4)',
                borderRadius: 100,
                padding: '8px 24px',
              }}
            >
              {tag}
            </div>
          ) : (
            <div style={{ display: 'flex' }} />
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 72, fontWeight: 800, color: '#ffffff', lineHeight: 1.1, letterSpacing: -2 }}>
            {title}
          </div>
          {subtitle ? (
            <div style={{ display: 'flex', marginTop: 24, fontSize: 32, color: '#9ca3af', lineHeight: 1.4 }}>
              {subtitle}
            </div>
          ) : null}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', fontSize: 28, fontWeight: 700, color: '#a855f7' }}>
          {SITE_NAME}
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
