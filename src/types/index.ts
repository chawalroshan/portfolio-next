// Shared types used across server and client components.

export type SocialLink = {
  label: string;
  url: string;
  icon: string; // registry key resolved in src/lib/icons.tsx (e.g. "github")
};

// A single skill as rendered on the public site.
export type SkillItem = {
  id: string;
  name: string;
  icon: string; // registry key
  level: string;
  url: string | null;
};

// Skills grouped by category for the tabbed UI.
export type SkillGroup = {
  label: string; // category name, e.g. "Frontend"
  skills: SkillItem[];
};
