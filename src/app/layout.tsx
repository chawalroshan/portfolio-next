import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { getProfile } from '@/lib/data';
import { SITE_NAME, SITE_TITLE_FALLBACK, SITE_URL } from '@/lib/site-config';
import './globals.css';

/**
 * Root layout — the ONLY place global CSS may be imported in the App Router.
 * Deliberately minimal: it renders <html>/<body>, loads the Manrope font (the
 * inline styles reference the literal 'Manrope' family, exactly as the Vite
 * app did), base SEO metadata, and Vercel Analytics. Theme/navbar chrome lives
 * in the (site) route-group layout so admin routes don't inherit it.
 */
export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const name = profile?.name ?? SITE_NAME;
  const title = profile?.title ?? SITE_TITLE_FALLBACK;
  const description = profile?.bio ?? `${name} — ${title}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${name} — ${title}`,
      template: `%s — ${name}`,
    },
    description,
    openGraph: {
      type: 'website',
      siteName: name,
      title: `${name} — ${title}`,
      description,
      url: SITE_URL,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} — ${title}`,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
