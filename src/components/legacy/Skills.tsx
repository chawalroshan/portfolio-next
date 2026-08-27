'use client';

import { useState } from 'react';
import styles from './Skills.module.css';
import {
  FaReact, FaJs, FaNodeJs, FaHtml5, FaCss3Alt, FaGithub,
  FaPhp, FaWordpress, FaDocker, FaPython,
} from 'react-icons/fa';
import {
  SiNextdotjs, SiNestjs, SiTailwindcss, SiMaterialdesign,
  SiPostgresql, SiMysql, SiMongodb, SiPrisma,
} from 'react-icons/si';

/**
 * LEGACY — ported 1:1 from the original Vite app (src/components/Hero/Skills.jsx).
 * This standalone Skills grid was NOT mounted in the old app (Hero.jsx has its
 * own inline skills section). Kept here for parity; not rendered anywhere. The
 * live skills UI is components/site/Skills.tsx.
 *
 * Icons stay as direct react-icons imports (faithful port); the DB-driven
 * live version uses the icon registry instead. CSS is now a CSS Module.
 */
const categories = [
  {
    label: 'Frontend',
    emoji: '🎨',
    skills: [
      { name: 'React', icon: <FaReact />, href: 'https://react.dev/', cls: 'react' },
      { name: 'Next.js', icon: <SiNextdotjs />, href: 'https://nextjs.org/', cls: 'next' },
      { name: 'JavaScript', icon: <FaJs />, href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', cls: 'js' },
      { name: 'HTML', icon: <FaHtml5 />, href: 'https://developer.mozilla.org/en-US/docs/Web/HTML', cls: 'html' },
      { name: 'CSS', icon: <FaCss3Alt />, href: 'https://developer.mozilla.org/en-US/docs/Web/CSS', cls: 'css' },
      { name: 'Tailwind CSS', icon: <SiTailwindcss />, href: 'https://tailwindcss.com/', cls: 'tailwind' },
      { name: 'Material UI', icon: <SiMaterialdesign />, href: 'https://mui.com/', cls: 'mui' },
    ],
  },
  {
    label: 'Backend',
    emoji: '⚙️',
    skills: [
      { name: 'Node.js', icon: <FaNodeJs />, href: 'https://nodejs.org/', cls: 'node' },
      { name: 'NestJS', icon: <SiNestjs />, href: 'https://nestjs.com/', cls: 'nest' },
      { name: 'PHP', icon: <FaPhp />, href: 'https://www.php.net/', cls: 'php' },
      { name: 'Python', icon: <FaPython />, href: 'https://www.python.org/', cls: 'python' },
      { name: 'GitHub', icon: <FaGithub />, href: 'https://github.com/', cls: 'github' },
    ],
  },
  {
    label: 'Database',
    emoji: '🗄️',
    skills: [
      { name: 'PostgreSQL', icon: <SiPostgresql />, href: 'https://www.postgresql.org/', cls: 'postgres' },
      { name: 'MySQL', icon: <SiMysql />, href: 'https://www.mysql.com/', cls: 'mysql' },
      { name: 'MongoDB', icon: <SiMongodb />, href: 'https://www.mongodb.com/', cls: 'mongo' },
      { name: 'Prisma', icon: <SiPrisma />, href: 'https://www.prisma.io/', cls: 'prisma' },
    ],
  },
  {
    label: 'DevOps',
    emoji: '🐳',
    skills: [
      { name: 'Docker', icon: <FaDocker />, href: 'https://www.docker.com/', cls: 'docker' },
    ],
  },
];

// Referenced to keep the import parity with the original file.
void FaWordpress;

export default function Skills() {
  const [active, setActive] = useState('All');
  const tabs = ['All', ...categories.map((c) => c.label)];

  const filtered = active === 'All' ? categories : categories.filter((c) => c.label === active);

  return (
    <div className={styles.Skills__container}>
      <h1 className={styles.Skills__heading}>Skills</h1>

      <div className={styles.Skills__tabs}>
        {tabs.map((t) => (
          <button
            key={t}
            className={`${styles.Skills__tab} ${active === t ? styles.active : ''}`}
            onClick={() => setActive(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.map((cat) => (
        <div key={cat.label} className={styles.Skills__section}>
          <h2 className={styles.Skills__category}>{cat.emoji} {cat.label}</h2>
          <ul className={styles.Skills__list}>
            {cat.skills.map((sk) => (
              <li key={sk.name} className={`${styles.Skills__item} ${styles[`Skills__item--${sk.cls}`]}`}>
                <a href={sk.href} target="_blank" rel="noreferrer">
                  <span className={styles.Skills__icon}>{sk.icon}</span>
                  <span className={styles.Skills__name}>{sk.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
