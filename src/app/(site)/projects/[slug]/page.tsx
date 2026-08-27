import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, ExternalLink, Github } from 'lucide-react';
import { getProjectBySlug, getPublishedProjectSlugs } from '@/lib/data';

/**
 * Project detail — /projects/[slug]. Statically generated for every published
 * slug (generateStaticParams) and revalidated by tag when an admin edits a
 * project (actions call revalidatePath('/projects/[slug]')). New slugs render
 * on-demand thanks to dynamicParams, with a 1-hour ISR fallback.
 */
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getPublishedProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);
  if (!project) return { title: 'Project not found' };
  return {
    title: project.title,
    description: project.description,
    openGraph: { title: project.title, description: project.description, type: 'article' },
  };
}

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const project = await getProjectBySlug(params.slug);
  if (!project) notFound();

  return (
    <main style={{ fontFamily: "'Manrope', sans-serif", maxWidth: '48rem', margin: '0 auto', padding: '7rem 1.5rem 5rem' }}>
      <Link
        href="/#projects"
        className="nav-link"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '2rem' }}
      >
        <ArrowLeft className="w-4 h-4" /> Back to projects
      </Link>

      <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.15 }}>
        {project.title}
      </h1>

      {project.techStack.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '2rem' }}>
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

      {project.imageUrl && (
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', borderRadius: '1.125rem', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '2rem', background: 'var(--bg-tertiary)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={project.imageUrl} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}

      <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '2.5rem', whiteSpace: 'pre-line' }}>
        {project.description}
      </p>

      {(project.liveUrl || project.repoUrl) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem' }}>
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '100px', border: '1px solid var(--accent)', background: 'var(--accent)', color: '#fff', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}
            >
              <ExternalLink className="w-4 h-4" /> Live demo
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '100px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}
            >
              <Github className="w-4 h-4" /> Source code
            </a>
          )}
        </div>
      )}
    </main>
  );
}
