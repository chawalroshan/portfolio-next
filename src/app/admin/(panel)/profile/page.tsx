import { getProfileRow } from '@/lib/admin-data';
import ProfileForm from '@/components/admin/ProfileForm';
import type { SocialLink } from '@/components/admin/SocialLinksEditor';

export const dynamic = 'force-dynamic';

/** Coerce the JSON socialLinks column into the typed shape the form expects. */
function parseSocialLinks(value: unknown): SocialLink[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is Record<string, unknown> => typeof v === 'object' && v !== null)
    .map((v) => ({
      label: typeof v.label === 'string' ? v.label : '',
      url: typeof v.url === 'string' ? v.url : '',
      icon: typeof v.icon === 'string' ? v.icon : 'website',
    }));
}

export default async function AdminProfilePage() {
  const profile = await getProfileRow();

  return (
    <ProfileForm
      initial={{
        name: profile?.name ?? '',
        title: profile?.title ?? '',
        bio: profile?.bio ?? '',
        bioSecondary: profile?.bioSecondary ?? null,
        resumeUrl: profile?.resumeUrl ?? null,
        email: profile?.email ?? null,
        socialLinks: parseSocialLinks(profile?.socialLinks),
      }}
    />
  );
}
