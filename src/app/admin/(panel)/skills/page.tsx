import { getAllSkills } from '@/lib/admin-data';
import SkillManager from '@/components/admin/SkillManager';

export const dynamic = 'force-dynamic';

export default async function AdminSkillsPage() {
  const skills = await getAllSkills();
  return (
    <SkillManager
      initial={skills.map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        icon: s.icon,
        level: s.level,
        url: s.url,
        published: s.published,
      }))}
    />
  );
}
