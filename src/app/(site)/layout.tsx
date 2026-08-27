import ThemeShell from '@/components/site/ThemeShell';
import { getProfile } from '@/lib/data';
import { SITE_NAME } from '@/lib/site-config';

/**
 * (site) route-group layout — applies the theme + navbar chrome to all public
 * pages (home, projects, blog). Admin routes live outside this group, so they
 * don't inherit the navbar. Profile (logo name + social links) is fetched on
 * the server and handed to the client ThemeShell.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  const name = profile?.name ?? SITE_NAME;
  const logoName = name.split(' ')[0]; // original navbar showed the first name ("Roshan")
  const socials = profile?.socialLinks ?? [];

  return (
    <ThemeShell logoName={logoName} socials={socials}>
      {children}
    </ThemeShell>
  );
}
