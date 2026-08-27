'use client';

import { useState } from 'react';
import Navbar from './Navbar';
import type { SocialLink } from '@/types';

/**
 * Client shell that owns theme + mobile-menu state (previously App.jsx).
 * The `.app dark|light` wrapper drives all CSS variables. Server-rendered
 * page content is passed through as {children}, so data still comes from
 * Server Components — this shell only adds interactivity.
 */
export default function ThemeShell({
  logoName,
  socials,
  children,
}: {
  logoName: string;
  socials: SocialLink[];
  children: React.ReactNode;
}) {
  const [isDark, setIsDark] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleTheme = () => setIsDark((v) => !v);

  return (
    <div className={`app ${isDark ? 'dark' : 'light'}`}>
      <Navbar
        isDark={isDark}
        toggleTheme={toggleTheme}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        logoName={logoName}
        socials={socials}
      />
      {children}
    </div>
  );
}
