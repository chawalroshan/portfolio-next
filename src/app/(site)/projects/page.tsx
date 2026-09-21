import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { CardBody } from '@/components/site/Projects';
import { getPublishedProjects } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'All projects — selected work, experiments and client builds.',
};

/**
 * /projects — full archive. Uniform two-column grid (no featured treatment;
 * that belongs to the home section). Cards reuse the home CardBody so both
 * stay visually identical. Static, revalidated via cache tags on publish.
 */
export default async function ProjectsIndexPage() {
  const projects = await getPublishedProjects();

  return (
    <main style={{ fontFamily: "'Manrope', sans-serif", minHeight: '100vh' }}>
      <section style={{ maxWidth: '72rem', margin: '0 auto', padding: '7rem 1.5rem 5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.5rem', fontWeight: 600 }}>My Work</p>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
            All Projects
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
            {projects.length} {projects.length === 1 ? 'project' : 'projects'} — selected work and experiments.
          </p>
        </div>

        {projects.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9375rem' }}>Projects coming soon.</p>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="project-card"
                style={{ display: 'flex', flexDirection: 'column', borderRadius: '1.125rem', background: 'var(--card-bg)', border: '1px solid var(--border)', overflow: 'hidden', textDecoration: 'none' }}
              >
                {project.imageUrl && (
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', overflow: 'hidden', background: 'var(--bg-tertiary)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={project.imageUrl} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                )}
                <CardBody
                  project={{
                    id: project.id,
                    title: project.title,
                    slug: project.slug,
                    description: project.description,
                    techStack: project.techStack,
                    imageUrl: project.imageUrl,
                  }}
                />
              </Link>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2.5rem' }}>
          <Link
            href="/#projects"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none' }}
          >
            <ArrowUpRight style={{ width: '1rem', height: '1rem', transform: 'rotate(135deg)', color: 'var(--accent)' }} />
            Back home
          </Link>
        </div>
      </section>
    </main>
  );
}
