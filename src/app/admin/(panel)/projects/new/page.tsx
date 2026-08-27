import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ProjectForm from '@/components/admin/ProjectForm';
import { ghostButton } from '@/components/admin/styles';

export const dynamic = 'force-dynamic';

export default function NewProjectPage() {
  return (
    <div>
      <Link href="/admin/projects" style={{ ...ghostButton, textDecoration: 'none', marginBottom: '1.25rem' }}>
        <ArrowLeft size={15} /> Back to projects
      </Link>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 1.25rem' }}>New project</h1>
      <ProjectForm />
    </div>
  );
}
