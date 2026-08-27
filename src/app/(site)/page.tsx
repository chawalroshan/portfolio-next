import HeroIntro from '@/components/site/HeroIntro';
import About from '@/components/site/About';
import Skills from '@/components/site/Skills';
import Projects from '@/components/site/Projects';
import Contact from '@/components/site/Contact';
import SiteFooter from '@/components/site/SiteFooter';
import {
  getProfile,
  getSkillsGrouped,
  getPublishedProjects,
  getPublishedProjectCount,
} from '@/lib/data';
import { SITE_NAME, SITE_TITLE_FALLBACK } from '@/lib/site-config';

/**
 * Home page — Server Component. All data is fetched here (in parallel) and
 * passed down as props, so the interactive client components never fetch on
 * their own (no client-side waterfalls). The page is static and refreshed
 * via cache tags whenever an admin mutation calls revalidateTag().
 *
 * NOTE: the hero profile photo is a static asset (/images/profile.jpg). The
 * Profile model doesn't include an avatar field (per spec: name, title, bio,
 * resumeUrl, socialLinks), so the image is intentionally not DB-driven.
 */
export default async function HomePage() {
  const [profile, groups, projects, projectCount] = await Promise.all([
    getProfile(),
    getSkillsGrouped(),
    getPublishedProjects(),
    getPublishedProjectCount(),
  ]);

  const name = profile?.name ?? SITE_NAME;
  const title = profile?.title ?? SITE_TITLE_FALLBACK;
  const bio = profile?.bio ?? '';
  const socials = profile?.socialLinks ?? [];

  const projectCards = projects.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    description: p.description,
    techStack: p.techStack,
    imageUrl: p.imageUrl,
  }));

  return (
    <main style={{ fontFamily: "'Manrope', sans-serif", minHeight: '100vh' }}>
      <HeroIntro
        name={name}
        title={title}
        resumeUrl={profile?.resumeUrl ?? null}
        socials={socials}
        profileImage="/images/profile.jpg"
      />
      <About bio={bio} bioSecondary={profile?.bioSecondary ?? null} projectCount={projectCount} />
      <Skills groups={groups} />
      <Projects projects={projectCards} />
      <Contact email={profile?.email ?? null} />
      <SiteFooter name={name} socials={socials} />
    </main>
  );
}
