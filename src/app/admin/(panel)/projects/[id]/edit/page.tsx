import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getProjectById } from '@/lib/admin-data';
import ProjectForm from '@/components/admin/ProjectForm';
import { ghostButton } from '@/components/admin/styles';

export const dynamic = 'force-dynamic';

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const project = await getProjectById(params.id);
  if (!project) notFound();

  return (
    <div>
      <Link href="/admin/projects" style={{ ...ghostButton, textDecoration: 'none', marginBottom: '1.25rem' }}>
        <ArrowLeft size={15} /> Back to projects
      </Link>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 1.25rem' }}>Edit project</h1>
      <ProjectForm
        initial={{
          id: project.id,
          title: project.title,
          slug: project.slug,
          description: project.description,
          techStack: project.techStack,
          imageUrl: project.imageUrl,
          liveUrl: project.liveUrl,
          repoUrl: project.repoUrl,
          published: project.published,
        }}
      />
    </div>
  );
}
