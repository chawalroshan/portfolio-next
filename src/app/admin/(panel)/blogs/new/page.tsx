import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import BlogForm from '@/components/admin/BlogForm';
import { ghostButton } from '@/components/admin/styles';

export const dynamic = 'force-dynamic';

export default function NewBlogPage() {
  return (
    <div>
      <Link href="/admin/blogs" style={{ ...ghostButton, textDecoration: 'none', marginBottom: '1.25rem' }}>
        <ArrowLeft size={15} /> Back to blog
      </Link>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 1.25rem' }}>New post</h1>
      <BlogForm />
    </div>
  );
}
