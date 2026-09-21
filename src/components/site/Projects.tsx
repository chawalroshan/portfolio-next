import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

/**
 * Projects — Server Component. Data comes from the DB (published projects,
 * ordered). Each card links to the /projects/[slug] detail route.
 *
 * Motion policy: no hover lifts anywhere. The featured (first) project is
 * distinguished by LAYOUT — full-width, horizontal on desktop — not by
 * animation. The arrow nudge on hover is the only motion, and it exists
 * to invite the click.
 */
type ProjectCard = {
  id: string;
  title: string;
  slug: string;
  description: string;
  techStack: string[];
  imageUrl: string | null;
};

export function CardBody({ project }: { project: ProjectCard }) {
  return (
    <div
      className="project-featured-body"
      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.5rem' }}
    >
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
  );
}

export default function Projects({ projects }: { projects: ProjectCard[] }) {
  // Home shows at most 3 (1 featured + 2). Overflow lives on /projects.
  const visible = projects.slice(0, 3);
  const [featured, ...rest] = visible;

  return (
    <section id="projects" style={{ maxWidth: '72rem', margin: '0 auto', padding: '5rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.5rem', fontWeight: 600 }}>My Work</p>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>Projects</h2>
      </div>

      {projects.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9375rem' }}>Projects coming soon.</p>
      ) : (
        <div className="projects-grid">
          {featured && (
            <Link
              key={featured.id}
              href={`/projects/${featured.slug}`}
              className="project-card project-featured"
              style={{ display: 'flex', flexDirection: 'column', borderRadius: '1.125rem', background: 'var(--card-bg)', border: '1px solid var(--border)', overflow: 'hidden', textDecoration: 'none' }}
            >
              {featured.imageUrl && (
                <div className="project-featured-media" style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', overflow: 'hidden', background: 'var(--bg-tertiary)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={featured.imageUrl} alt={featured.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              )}
              <CardBody project={featured} />
            </Link>
          )}
          {rest.map((project) => (
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
              <CardBody project={project} />
            </Link>
          ))}
        </div>
      )}
      {projects.length > 3 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2.5rem' }}>
          <Link
            href="/projects"
            className="hero-cta-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem', borderRadius: '100px', border: '1px solid var(--accent-border)', background: 'var(--accent-subtle)', color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 700, textDecoration: 'none', transition: 'background 0.25s ease, border-color 0.25s ease' }}
          >
            View all projects
            <ArrowUpRight style={{ width: '1rem', height: '1rem', color: 'var(--accent)' }} />
          </Link>
        </div>
      )}
    </section>
  );
}
