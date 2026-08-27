import React from 'react';
import {
  FaReact, FaNodeJs, FaPhp, FaDocker, FaPython,
  FaHtml5, FaCss3Alt, FaJs, FaGithub, FaWordpress,
} from 'react-icons/fa';
import {
  SiNextdotjs, SiNestjs, SiTailwindcss, SiMaterialdesign,
  SiPostgresql, SiMysql, SiMongodb, SiPrisma,
} from 'react-icons/si';
import {
  Code2, Server, Database, Box,
  Github, Linkedin, Mail, Twitter, Globe, Link as LinkIcon,
} from 'lucide-react';

/**
 * Icon registry — replaces the inline JSX icons from the Vite app.
 * The DB stores a string key (Skill.icon, SocialLink.icon); these maps
 * resolve the key back to the exact same icon component used before.
 * Plain module (no hooks) so it is safe in both server and client components.
 */

// ── Skill icons (react-icons) ──
const skillIconMap: Record<string, React.ReactNode> = {
  react: <FaReact />,
  nextjs: <SiNextdotjs />,
  javascript: <FaJs />,
  html5: <FaHtml5 />,
  css3: <FaCss3Alt />,
  tailwind: <SiTailwindcss />,
  materialui: <SiMaterialdesign />,
  nodejs: <FaNodeJs />,
  nestjs: <SiNestjs />,
  php: <FaPhp />,
  python: <FaPython />,
  github: <FaGithub />,
  postgresql: <SiPostgresql />,
  mysql: <SiMysql />,
  mongodb: <SiMongodb />,
  prisma: <SiPrisma />,
  docker: <FaDocker />,
  wordpress: <FaWordpress />,
};

// Keys offered in the admin skill form dropdown.
export const SKILL_ICON_KEYS = Object.keys(skillIconMap);

export function getSkillIcon(key: string): React.ReactNode {
  return skillIconMap[key] ?? <Code2 />;
}

// ── Category tab icons (lucide) — matches the original Hero tabs ──
const categoryIconMap: Record<string, (size: number) => React.ReactNode> = {
  Frontend: (s) => <Code2 size={s} />,
  Backend: (s) => <Server size={s} />,
  Database: (s) => <Database size={s} />,
  DevOps: (s) => <Box size={s} />,
};

export function getCategoryIcon(label: string, size = 16): React.ReactNode {
  const fn = categoryIconMap[label];
  return fn ? fn(size) : <Code2 size={size} />;
}

// ── Social icons (lucide) — used by Navbar, HeroIntro, SiteFooter ──
const socialIconMap: Record<string, (className: string) => React.ReactNode> = {
  github: (c) => <Github className={c} />,
  linkedin: (c) => <Linkedin className={c} />,
  mail: (c) => <Mail className={c} />,
  email: (c) => <Mail className={c} />,
  twitter: (c) => <Twitter className={c} />,
  website: (c) => <Globe className={c} />,
};

export const SOCIAL_ICON_KEYS = Object.keys(socialIconMap);

export function getSocialIcon(key: string, className = 'w-4 h-4'): React.ReactNode {
  const fn = socialIconMap[key.toLowerCase()];
  return fn ? fn(className) : <LinkIcon className={className} />;
}
