import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

/**
 * Projects — NEW section (Server Component). The original Vite app had no
 * projects section, but the navbar links to /#projects, so this fills it.
 * Data comes from the DB (published projects, ordered). Each card links to
 * the /projects/[slug] detail route. Hover lift + arrow nudge live in the
 * `.project-card` CSS rules, so this remains a Server Component.
 */
type ProjectCard = {
  id: string;
  title: string;
  slug: string;
  description: string;
  techStack: string[];
  imageUrl: string | null;
};

export default function Projects({ projects }: { projects: ProjectCard[] }) {
  return (
    <section id="projects" style={{ maxWidth: '72rem', margin: '0 auto', padding: '5rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.5rem', fontWeight: 600 }}>My Work</p>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>Projects</h2>
      </div>

      {projects.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9375rem' }}>Projects coming soon.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{project.title}</h3>
                  <ArrowUpRight
                    className="project-arrow"
                    style={{ width: '1.125rem', height: '1.125rem', color: 'var(--accent)', flexShrink: 0, opacity: 0.6, transition: 'transform 0.2s ease, opacity 0.2s ease' }}
                  />
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {project.description}
                </p>
                {project.techStack.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--accent)', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', borderRadius: '100px', padding: '0.2rem 0.6rem' }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
