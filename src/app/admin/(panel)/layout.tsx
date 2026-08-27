import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import AdminNav from '@/components/admin/AdminNav';
import { page, container } from '@/components/admin/styles';

/**
 * Layout for the authenticated admin panel (route group "(panel)" — does not
 * affect the URL, so pages here are still /admin, /admin/projects, …). The
 * login page lives outside this group, so it never renders AdminNav.
 *
 * Middleware already gates /admin, but we re-check here so the panel never
 * renders for an anonymous request, and so child pages can rely on a session.
 */
export const dynamic = 'force-dynamic';

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/admin/login');

  return (
    <div style={page}>
      <AdminNav />
      <main style={container}>{children}</main>
    </div>
  );
}
