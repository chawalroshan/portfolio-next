import styles from './Footer.module.css';

/**
 * LEGACY — ported 1:1 from the original Vite app (src/components/Footer).
 * It was NOT mounted in the old App.jsx (the footer was commented out), so
 * it is kept here for parity but is intentionally not rendered anywhere.
 * The live footer is components/site/SiteFooter.tsx.
 *
 * CSS is now a CSS Module (Next's App Router only allows global CSS in the
 * root layout; component-scoped CSS must be a *.module.css import).
 */
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles['footer-container']}>
        <p className={styles['footer-text']}>
          © {new Date().getFullYear()} Roshan Chawal . All rights reserved.
        </p>
      </div>
    </footer>
  );
}
