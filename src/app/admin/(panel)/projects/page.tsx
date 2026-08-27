import { getAllProjects } from '@/lib/admin-data';
import ProjectList from '@/components/admin/ProjectList';

export const dynamic = 'force-dynamic';

export default async function AdminProjectsPage() {
  const projects = await getAllProjects();
  return (
    <ProjectList
      initial={projects.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        published: p.published,
        techStack: p.techStack,
      }))}
    />
  );
}
